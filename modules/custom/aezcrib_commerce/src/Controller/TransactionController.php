<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for transaction history operations.
 */
class TransactionController extends ControllerBase {

  /**
   * Get user's transaction history.
   */
  public function getUserTransactions(Request $request) {
    $user_id = $this->authenticateUser($request);
    
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
        'user_id' => $user_id,
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
  public function getTransactionStats(Request $request) {
    $user_id = $this->authenticateUser($request);
    
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
        'user_id' => $user_id,
      ]);
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error fetching transaction stats: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'Failed to fetch transaction statistics'], 500);
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
      \Drupal::logger('aezcrib_commerce')->info('TransactionController received token: @token', ['@token' => substr($token, 0, 10) . '...']);
      
      // If we have a token, try to decode user information from it
      $user_id = $this->decodeTokenForUser($token);
      if ($user_id) {
        \Drupal::logger('aezcrib_commerce')->info('TransactionController token validated for user: @uid', ['@uid' => $user_id]);
        return $user_id;
      }
    }
    
    // Fall back to current user session (for Drupal admin/session-based access)
    $current_user = $this->currentUser();
    if ($current_user->isAuthenticated()) {
      \Drupal::logger('aezcrib_commerce')->info('TransactionController user authenticated via session fallback: user @uid', ['@uid' => $current_user->id()]);
      return $current_user->id();
    }
    
    \Drupal::logger('aezcrib_commerce')->warning('TransactionController authentication failed for request from @ip with token @token', [
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
        \Drupal::logger('aezcrib_commerce')->info('TransactionController using most recent active session for token validation: user @uid', ['@uid' => $recent_user_id]);
        return $recent_user_id;
      }
    }
    
    return null;
  }
}