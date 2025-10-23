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
  public function getUserWorksheets() {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    try {
      $worksheets = $this->purchaseService->getUserPurchasedWorksheets($user_id);
      
      return new JsonResponse([
        'success' => TRUE,
        'worksheets' => $worksheets,
        'count' => count($worksheets),
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching user worksheets: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch worksheets'], 500);
    }
  }

  /**
   * Purchase a worksheet with AezCoins.
   */
  public function purchaseWorksheet($worksheet_id, Request $request) {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    // Validate worksheet ID
    if (!is_numeric($worksheet_id) || $worksheet_id <= 0) {
      return new JsonResponse(['error' => 'Invalid worksheet ID'], 400);
    }

    try {
      $result = $this->purchaseService->purchaseWorksheet($user_id, $worksheet_id);
      
      $status_code = $result['success'] ? 200 : 400;
      
      return new JsonResponse($result, $status_code);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error purchasing worksheet: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'An error occurred while processing your purchase'], 500);
    }
  }

  /**
   * Download a purchased worksheet.
   */
  public function downloadWorksheet($worksheet_id) {
    $user_id = $this->currentUser()->id();
    
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
  public function checkPurchaseEligibility($worksheet_id) {
    $user_id = $this->currentUser()->id();
    
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