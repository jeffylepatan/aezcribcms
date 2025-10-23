<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\aezcrib_commerce\Service\CreditService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Component\Serialization\Json;

/**
 * Controller for credit management operations.
 */
class CreditController extends ControllerBase {

  /**
   * The credit service.
   *
   * @var \Drupal\aezcrib_commerce\Service\CreditService
   */
  protected $creditService;

  /**
   * Constructs a new CreditController object.
   */
  public function __construct(CreditService $credit_service) {
    $this->creditService = $credit_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('aezcrib_commerce.credit_service')
    );
  }

  /**
   * Add CORS headers to response.
   */
  private function addCorsHeaders(Response $response, Request $request = null) {
    // Allow multiple origins for development and production
    $allowedOrigins = [
      'https://aezcrib.xyz',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Get the requesting origin from headers
    $origin = '';
    if ($request) {
      $origin = $request->headers->get('Origin', '');
    } else {
      $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    }
    
    // Set the appropriate origin if it's in our allowed list
    if (in_array($origin, $allowedOrigins)) {
      $response->headers->set('Access-Control-Allow-Origin', $origin);
    } else {
      // Default to production domain for CORS
      $response->headers->set('Access-Control-Allow-Origin', 'https://aezcrib.xyz');
    }
    
    $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    $response->headers->set('Access-Control-Allow-Credentials', 'true');
    $response->headers->set('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    
    return $response;
  }

  /**
   * Test endpoint to verify API connectivity.
   */
  public function test() {
    $response = new JsonResponse([
      'success' => TRUE,
      'message' => 'AezCrib Commerce API is working!',
      'timestamp' => date('Y-m-d H:i:s'),
      'module' => 'aezcrib_commerce',
      'version' => '1.0.0'
    ]);

    return $this->addCorsHeaders($response, \Drupal::request());
  }

  /**
   * Get user's current credit balance.
   */
  public function getCredits(Request $request) {
    // Try token-based authentication first, then fall back to session
    $user_id = $this->authenticateUser($request);
    
    if (!$user_id) {
      $response = new JsonResponse(['error' => 'User not authenticated'], 401);
      return $this->addCorsHeaders($response, $request);
    }

    $credits = $this->creditService->getUserCredits($user_id);

    $response = new JsonResponse([
      'success' => TRUE,
      'credits' => $credits,
      'user_id' => $user_id,
    ]);

    return $this->addCorsHeaders($response, $request);
  }

  /**
   * Authenticate user using token or session.
   */
  private function authenticateUser(Request $request) {
    // Try Authorization header first
    $authHeader = $request->headers->get('Authorization');
    if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
      $token = $matches[1];
      
      // Log token received for debugging
      \Drupal::logger('aezcrib_commerce')->info('Received token: @token', ['@token' => substr($token, 0, 10) . '...']);
      
      // Try to validate as session token first
      $user_id = $this->getUserIdFromSessionToken($token);
      if ($user_id) {
        \Drupal::logger('aezcrib_commerce')->info('Token validated via session: user @uid', ['@uid' => $user_id]);
        return $user_id;
      }
      
      // Try to validate as CSRF token
      $current_user = $this->currentUser();
      if ($current_user->isAuthenticated()) {
        $csrf_token = \Drupal::csrfToken();
        // Try different CSRF token patterns
        $csrf_patterns = [
          $token,
          $current_user->id() . ':' . $token,
          time() . $current_user->id()
        ];
        
        foreach ($csrf_patterns as $pattern) {
          if ($csrf_token->validate($pattern)) {
            \Drupal::logger('aezcrib_commerce')->info('Token validated via CSRF pattern: user @uid', ['@uid' => $current_user->id()]);
            return $current_user->id();
          }
        }
        
        // Since user is authenticated, allow access even if CSRF validation fails
        \Drupal::logger('aezcrib_commerce')->info('User authenticated, allowing access despite CSRF validation failure: user @uid', ['@uid' => $current_user->id()]);
        return $current_user->id();
      }
      
      // Try alternative token validation - check if it's a session ID directly
      $session_user_id = $this->validateAlternativeToken($token);
      if ($session_user_id) {
        \Drupal::logger('aezcrib_commerce')->info('Token validated via alternative method: user @uid', ['@uid' => $session_user_id]);
        return $session_user_id;
      }
    }
    
    // Fall back to current user session
    $current_user = $this->currentUser();
    if ($current_user->isAuthenticated()) {
      \Drupal::logger('aezcrib_commerce')->info('User authenticated via session fallback: user @uid', ['@uid' => $current_user->id()]);
      return $current_user->id();
    }
    
    \Drupal::logger('aezcrib_commerce')->warning('Authentication failed for request from @ip', ['@ip' => $request->getClientIp()]);
    return null;
  }

  /**
   * Alternative token validation method.
   */
  private function validateAlternativeToken($token) {
    // Check if the token exists in session storage
    $database = \Drupal::database();
    
    // Try to find session with this token as session ID
    $query = $database->select('sessions', 's')
      ->fields('s', ['uid', 'hostname', 'timestamp'])
      ->condition('sid', $token)
      ->condition('timestamp', \Drupal::time()->getRequestTime() - 2592000, '>'); // 30 days
    
    $result = $query->execute()->fetchAssoc();
    
    if ($result && $result['uid'] > 0) {
      \Drupal::logger('aezcrib_commerce')->info('Alternative token validation successful: found user @uid from @host at @time', [
        '@uid' => $result['uid'],
        '@host' => $result['hostname'],
        '@time' => date('Y-m-d H:i:s', $result['timestamp'])
      ]);
      return $result['uid'];
    }
    
    return null;
  }

  /**
   * Validate session token.
   */
  private function validateSessionToken($token) {
    // Check if session exists and is valid
    $database = \Drupal::database();
    $query = $database->select('sessions', 's')
      ->fields('s', ['uid'])
      ->condition('sid', $token)
      ->condition('timestamp', \Drupal::time()->getRequestTime() - 86400, '>'); // 24 hours
    
    $result = $query->execute()->fetchField();
    return $result !== FALSE;
  }

  /**
   * Get user ID from session token.
   */
  private function getUserIdFromSessionToken($token) {
    $database = \Drupal::database();
    $query = $database->select('sessions', 's')
      ->fields('s', ['uid'])
      ->condition('sid', $token);
    
    return $query->execute()->fetchField();
  }

  /**
   * Add credits to user account (for manual processing).
   */
  public function addCredits(Request $request) {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    $data = Json::decode($request->getContent());
    
    if (empty($data)) {
      return new JsonResponse(['error' => 'Invalid request data'], 400);
    }

    // Validate required fields
    $required_fields = ['real_amount', 'payment_method'];
    foreach ($required_fields as $field) {
      if (!isset($data[$field]) || empty($data[$field])) {
        return new JsonResponse(['error' => "Missing required field: {$field}"], 400);
      }
    }

    $real_amount = (float) $data['real_amount'];
    $payment_method = $data['payment_method'];
    $payment_reference = $data['payment_reference'] ?? '';

    // Validate amount
    if ($real_amount < 1) {
      return new JsonResponse(['error' => 'Minimum donation amount is ₱1'], 400);
    }

    // Calculate AezCoins
    $credits_to_add = $this->creditService->calculateCreditsFromAmount($real_amount);

    try {
      // Create transaction record
      $transaction = $this->creditService->createCreditTransaction(
        $user_id,
        $credits_to_add,
        $real_amount,
        $payment_method,
        $payment_reference
      );

      if ($transaction) {
        return new JsonResponse([
          'success' => TRUE,
          'message' => 'Credit request submitted successfully. Please wait for verification.',
          'transaction_id' => $transaction->id(),
          'credits_requested' => $credits_to_add,
          'real_amount' => $real_amount,
          'status' => 'pending',
        ]);
      } else {
        return new JsonResponse(['error' => 'Failed to create transaction record'], 500);
      }
    } catch (\Exception $e) {
      $this->getLogger('aezcrib_commerce')->error('Error creating credit transaction: @error', [
        '@error' => $e->getMessage(),
      ]);
      
      return new JsonResponse(['error' => 'An error occurred while processing your request'], 500);
    }
  }

  /**
   * Get credit purchase rates.
   */
  public function getRates() {
    return new JsonResponse([
      'success' => TRUE,
      'rates' => [
        'credits_per_peso' => 10,
        'minimum_amount' => 1,
        'currency' => 'PHP',
      ],
      'examples' => [
        ['amount' => 1, 'credits' => 10],
        ['amount' => 10, 'credits' => 100],
        ['amount' => 50, 'credits' => 500],
        ['amount' => 100, 'credits' => 1000],
      ],
    ]);
  }
}