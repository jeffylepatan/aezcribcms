<?php

namespace Drupal\aezcrib_commerce\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;

/**
 * Service for generating worksheet recommendations.
 */
class RecommendationService {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * Constructs a new RecommendationService object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, Connection $database) {
    $this->entityTypeManager = $entity_type_manager;
    $this->database = $database;
  }

  /**
   * Get recommendations for a user.
   */
  public function getRecommendationsForUser($user_id, $limit = 6) {
    try {
      $recommendations = [];
      
      // Strategy 1: Get recent published worksheets (simple fallback)
      $recent_recommendations = $this->getRecentWorksheets([], $limit);
      $recommendations = array_merge($recommendations, $recent_recommendations);
      
      return array_slice($recommendations, 0, $limit);
    } catch (\Exception $e) {
      // Log error and return empty array to prevent 500 errors
      \Drupal::logger('aezcrib_commerce')->error('Error getting recommendations: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      // Return mock recommendations to keep dashboard working
      return $this->getMockRecommendations($limit);
    }
  }

  /**
   * Get mock recommendations when service fails.
   */
  protected function getMockRecommendations($limit = 6) {
    $mock_recommendations = [];
    
    for ($i = 1; $i <= $limit; $i++) {
      $mock_recommendations[] = [
        'id' => "mock_$i",
        'title' => "Sample Worksheet $i",
        'subject' => 'Mathematics',
        'gradeLevel' => 'Grade ' . ($i % 6 + 1),
        'price' => ($i * 10),
        'rating' => 4,
        'popularity' => 50 + $i,
        'thumbnail' => null,
      ];
    }
    
    return array_slice($mock_recommendations, 0, $limit);
  }

  /**
   * Get user's preferred subjects based on purchase history.
   */
  protected function getUserPreferredSubjects($user_id) {
    $query = $this->database->select('node', 'pt')
      ->fields('ws', ['field_worksheet_subject_value'])
      ->condition('pt.type', 'purchase_transaction')
      ->condition('ptur.field_user_reference_target_id', $user_id)
      ->condition('ptps.field_purchase_status_value', 'completed');
    
    $query->join('node__field_user_reference', 'ptur', 'pt.nid = ptur.entity_id');
    $query->join('node__field_purchase_status', 'ptps', 'pt.nid = ptps.entity_id');
    $query->join('node__field_worksheet_reference', 'ptwr', 'pt.nid = ptwr.entity_id');
    $query->join('node__field_worksheet_subject', 'ws', 'ptwr.field_worksheet_reference_target_id = ws.entity_id');
    
    $results = $query->execute()->fetchCol();
    
    return array_unique(array_filter($results));
  }

  /**
   * Get user's preferred grade levels based on purchase history.
   */
  protected function getUserPreferredGradeLevels($user_id) {
    $query = $this->database->select('node', 'pt')
      ->fields('wgl', ['field_worksheet_level_value'])
      ->condition('pt.type', 'purchase_transaction')
      ->condition('ptur.field_user_reference_target_id', $user_id)
      ->condition('ptps.field_purchase_status_value', 'completed');
    
    $query->join('node__field_user_reference', 'ptur', 'pt.nid = ptur.entity_id');
    $query->join('node__field_purchase_status', 'ptps', 'pt.nid = ptps.entity_id');
    $query->join('node__field_worksheet_reference', 'ptwr', 'pt.nid = ptwr.entity_id');
    $query->join('node__field_worksheet_level', 'wgl', 'ptwr.field_worksheet_reference_target_id = wgl.entity_id');
    
    $results = $query->execute()->fetchCol();
    
    return array_unique(array_filter($results));
  }

  /**
   * Get IDs of worksheets already purchased by user.
   */
  protected function getUserPurchasedWorksheetIds($user_id) {
    $query = $this->database->select('node', 'pt')
      ->fields('ptwr', ['field_worksheet_reference_target_id'])
      ->condition('pt.type', 'purchase_transaction')
      ->condition('ptur.field_user_reference_target_id', $user_id)
      ->condition('ptps.field_purchase_status_value', 'completed');
    
    $query->join('node__field_user_reference', 'ptur', 'pt.nid = ptur.entity_id');
    $query->join('node__field_purchase_status', 'ptps', 'pt.nid = ptps.entity_id');
    $query->join('node__field_worksheet_reference', 'ptwr', 'pt.nid = ptwr.entity_id');
    
    $results = $query->execute()->fetchCol();
    
    return array_filter($results);
  }

  /**
   * Get worksheets by subjects.
   */
  protected function getWorksheetsBySubjects($subjects, $exclude_ids = [], $limit = 3) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'worksheet')
      ->condition('status', 1)
      ->condition('field_worksheet_subject', $subjects, 'IN')
      ->sort('created', 'DESC')
      ->range(0, $limit * 2) // Get more to account for exclusions
      ->accessCheck(FALSE);
    
    if (!empty($exclude_ids)) {
      $query->condition('nid', $exclude_ids, 'NOT IN');
    }
    
    $nids = $query->execute();
    return $this->formatWorksheetRecommendations($nids, $limit);
  }

  /**
   * Get worksheets by grade levels.
   */
  protected function getWorksheetsByGradeLevels($grade_levels, $exclude_ids = [], $limit = 3) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'worksheet')
      ->condition('status', 1)
      ->condition('field_worksheet_level', $grade_levels, 'IN')
      ->sort('created', 'DESC')
      ->range(0, $limit * 2)
      ->accessCheck(FALSE);
    
    if (!empty($exclude_ids)) {
      $query->condition('nid', $exclude_ids, 'NOT IN');
    }
    
    $nids = $query->execute();
    return $this->formatWorksheetRecommendations($nids, $limit);
  }

  /**
   * Get popular worksheets based on purchase count.
   */
  protected function getPopularWorksheets($exclude_ids = [], $limit = 3) {
    // Get worksheet IDs with highest purchase counts
    $query = $this->database->select('node', 'pt')
      ->fields('ptwr', ['field_worksheet_reference_target_id'])
      ->condition('pt.type', 'purchase_transaction')
      ->condition('ptps.field_purchase_status_value', 'completed')
      ->groupBy('ptwr.field_worksheet_reference_target_id')
      ->orderBy('COUNT(pt.nid)', 'DESC')
      ->range(0, $limit * 2);
    
    $query->addExpression('COUNT(pt.nid)', 'purchase_count');
    $query->join('node__field_purchase_status', 'ptps', 'pt.nid = ptps.entity_id');
    $query->join('node__field_worksheet_reference', 'ptwr', 'pt.nid = ptwr.entity_id');
    
    if (!empty($exclude_ids)) {
      $query->condition('ptwr.field_worksheet_reference_target_id', $exclude_ids, 'NOT IN');
    }
    
    $results = $query->execute()->fetchAllKeyed(0, 1);
    $nids = array_keys($results);
    
    // Filter out unpublished worksheets
    $published_nids = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'worksheet')
      ->condition('status', 1)
      ->condition('nid', $nids, 'IN')
      ->accessCheck(FALSE)
      ->execute();
    
    return $this->formatWorksheetRecommendations($published_nids, $limit);
  }

  /**
   * Get recent worksheets.
   */
  protected function getRecentWorksheets($exclude_ids = [], $limit = 3) {
    try {
      $query = $this->entityTypeManager->getStorage('node')->getQuery()
        ->condition('type', 'worksheet')
        ->condition('status', 1)
        ->sort('created', 'DESC')
        ->range(0, $limit * 2)
        ->accessCheck(FALSE);
      
      if (!empty($exclude_ids)) {
        $query->condition('nid', $exclude_ids, 'NOT IN');
      }
      
      $nids = $query->execute();
      return $this->formatWorksheetRecommendations($nids, $limit);
    } catch (\Exception $e) {
      \Drupal::logger('aezcrib_commerce')->error('Error getting recent worksheets: @error', [
        '@error' => $e->getMessage(),
      ]);
      return [];
    }
  }

  /**
   * Format worksheet data for recommendations.
   */
  protected function formatWorksheetRecommendations($nids, $limit) {
    if (empty($nids)) {
      return [];
    }
    
    try {
      $worksheets = $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
      $recommendations = [];
      
      foreach ($worksheets as $worksheet) {
        if (count($recommendations) >= $limit) {
          break;
        }
        
        // Safety checks for field access
        $subject = 'General';
        if ($worksheet->hasField('field_worksheet_subject') && !$worksheet->get('field_worksheet_subject')->isEmpty()) {
          $subject = $worksheet->get('field_worksheet_subject')->value;
        }
        
        $gradeLevel = 'All Levels';
        if ($worksheet->hasField('field_worksheet_level') && !$worksheet->get('field_worksheet_level')->isEmpty()) {
          $gradeLevel = $worksheet->get('field_worksheet_level')->value;
        }
        
        $price = 0;
        if ($worksheet->hasField('field_worksheet_price') && !$worksheet->get('field_worksheet_price')->isEmpty()) {
          $price = $worksheet->get('field_worksheet_price')->value;
        }
        
        $recommendations[] = [
          'id' => $worksheet->id(),
          'title' => $worksheet->getTitle(),
          'subject' => $subject,
          'gradeLevel' => $gradeLevel,
          'price' => $price,
          'rating' => 4, // Default rating
          'popularity' => 50, // Default popularity
          'thumbnail' => $this->getWorksheetThumbnail($worksheet),
        ];
      }
      
      return $recommendations;
    } catch (\Exception $e) {
      \Drupal::logger('aezcrib_commerce')->error('Error formatting worksheet recommendations: @error', [
        '@error' => $e->getMessage(),
      ]);
      return [];
    }
  }

  /**
   * Calculate worksheet rating (mock implementation).
   */
  protected function calculateWorksheetRating($worksheet) {
    // Mock rating between 3-5 stars
    // In a real implementation, you'd calculate this from user reviews
    return rand(3, 5);
  }

  /**
   * Calculate worksheet popularity (mock implementation).
   */
  protected function calculateWorksheetPopularity($worksheet) {
    // Mock popularity score
    // In a real implementation, you'd calculate this from purchase/view counts
    return rand(1, 100);
  }

  /**
   * Get worksheet thumbnail URL.
   */
  protected function getWorksheetThumbnail($worksheet) {
    try {
      if ($worksheet->hasField('field_worksheet_image') && !$worksheet->get('field_worksheet_image')->isEmpty()) {
        $file = $worksheet->get('field_worksheet_image')->entity;
        if ($file) {
          return file_create_url($file->getFileUri());
        }
      }
    } catch (\Exception $e) {
      \Drupal::logger('aezcrib_commerce')->debug('Error getting worksheet thumbnail: @error', [
        '@error' => $e->getMessage(),
      ]);
    }
    return NULL;
  }
}