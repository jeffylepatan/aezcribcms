<?php

namespace Drupal\aezcrib_auth\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\user\Entity\User;
use Drupal\user\UserAuthInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Serialization\Json;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AuthController
 */
class AuthController extends ControllerBase {

  /**
   * The user authentication service.
   *
   * @var \Drupal\user\UserAuthInterface
   */
  protected $userAuth;

  /**
   * The current user account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * Constructs a new AuthController object.
   */
  public function __construct(UserAuthInterface $user_auth, AccountInterface $current_user) {
    $this->userAuth = $user_auth;
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.auth'),
      $container->get('current_user')
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
   * Login endpoint.
   */
  public function login(Request $request) {
    try {
      $data = Json::decode($request->getContent());
      
      if (empty($data['email']) || empty($data['password'])) {
        $response = new JsonResponse([
          'message' => 'Email and password are required',
        ], 400);
        return $this->addCorsHeaders($response, $request);
      }

      // Authenticate user
      $uid = $this->userAuth->authenticate($data['email'], $data['password']);
      
      if (!$uid) {
        $response = new JsonResponse([
          'message' => 'Invalid email or password',
        ], 401);
        return $this->addCorsHeaders($response, $request);
      }

      $user = User::load($uid);
      
      if (!$user || !$user->isActive()) {
        $response = new JsonResponse([
          'message' => 'Account is blocked or does not exist',
        ], 401);
        return $this->addCorsHeaders($response, $request);
      }

      // Log in user to create session
      user_login_finalize($user);

        // Ensure we have a session started and get session token
        if (session_status() !== PHP_SESSION_ACTIVE) {
          session_start();
        }
        $token = session_id();
        // If no session ID, generate one manually
        if (empty($token)) {
          $token = \Drupal::csrfToken()->get(time() . $user->id());
          \Drupal::logger('aezcrib_auth')->notice('Fallback CSRF token generated: @token for user @uid', [
            '@token' => $token,
            '@uid' => $user->id(),
          ]);
        } else {
          \Drupal::logger('aezcrib_auth')->notice('Session token generated: @token for user @uid', [
            '@token' => $token,
            '@uid' => $user->id(),
          ]);
        }

      // Get user role - handle both singular and plural versions
      $roles = $user->getRoles();
      $custom_role = 'parent'; // default
      // ...existing code...

      $response = new JsonResponse([
        'user' => [
          'id' => $user->id(),
          'email' => $user->getEmail(),
          'name' => $user->getDisplayName(),
          'role' => $custom_role,
          'field_first_name' => $user->get('field_first_name')->value,
          'field_last_name' => $user->get('field_last_name')->value,
        ],
        'token' => $token,
      ]);

      return $this->addCorsHeaders($response, $request);

    } catch (\Exception $e) {
      $response = new JsonResponse([
        'message' => 'An error occurred during login',
      ], 500);
      return $this->addCorsHeaders($response, $request);
    }
  }

  /**
   * Register endpoint.
   */
  public function register(Request $request) {
    try {
      $data = Json::decode($request->getContent());
      
      // Validate required fields
      $required_fields = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'role'];
      foreach ($required_fields as $field) {
        if (empty($data[$field])) {
          $response = new JsonResponse([
            'message' => ucfirst($field) . ' is required',
          ], 400);
          return $this->addCorsHeaders($response, $request);
        }
      }

      // Check if user already exists
      $existing_user = user_load_by_mail($data['email']);
      if ($existing_user) {
        $response = new JsonResponse([
          'message' => 'An account with this email already exists',
        ], 400);
        return $this->addCorsHeaders($response, $request);
      }

      // Validate role
      if (!in_array($data['role'], ['parent', 'educator', 'creator'])) {
        $response = new JsonResponse([
          'message' => 'Invalid role selected',
        ], 400);
        return $this->addCorsHeaders($response, $request);
      }

      // Create user
      $user = User::create([
        'name' => $data['email'],
        'mail' => $data['email'],
        'pass' => $data['password'],
        'status' => 1,
        'field_phone_number' => $data['phoneNumber'],
        'field_first_name' => $data['firstName'],
        'field_last_name' => $data['lastName'],
      ]);

      $user->addRole($data['role']);
      $user->save();

      // Auto-login after registration
      user_login_finalize($user);

      // Ensure we have a session started
      if (session_status() == PHP_SESSION_NONE) {
        session_start();
      }

      // Generate or get session token
      $token = session_id();
      
      // If no session ID, generate one manually
      if (empty($token)) {
        $token = \Drupal::csrfToken()->get(time() . $user->id());
      }

      // Log token generation for debugging
      \Drupal::logger('aezcrib_auth')->info('Registration token generated: @token for user @uid', [
        '@token' => $token,
        '@uid' => $user->id(),
      ]);

      $response = new JsonResponse([
        'user' => [
          'id' => $user->id(),
          'email' => $user->getEmail(),
          'name' => $data['firstName'] . ' ' . $data['lastName'],
          'role' => $data['role'],
        ],
        'token' => $token,
      ], 201);

      return $this->addCorsHeaders($response, $request);

    } catch (\Exception $e) {
      $response = new JsonResponse([
        'message' => 'An error occurred during registration',
      ], 500);
      return $this->addCorsHeaders($response, $request);
    }
  }

  /**
   * Logout endpoint.
   */
  public function logout(Request $request) {
    user_logout();
    
    $response = new JsonResponse([
      'message' => 'Logged out successfully',
    ]);
    return $this->addCorsHeaders($response, $request);
  }

  /**
   * Get current user endpoint.
   */
  public function me(Request $request) {
    if ($this->currentUser->isAnonymous()) {
      $response = new JsonResponse([
        'message' => 'Not authenticated',
      ], 401);
      return $this->addCorsHeaders($response, $request);
    }

    $user = User::load($this->currentUser->id());
    
    if (!$user) {
      $response = new JsonResponse([
        'message' => 'User not found',
      ], 404);
      return $this->addCorsHeaders($response, $request);
    }

    // Get user role
    $roles = $user->getRoles();
    $custom_role = 'parent'; // default
    foreach (['creator', 'educator', 'parent'] as $role) {
      if (in_array($role, $roles)) {
        $custom_role = $role;
        break;
      }
    }

    $response = new JsonResponse([
      'user' => [
        'id' => $user->id(),
        'email' => $user->getEmail(),
        'name' => $user->getDisplayName(),
        'role' => $custom_role,
      ],
    ]);

    return $this->addCorsHeaders($response, $request);
  }

  /**
   * Handle OPTIONS requests for CORS.
   */
  public function options(Request $request) {
    $response = new Response('', 200);
    return $this->addCorsHeaders($response, $request);
  }

  /**
   * Test endpoint to verify CORS headers.
   */
  public function test(Request $request) {
    $response = new JsonResponse([
      'message' => 'CORS test endpoint',
      'origin' => $request->headers->get('Origin', 'not-provided'),
      'method' => $request->getMethod(),
    ]);
    return $this->addCorsHeaders($response, $request);
  }
}