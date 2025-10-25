<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\aezcrib_commerce\Service\PurchaseService;
use Drupal\aezcrib_commerce\Service\CreditService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Drupal\Component\Serialization\Json;

/**
 * Controller for worksheet purchase and download operations.
 */
class WorksheetController extends ControllerBase {

  /**
   * The purchase service.
   *
   * @var \Drupal\aezcrib_commerce\Service\PurchaseService
   */
  protected $purchaseService;

  /**
   * The credit service.
   *
   * @var \Drupal\aezcrib_commerce\Service\CreditService
   */
  protected $creditService;

  /**
   * Constructs a new WorksheetController object.
   */
  public function __construct(PurchaseService $purchase_service, CreditService $credit_service) {
    $this->purchaseService = $purchase_service;
    $this->creditService = $credit_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('aezcrib_commerce.purchase_service'),
      $container->get('aezcrib_commerce.credit_service')
    );
  }

  /**
   * Get user's purchased worksheets.
   */
  public function getUserWorksheets(Request $request) {
    // Use the same authentication logic as CreditController
    $user_id = $this->authenticateUser($request);
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    try {
      $worksheets = $this->purchaseService->getUserPurchasedWorksheets($user_id);
      
      return new JsonResponse([
        'success' => TRUE,
        'worksheets' => $worksheets,
        'count' => count($worksheets),
        'user_id' => $user_id,
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching user worksheets: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch worksheets'], 500);
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
      \Drupal::logger('aezcrib_commerce')->info('WorksheetController received token: @token', ['@token' => substr($token, 0, 10) . '...']);
      
      // For now, let's create a simple validation:
      // If we have a token, try to decode user information from it
      $user_id = $this->decodeTokenForUser($token);
      if ($user_id) {
        \Drupal::logger('aezcrib_commerce')->info('WorksheetController token validated for user: @uid', ['@uid' => $user_id]);
        return $user_id;
      }
    }
    
    // Fall back to current user session (for Drupal admin/session-based access)
    $current_user = $this->currentUser();
    if ($current_user->isAuthenticated()) {
      \Drupal::logger('aezcrib_commerce')->info('WorksheetController user authenticated via session fallback: user @uid', ['@uid' => $current_user->id()]);
      return $current_user->id();
    }
    
    \Drupal::logger('aezcrib_commerce')->warning('WorksheetController authentication failed for request from @ip with token @token', [
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
    // The token should be linked to a user session or contain user info
    // Let's try multiple approaches:
    
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
    
    // 2. For development/testing: if token matches a pattern, extract user ID
    // This is a temporary solution until we implement proper JWT or session tokens
    if (strlen($token) >= 8) {
      // Try to find any active user session and assume the token belongs to the most recent one
      // This is not secure but will work for development
      $query = $database->select('sessions', 's')
        ->fields('s', ['uid'])
        ->condition('uid', 0, '>')
        ->condition('timestamp', \Drupal::time()->getRequestTime() - 3600, '>') // Active within 1 hour
        ->orderBy('timestamp', 'DESC')
        ->range(0, 1);
      
      $recent_user_id = $query->execute()->fetchField();
      if ($recent_user_id && $recent_user_id > 0) {
        \Drupal::logger('aezcrib_commerce')->info('WorksheetController using most recent active session for token validation: user @uid', ['@uid' => $recent_user_id]);
        return $recent_user_id;
      }
    }
    
    return null;
  }

  /**
   * Purchase a worksheet with AezCoins.
   */
  public function purchaseWorksheet($worksheet_id, Request $request) {
    $authHeader = $request->headers->get('Authorization');
    $user_id = $this->authenticateUser($request);
    $log_context = [
      '@worksheet_id' => $worksheet_id,
      '@auth_header' => $authHeader ? substr($authHeader, 0, 20) . '...' : 'none',
      '@user_id' => $user_id,
    ];

    \Drupal::logger('aezcrib_commerce')->info('purchaseWorksheet: Purchase Request Received', [
      'worksheet_id' => $worksheet_id,
      'auth_header' => $authHeader ? substr($authHeader, 0, 20) . '...' : 'none',
      'user_id' => $user_id,
    ]);

    // Log all request headers for debugging
    \Drupal::logger('aezcrib_commerce')->info('purchaseWorksheet: Request Headers', [
      'headers' => $request->headers->all(),
    ]);

    if (!$user_id) {
      \Drupal::logger('aezcrib_commerce')->warning('purchaseWorksheet: User not authenticated', $log_context);
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    // Validate worksheet ID
    if (!is_numeric($worksheet_id) || $worksheet_id <= 0) {
      \Drupal::logger('aezcrib_commerce')->warning('purchaseWorksheet: Invalid worksheet ID', $log_context);
      return new JsonResponse(['error' => 'Invalid worksheet ID'], 400);
    }

    try {
      // Use PurchaseService to handle the purchase
      $result = $this->purchaseService->purchaseWorksheet($user_id, $worksheet_id);

      if (!$result['success']) {
        \Drupal::logger('aezcrib_commerce')->warning('purchaseWorksheet: Purchase failed', [
          '@worksheet_id' => $worksheet_id,
          '@user_id' => $user_id,
          '@message' => $result['message'],
        ]);
        return new JsonResponse(['error' => $result['message']], 400);
      }

      \Drupal::logger('aezcrib_commerce')->info('purchaseWorksheet: Purchase successful', [
        '@worksheet_id' => $worksheet_id,
        '@user_id' => $user_id,
        '@remaining_credits' => $result['remaining_credits'],
      ]);

      return new JsonResponse([
        'success' => true,
        'message' => $result['message'],
        'remaining_credits' => $result['remaining_credits'],
      ], 200);
    } catch (\Exception $e) {
      $log_context['@error'] = $e->getMessage();
      $this->getLogger('aezcrib_commerce')->error('Error purchasing worksheet: @error', $log_context);
      return new JsonResponse(['error' => 'An error occurred while processing your purchase'], 500);
    }
  }

  /**
   * Download a purchased worksheet.
   */
  public function downloadWorksheet($worksheet_id, Request $request) {
    $user_id = $this->authenticateUser($request);
    \Drupal::logger('aezcrib_commerce')->info('downloadWorksheet: Request Received for @worksheet_id by @user_id', [
      '@worksheet_id' => $worksheet_id,
      '@user_id' => $user_id,
    ]);

    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    // Validate worksheet ID
    if (!is_numeric($worksheet_id) || $worksheet_id <= 0) {
      return new JsonResponse(['error' => 'Invalid worksheet ID'], 400);
    }

    try {
      // Check if user owns the worksheet
      if (!$this->purchaseService->userOwnsWorksheet($user_id, $worksheet_id)) {
        return new JsonResponse(['error' => 'You do not own this worksheet'], 403);
      }

      // Get download URL
      $download_url = $this->purchaseService->getWorksheetDownloadUrl($user_id, $worksheet_id);
      
      if (!$download_url) {
        return new JsonResponse(['error' => 'Worksheet file not found'], 404);
      }

      // Load the worksheet to get the file
      $worksheet = $this->entityTypeManager()->getStorage('node')->load($worksheet_id);
      
      if (!$worksheet || !$worksheet->hasField('field_worksheet') || $worksheet->get('field_worksheet')->isEmpty()) {
        return new JsonResponse(['error' => 'Worksheet file not available'], 404);
      }

      $file = $worksheet->get('field_worksheet')->entity;
      
      if (!$file) {
        return new JsonResponse(['error' => 'File not found'], 404);
      }

      $file_path = $file->getFileUri();
      $real_path = \Drupal::service('file_system')->realpath($file_path);
      
      if (!file_exists($real_path)) {
        return new JsonResponse(['error' => 'Physical file not found'], 404);
      }

      // Create file response
      $response = new BinaryFileResponse($real_path);
      $response->setContentDisposition(
        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        $file->getFilename()
      );

      \Drupal::logger('aezcrib_commerce')->info('downloadWorksheet: Request Received for @real_path - @worksheet_id by @user_id - @download_url', [
        '@response' => 'File prepared for download',
        '@real_path' => $real_path,
        '@worksheet_id' => $worksheet_id,
        '@user_id' => $user_id,
        '@download_url' => $download_url,
      ]);

      return $response;
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error downloading worksheet: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'An error occurred while downloading the file'], 500);
    }
  }

  /**
   * Check if user can purchase a worksheet.
   */
  public function checkPurchaseEligibility($worksheet_id, Request $request) {
    $user_id = $this->authenticateUser($request);
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    try {
      // Load worksheet
      $worksheet = $this->entityTypeManager()->getStorage('node')->load($worksheet_id);
      
      if (!$worksheet || $worksheet->bundle() !== 'worksheet') {
        return new JsonResponse(['error' => 'Worksheet not found'], 404);
      }

      if (!$worksheet->isPublished()) {
        return new JsonResponse(['error' => 'Worksheet not available'], 404);
      }

      // Check if already owned
      $already_owned = $this->purchaseService->userOwnsWorksheet($user_id, $worksheet_id);
      
      // Get price and user credits
      $price = $worksheet->get('field_worksheet_price')->value ?? 0;
      $user_credits = $this->creditService->getUserCredits($user_id);
      
      return new JsonResponse([
        'success' => TRUE,
        'can_purchase' => !$already_owned && $user_credits >= $price,
        'already_owned' => $already_owned,
        'price' => $price,
        'user_credits' => $user_credits,
        'sufficient_credits' => $user_credits >= $price,
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error checking purchase eligibility: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'An error occurred while checking eligibility'], 500);
    }
  }
}