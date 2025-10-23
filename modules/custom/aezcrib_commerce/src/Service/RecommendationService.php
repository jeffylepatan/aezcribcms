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
    $recommendations = [];
    
    // Get user's purchase history to understand preferences
    $user_subjects = $this->getUserPreferredSubjects($user_id);
    $user_grade_levels = $this->getUserPreferredGradeLevels($user_id);
    $purchased_worksheets = $this->getUserPurchasedWorksheetIds($user_id);
    
    // Strategy 1: Recommend based on subject preferences
    if (!empty($user_subjects)) {
      $subject_recommendations = $this->getWorksheetsBySubjects($user_subjects, $purchased_worksheets, 3);
      $recommendations = array_merge($recommendations, $subject_recommendations);
    }
    
    // Strategy 2: Recommend based on grade level preferences
    if (!empty($user_grade_levels) && count($recommendations) < $limit) {
      $grade_recommendations = $this->getWorksheetsByGradeLevels($user_grade_levels, $purchased_worksheets, $limit - count($recommendations));
      $recommendations = array_merge($recommendations, $grade_recommendations);
    }
    
    // Strategy 3: Popular worksheets (if still need more)
    if (count($recommendations) < $limit) {
      $popular_recommendations = $this->getPopularWorksheets($purchased_worksheets, $limit - count($recommendations));
      $recommendations = array_merge($recommendations, $popular_recommendations);
    }
    
    // Strategy 4: Recent worksheets (fallback)
    if (count($recommendations) < $limit) {
      $recent_recommendations = $this->getRecentWorksheets($purchased_worksheets, $limit - count($recommendations));
      $recommendations = array_merge($recommendations, $recent_recommendations);
    }
    
    // Remove duplicates and format
    $unique_recommendations = [];
    $seen_ids = [];
    
    foreach ($recommendations as $worksheet) {
      if (!in_array($worksheet['id'], $seen_ids)) {
        $seen_ids[] = $worksheet['id'];
        $unique_recommendations[] = $worksheet;
      }
    }
    
    return array_slice($unique_recommendations, 0, $limit);
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
  }

  /**
   * Format worksheet data for recommendations.
   */
  protected function formatWorksheetRecommendations($nids, $limit) {
    if (empty($nids)) {
      return [];
    }
    
    $worksheets = $this->entityTypeManager->getStorage('node')->loadMultiple($nids);
    $recommendations = [];
    
    foreach ($worksheets as $worksheet) {
      if (count($recommendations) >= $limit) {
        break;
      }
      
      // Calculate rating (mock for now - you can implement actual rating system)
      $rating = $this->calculateWorksheetRating($worksheet);
      
      // Calculate popularity (mock for now)
      $popularity = $this->calculateWorksheetPopularity($worksheet);
      
      $recommendations[] = [
        'id' => $worksheet->id(),
        'title' => $worksheet->getTitle(),
        'subject' => $worksheet->get('field_worksheet_subject')->value ?? 'General',
        'gradeLevel' => $worksheet->get('field_worksheet_level')->value ?? 'All Levels',
        'price' => $worksheet->get('field_worksheet_price')->value ?? 0,
        'rating' => $rating,
        'popularity' => $popularity,
        'thumbnail' => $this->getWorksheetThumbnail($worksheet),
      ];
    }
    
    return $recommendations;
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
    if ($worksheet->hasField('field_worksheet_image') && !$worksheet->get('field_worksheet_image')->isEmpty()) {
      $file = $worksheet->get('field_worksheet_image')->entity;
      if ($file) {
        return file_create_url($file->getFileUri());
      }
    }
    return NULL;
  }
}