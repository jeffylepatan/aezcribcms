<?php

namespace Drupal\aezcrib_commerce\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\aezcrib_commerce\Service\CreditService;
use Drupal\node\NodeInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;

/**
 * Service for managing worksheet purchases.
 */
class PurchaseService {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The logger factory.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * The credit service.
   *
   * @var \Drupal\aezcrib_commerce\Service\CreditService
   */
  protected $creditService;

  /**
   * The file URL generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * Constructs a new PurchaseService object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, AccountProxyInterface $current_user, LoggerChannelFactoryInterface $logger_factory, CreditService $credit_service, FileUrlGeneratorInterface $file_url_generator) {
    $this->entityTypeManager = $entity_type_manager;
    $this->currentUser = $current_user;
    $this->loggerFactory = $logger_factory;
    $this->creditService = $credit_service;
    $this->fileUrlGenerator = $file_url_generator;
  }

  /**
   * Purchase a worksheet with AezCoins.
   */
  public function purchaseWorksheet($user_id, $worksheet_id) {
    $this->loggerFactory->get('aezcrib_commerce')->debug('Starting purchaseWorksheet for user @user_id and worksheet @worksheet_id', [
      '@user_id' => $user_id,
      '@worksheet_id' => $worksheet_id,
    ]);

    // Load the worksheet
    $worksheet = $this->entityTypeManager->getStorage('node')->load($worksheet_id);
    
    if (!$worksheet || $worksheet->bundle() !== 'worksheets') {
      $this->loggerFactory->get('aezcrib_commerce')->debug('Worksheet not found or invalid bundle for worksheet ID @worksheet_id', [
        '@worksheet_id' => $worksheet_id,
      ]);
      return ['success' => FALSE, 'message' => 'Worksheet not found.'];
    }

    // Check if worksheet is published
    if (!$worksheet->isPublished()) {
      $this->loggerFactory->get('aezcrib_commerce')->debug('Worksheet is not published for worksheet ID @worksheet_id', [
        '@worksheet_id' => $worksheet_id,
      ]);
      return ['success' => FALSE, 'message' => 'Worksheet is not available.'];
    }

    // Check if user already owns this worksheet
    if ($this->userOwnsWorksheet($user_id, $worksheet_id)) {
      $this->loggerFactory->get('aezcrib_commerce')->debug('User @user_id already owns worksheet @worksheet_id', [
        '@user_id' => $user_id,
        '@worksheet_id' => $worksheet_id,
      ]);
      return ['success' => FALSE, 'message' => 'You already own this worksheet.'];
    }

    // Get worksheet price
    $price = $worksheet->get('field_worksheet_price')->value ?? 0;
    
    if ($price <= 0) {
      $this->loggerFactory->get('aezcrib_commerce')->debug('Invalid price for worksheet ID @worksheet_id: @price', [
        '@worksheet_id' => $worksheet_id,
        '@price' => $price,
      ]);
      return ['success' => FALSE, 'message' => 'Invalid worksheet price.'];
    }

    // Check if user has enough credits
    $user_credits = $this->creditService->getUserCredits($user_id);
    
    if ($user_credits < $price) {
      $this->loggerFactory->get('aezcrib_commerce')->debug('Insufficient credits for user @user_id. Required: @required, Available: @available', [
        '@user_id' => $user_id,
        '@required' => $price,
        '@available' => $user_credits,
      ]);
      return [
        'success' => FALSE, 
        'message' => 'Insufficient AezCoins. You need ' . $price . ' but only have ' . $user_credits . '.',
        'required' => $price,
        'available' => $user_credits,
      ];
    }

    // Deduct credits
    if (!$this->creditService->deductCredits($user_id, $price)) {
      $this->loggerFactory->get('aezcrib_commerce')->debug('Failed to deduct credits for user @user_id', [
        '@user_id' => $user_id,
      ]);
      return ['success' => FALSE, 'message' => 'Failed to deduct credits.'];
    }

    $this->loggerFactory->get('aezcrib_commerce')->debug('Credits deducted successfully for user @user_id. Proceeding to create transaction.', [
      '@user_id' => $user_id,
    ]);

    // Create purchase transaction
    $transaction = $this->createPurchaseTransaction($user_id, $worksheet_id, $price);
    
    if ($transaction) {
      $this->loggerFactory->get('aezcrib_commerce')->info(
        'User @user (ID: @uid) purchased worksheet "@worksheet" (ID: @wid) for @price AezCoins',
        [
          '@user' => $this->currentUser->getAccountName(),
          '@uid' => $user_id,
          '@worksheet' => $worksheet->getTitle(),
          '@wid' => $worksheet_id,
          '@price' => $price,
        ]
      );

      // Add the worksheet to user's owned worksheets list
      $user = $this->entityTypeManager->getStorage('user')->load($user_id);
      if ($user && $user->hasField('field_worksheets_owned')) {
        $owned_worksheets = $user->get('field_worksheets_owned')->getValue();
        $owned_worksheets[] = ['target_id' => $worksheet_id];
        $user->set('field_worksheets_owned', $owned_worksheets);
        $user->save();
      }

      return [
        'success' => TRUE, 
        'message' => 'Worksheet purchased successfully!',
        'transaction_id' => $transaction->id(),
        'remaining_credits' => $this->creditService->getUserCredits($user_id),
      ];
    }

    // If transaction creation failed, refund the credits
    $this->creditService->addCredits($user_id, $price);
    $this->loggerFactory->get('aezcrib_commerce')->debug('Transaction creation failed for user @user_id. Credits refunded.', [
      '@user_id' => $user_id,
    ]);
    return ['success' => FALSE, 'message' => 'Failed to create purchase record.'];
  }

  /**
   * Check if user owns a worksheet.
   */
  public function userOwnsWorksheet($user_id, $worksheet_id) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'purchase_transaction')
      ->condition('field_user_reference', $user_id)
      ->condition('field_worksheet_reference', $worksheet_id)
      ->condition('field_purchase_status', 'completed')
      ->accessCheck(FALSE);
    
    $results = $query->execute();
    
    return !empty($results);
  }

  /**
   * Get all worksheets purchased by a user.
   */
  public function getUserPurchasedWorksheets($user_id) {
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'purchase_transaction')
      ->condition('field_user_reference', $user_id)
      ->condition('field_purchase_status', 'completed')
      ->sort('created', 'DESC')
      ->accessCheck(FALSE);
    
    $transaction_nids = $query->execute();
    
    if (empty($transaction_nids)) {
      return [];
    }

    $transactions = $this->entityTypeManager->getStorage('node')->loadMultiple($transaction_nids);
    
    $worksheets = [];
    foreach ($transactions as $transaction) {
      $worksheet_nid = $transaction->get('field_worksheet_reference')->target_id;
      if ($worksheet_nid) {
        $worksheet = $this->entityTypeManager->getStorage('node')->load($worksheet_nid);
        
        if ($worksheet && $worksheet->isPublished()) {
          $worksheets[] = [
            'id' => $worksheet->id(),
            'title' => $worksheet->getTitle(),
            'subject' => $worksheet->get('field_worksheet_subject')->value ?? 'General',
            'gradeLevel' => $worksheet->get('field_worksheet_level')->value ?? 'All Levels',
            'purchaseDate' => date('c', $transaction->getCreatedTime()),
            'price' => $transaction->get('field_purchase_amount')->value,
            'downloadUrl' => '/api/aezcrib/download/worksheet/' . $worksheet->id(),
            'thumbnail' => $this->getWorksheetThumbnail($worksheet),
          ];
        }
      }
    }
    
    return $worksheets;
  }

  /**
   * Create a purchase transaction record.
   */
  protected function createPurchaseTransaction($user_id, $worksheet_id, $amount) {
    $node_storage = $this->entityTypeManager->getStorage('node');
    
    $worksheet = $node_storage->load($worksheet_id);
    $worksheet_title = $worksheet ? $worksheet->getTitle() : 'Unknown Worksheet';
    
    $transaction = $node_storage->create([
      'type' => 'purchase_transaction',
      'title' => 'Purchase - ' . $worksheet_title . ' - ' . date('Y-m-d H:i:s'),
      'field_user_reference' => $user_id,
      'field_worksheet_reference' => $worksheet_id,
      'field_purchase_amount' => $amount,
      'field_purchase_status' => 'completed',
      'status' => 1,
    ]);

    $transaction->save();
    return $transaction;
  }

  /**
   * Get worksheet thumbnail URL.
   */
  protected function getWorksheetThumbnail($worksheet) {
    if ($worksheet->hasField('field_worksheet_image') && !$worksheet->get('field_worksheet_image')->isEmpty()) {
      $file = $worksheet->get('field_worksheet_image')->entity;
      if ($file) {
        return $this->fileUrlGenerator->generateAbsoluteString($file->getFileUri());
      }
    }
    return NULL;
  }

  /**
   * Get download URL for a purchased worksheet.
   */
  public function getWorksheetDownloadUrl($user_id, $worksheet_id) {
    // Check if user owns the worksheet
    if (!$this->userOwnsWorksheet($user_id, $worksheet_id)) {
      return NULL;
    }

    $worksheet = $this->entityTypeManager->getStorage('node')->load($worksheet_id);
    
    if (!$worksheet || $worksheet->bundle() !== 'worksheet') {
      return NULL;
    }

    // Get the PDF file
    if ($worksheet->hasField('field_worksheet') && !$worksheet->get('field_worksheet')->isEmpty()) {
      $file = $worksheet->get('field_worksheet')->entity;
      if ($file) {
        return file_create_url($file->getFileUri());
      }
    }

    return NULL;
  }
}