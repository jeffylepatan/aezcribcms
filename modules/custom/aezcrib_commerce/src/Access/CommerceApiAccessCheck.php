<?php

namespace Drupal\aezcrib_commerce\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Access\AccessCheckInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * Custom access check for Commerce API endpoints.
 */
class CommerceApiAccessCheck implements AccessCheckInterface {

  /**
   * {@inheritdoc}
   */
  public function applies(Route $route) {
    return $route->hasRequirement('_commerce_api_access');
  }

  /**
   * {@inheritdoc}
   */
  public function access(Route $route, Request $request = NULL, AccountInterface $account = NULL) {
    // Check for valid token in Authorization header
    if ($request) {
      $authHeader = $request->headers->get('Authorization');
      if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        
        // Log for debugging
        \Drupal::logger('aezcrib_commerce')->info('Access check: token received @token', ['@token' => substr($token, 0, 10) . '...']);
        
        // Validate token - try session-based validation first
        if ($this->validateSessionToken($token)) {
          \Drupal::logger('aezcrib_commerce')->info('Access check: token validated via session');
          return AccessResult::allowed();
        }
        
        // Try CSRF token validation if user is already authenticated
        if ($account && $account->isAuthenticated()) {
          $csrf_token = \Drupal::csrfToken();
          if ($csrf_token->validate($token)) {
            \Drupal::logger('aezcrib_commerce')->info('Access check: token validated via CSRF');
            return AccessResult::allowed();
          }
        }
      }
    }
    
    // Check if user is authenticated via standard Drupal session
    if ($account && $account->isAuthenticated()) {
      \Drupal::logger('aezcrib_commerce')->info('Access check: user authenticated via standard session');
      return AccessResult::allowed();
    }
    
    \Drupal::logger('aezcrib_commerce')->warning('Access check: denied - no valid authentication');
    return AccessResult::forbidden('Invalid or missing authentication token');
  }

  /**
   * Validate session token.
   */
  private function validateSessionToken($token) {
    $database = \Drupal::database();
    $query = $database->select('sessions', 's')
      ->fields('s', ['uid'])
      ->condition('sid', $token)
      ->condition('timestamp', \Drupal::time()->getRequestTime() - 86400, '>'); // 24 hours
    
    $result = $query->execute()->fetchField();
    return $result !== FALSE;
  }
}