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
    $user_id = $this->currentUser()->id();
    
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