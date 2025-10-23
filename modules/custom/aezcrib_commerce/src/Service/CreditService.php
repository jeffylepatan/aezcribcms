<?php

namespace Drupal\aezcrib_commerce\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\user\UserInterface;
use Drupal\node\NodeInterface;

/**
 * Service for managing AezCoins credits.
 */
class CreditService {

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
   * Constructs a new CreditService object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, AccountProxyInterface $current_user, LoggerChannelFactoryInterface $logger_factory) {
    $this->entityTypeManager = $entity_type_manager;
    $this->currentUser = $current_user;
    $this->loggerFactory = $logger_factory;
  }

  /**
   * Get user's current credit balance.
   */
  public function getUserCredits($user_id = NULL) {
    if (!$user_id) {
      $user_id = $this->currentUser->id();
    }

    $user = $this->entityTypeManager->getStorage('user')->load($user_id);
    
    if ($user && $user instanceof UserInterface) {
      return (int) ($user->get('field_credits')->value ?? 0);
    }

    return 0;
  }

  /**
   * Add credits to user account.
   */
  public function addCredits($user_id, $amount) {
    $user = $this->entityTypeManager->getStorage('user')->load($user_id);
    
    if (!$user || !($user instanceof UserInterface)) {
      return FALSE;
    }

    $current_credits = $this->getUserCredits($user_id);
    $new_credits = $current_credits + $amount;
    
    $user->set('field_credits', $new_credits);
    $user->save();

    $this->loggerFactory->get('aezcrib_commerce')->info(
      'Added @amount AezCoins to user @user (ID: @uid). New balance: @balance',
      [
        '@amount' => $amount,
        '@user' => $user->getAccountName(),
        '@uid' => $user_id,
        '@balance' => $new_credits,
      ]
    );

    return TRUE;
  }

  /**
   * Deduct credits from user account.
   */
  public function deductCredits($user_id, $amount) {
    $user = $this->entityTypeManager->getStorage('user')->load($user_id);
    
    if (!$user || !($user instanceof UserInterface)) {
      return FALSE;
    }

    $current_credits = $this->getUserCredits($user_id);
    
    if ($current_credits < $amount) {
      return FALSE; // Insufficient credits
    }

    $new_credits = $current_credits - $amount;
    $user->set('field_credits', $new_credits);
    $user->save();

    $this->loggerFactory->get('aezcrib_commerce')->info(
      'Deducted @amount AezCoins from user @user (ID: @uid). New balance: @balance',
      [
        '@amount' => $amount,
        '@user' => $user->getAccountName(),
        '@uid' => $user_id,
        '@balance' => $new_credits,
      ]
    );

    return TRUE;
  }

  /**
   * Create a credit transaction record.
   */
  public function createCreditTransaction($user_id, $amount, $real_amount, $payment_method, $payment_reference = '', $receipt_file = NULL) {
    $node_storage = $this->entityTypeManager->getStorage('node');
    
    $transaction = $node_storage->create([
      'type' => 'credit_transaction',
      'title' => 'Credit Purchase - ' . $payment_method . ' - ' . date('Y-m-d H:i:s'),
      'field_user_reference' => $user_id,
      'field_transaction_amount' => $amount,
      'field_real_money_amount' => $real_amount,
      'field_payment_method' => $payment_method,
      'field_payment_reference' => $payment_reference,
      'field_transaction_status' => 'pending',
      'status' => 1,
    ]);

    if ($receipt_file) {
      $transaction->set('field_receipt_image', $receipt_file);
    }

    $transaction->save();

    return $transaction;
  }

  /**
   * Update transaction status.
   */
  public function updateTransactionStatus($transaction_id, $status) {
    $transaction = $this->entityTypeManager->getStorage('node')->load($transaction_id);
    
    if ($transaction && $transaction->bundle() === 'credit_transaction') {
      $transaction->set('field_transaction_status', $status);
      $transaction->save();
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Calculate AezCoins from real money amount.
   */
  public function calculateCreditsFromAmount($real_amount) {
    // ₱1 = 10 AezCoins
    return (int) ($real_amount * 10);
  }

  /**
   * Calculate real money amount from AezCoins.
   */
  public function calculateAmountFromCredits($credits) {
    // 10 AezCoins = ₱1
    return $credits / 10;
  }
}