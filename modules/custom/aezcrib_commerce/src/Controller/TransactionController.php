<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller for transaction history operations.
 */
class TransactionController extends ControllerBase {

  /**
   * Get user's transaction history.
   */
  public function getUserTransactions() {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    try {
      $transactions = aezcrib_commerce_get_user_transactions($user_id, 50);
      
      // Format transactions for API response
      $formatted_transactions = [];
      
      foreach ($transactions as $transaction) {
        $formatted_transactions[] = [
          'id' => $transaction['id'],
          'type' => $transaction['type'],
          'amount' => $transaction['amount'],
          'description' => $transaction['description'],
          'date' => date('c', $transaction['date']), // ISO 8601 format
          'status' => $transaction['status'],
          'real_amount' => isset($transaction['real_amount']) ? $transaction['real_amount'] : null,
        ];
      }
      
      return new JsonResponse([
        'success' => TRUE,
        'transactions' => $formatted_transactions,
        'count' => count($formatted_transactions),
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching user transactions: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch transaction history'], 500);
    }
  }

  /**
   * Get transaction statistics for user.
   */
  public function getTransactionStats() {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    try {
      $transactions = aezcrib_commerce_get_user_transactions($user_id, 1000);
      
      $stats = [
        'total_credits_purchased' => 0,
        'total_credits_spent' => 0,
        'total_real_money_spent' => 0,
        'worksheets_purchased' => 0,
        'pending_transactions' => 0,
        'this_month_purchases' => 0,
      ];

      $current_month = date('Y-m');
      
      foreach ($transactions as $transaction) {
        if ($transaction['type'] === 'credit_purchase') {
          if ($transaction['status'] === 'completed') {
            $stats['total_credits_purchased'] += $transaction['amount'];
            if (isset($transaction['real_amount'])) {
              $stats['total_real_money_spent'] += $transaction['real_amount'];
            }
          } elseif ($transaction['status'] === 'pending') {
            $stats['pending_transactions']++;
          }
        } elseif ($transaction['type'] === 'worksheet_purchase') {
          $stats['total_credits_spent'] += $transaction['amount'];
          $stats['worksheets_purchased']++;
          
          if (date('Y-m', $transaction['date']) === $current_month) {
            $stats['this_month_purchases']++;
          }
        }
      }
      
      return new JsonResponse([
        'success' => TRUE,
        'stats' => $stats,
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching transaction stats: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch transaction statistics'], 500);
    }
  }
}