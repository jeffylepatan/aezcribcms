<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\aezcrib_commerce\Service\RecommendationService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for worksheet recommendations.
 */
class RecommendationController extends ControllerBase {

  /**
   * The recommendation service.
   *
   * @var \Drupal\aezcrib_commerce\Service\RecommendationService
   */
  protected $recommendationService;

  /**
   * Constructs a new RecommendationController object.
   */
  public function __construct(RecommendationService $recommendation_service) {
    $this->recommendationService = $recommendation_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('aezcrib_commerce.recommendation_service')
    );
  }

  /**
   * Get personalized recommendations for the current user.
   */
  public function getRecommendations(Request $request) {
    $user_id = $this->authenticateUser($request);
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    $limit = $request->query->get('limit', 6);
    $limit = min(max((int) $limit, 1), 20); // Between 1 and 20

    try {
      $recommendations = $this->recommendationService->getRecommendationsForUser($user_id, $limit);
      
      return new JsonResponse([
        'success' => TRUE,
        'recommendations' => $recommendations,
        'count' => count($recommendations),
        'user_id' => $user_id,
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching recommendations: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch recommendations'], 500);
    }
  }

  /**
   * Authenticate user using token or session.
   * Same logic as CreditController for consistency.
   */
  private function authenticateUser(Request $request) {
    // Try Authorization header first
    $authHeader = $request->headers->get('Authorization');
    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
      $token = $matches[1];
      
      // Log token received for debugging
      \Drupal::logger('aezcrib_commerce')->info('RecommendationController received token: @token', ['@token' => substr($token, 0, 10) . '...']);
      
      // If we have a token, try to decode user information from it
      $user_id = $this->decodeTokenForUser($token);
      if ($user_id) {
        \Drupal::logger('aezcrib_commerce')->info('RecommendationController token validated for user: @uid', ['@uid' => $user_id]);
        return $user_id;
      }
    }
    
    // Fall back to current user session (for Drupal admin/session-based access)
    $current_user = $this->currentUser();
    if ($current_user->isAuthenticated()) {
      \Drupal::logger('aezcrib_commerce')->info('RecommendationController user authenticated via session fallback: user @uid', ['@uid' => $current_user->id()]);
      return $current_user->id();
    }
    
    \Drupal::logger('aezcrib_commerce')->warning('RecommendationController authentication failed for request from @ip with token @token', [
      '@ip' => $request->getClientIp(),
      '@token' => $authHeader ? substr($authHeader, 0, 20) . '...' : 'none'
    ]);
    return null;
  }

  /**
   * Decode token to get user ID.
   * Same logic as CreditController for consistency.
   */
  private function decodeTokenForUser($token) {
    // 1. Check if it's a session ID
    $database = \Drupal::database();
    $query = $database->select('sessions', 's')
      ->fields('s', ['uid'])
      ->condition('sid', $token)
      ->condition('timestamp', \Drupal::time()->getRequestTime() - 86400, '>'); // Active within 24 hours
    
    $user_id = $query->execute()->fetchField();
    if ($user_id && $user_id > 0) {
      return $user_id;
    }
    
    // 2. For development/testing: find any active user session
    if (strlen($token) >= 8) {
      $query = $database->select('sessions', 's')
        ->fields('s', ['uid'])
        ->condition('uid', 0, '>')
        ->condition('timestamp', \Drupal::time()->getRequestTime() - 3600, '>') // Active within 1 hour
        ->orderBy('timestamp', 'DESC')
        ->range(0, 1);
      
      $recent_user_id = $query->execute()->fetchField();
      if ($recent_user_id && $recent_user_id > 0) {
        \Drupal::logger('aezcrib_commerce')->info('RecommendationController using most recent active session for token validation: user @uid', ['@uid' => $recent_user_id]);
        return $recent_user_id;
      }
    }
    
    return null;
  }

  /**
   * Get popular worksheets (public endpoint).
   */
  public function getPopular(Request $request) {
    $limit = $request->query->get('limit', 6);
    $limit = min(max((int) $limit, 1), 20);

    try {
      // Get popular worksheets without user-specific filtering
      $recommendations = $this->recommendationService->getRecommendationsForUser(0, $limit);
      
      return new JsonResponse([
        'success' => TRUE,
        'popular_worksheets' => $recommendations,
        'count' => count($recommendations),
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching popular worksheets: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch popular worksheets'], 500);
    }
  }
}