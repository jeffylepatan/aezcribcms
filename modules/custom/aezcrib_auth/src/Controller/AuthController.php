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
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Drupal\jwt\Authentication\Provider\JwtAuth;

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
   * The JWT transcoder.
   *
   * @var \Drupal\jwt\Transcoder\JwtTranscoderInterface
   */
  protected $jwtTranscoder;

  /**
   * Constructs a new AuthController object.
   */
  public function __construct(UserAuthInterface $user_auth, AccountInterface $current_user, JwtTranscoderInterface $jwt_transcoder) {
    $this->userAuth = $user_auth;
    $this->currentUser = $current_user;
    $this->jwtTranscoder = $jwt_transcoder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.auth'),
      $container->get('current_user'),
      $container->get('jwt.transcoder')
    );
  }

  /**
   * Login endpoint.
   */
  public function login(Request $request) {
    try {
      $data = Json::decode($request->getContent());
      
      if (empty($data['email']) || empty($data['password'])) {
        return new JsonResponse([
          'message' => 'Email and password are required',
        ], 400);
      }

      // Authenticate user
      $uid = $this->userAuth->authenticate($data['email'], $data['password']);
      
      if (!$uid) {
        return new JsonResponse([
          'message' => 'Invalid email or password',
        ], 401);
      }

      $user = User::load($uid);
      
      if (!$user || !$user->isActive()) {
        return new JsonResponse([
          'message' => 'Account is blocked or does not exist',
        ], 401);
      }

      // Generate JWT token
      $payload = [
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60), // 7 days
        'uid' => $user->id(),
        'sub' => $user->getAccountName(),
      ];

      $token = $this->jwtTranscoder->encode($payload);

      // Get user role
      $roles = $user->getRoles();
      $custom_role = 'parent'; // default
      foreach (['creator', 'educator', 'parent'] as $role) {
        if (in_array($role, $roles)) {
          $custom_role = $role;
          break;
        }
      }

      return new JsonResponse([
        'user' => [
          'id' => $user->id(),
          'email' => $user->getEmail(),
          'name' => $user->getDisplayName(),
          'role' => $custom_role,
        ],
        'token' => $token,
      ]);

    } catch (\Exception $e) {
      return new JsonResponse([
        'message' => 'An error occurred during login',
      ], 500);
    }
  }

  /**
   * Register endpoint.
   */
  public function register(Request $request) {
    try {
      $data = Json::decode($request->getContent());
      
      // Validate required fields
      $required_fields = ['email', 'password', 'firstName', 'lastName', 'role'];
      foreach ($required_fields as $field) {
        if (empty($data[$field])) {
          return new JsonResponse([
            'message' => ucfirst($field) . ' is required',
          ], 400);
        }
      }

      // Check if user already exists
      $existing_user = user_load_by_mail($data['email']);
      if ($existing_user) {
        return new JsonResponse([
          'message' => 'An account with this email already exists',
        ], 400);
      }

      // Validate role
      if (!in_array($data['role'], ['parent', 'educator', 'creator'])) {
        return new JsonResponse([
          'message' => 'Invalid role selected',
        ], 400);
      }

      // Create user
      $user = User::create([
        'name' => $data['email'],
        'mail' => $data['email'],
        'pass' => $data['password'],
        'status' => 1,
        'field_first_name' => $data['firstName'],
        'field_last_name' => $data['lastName'],
      ]);

      $user->addRole($data['role']);
      $user->save();

      // Auto-login after registration
      // Generate JWT token
      $payload = [
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60), // 7 days
        'uid' => $user->id(),
        'sub' => $user->getAccountName(),
      ];

      $token = $this->jwtTranscoder->encode($payload);

      return new JsonResponse([
        'user' => [
          'id' => $user->id(),
          'email' => $user->getEmail(),
          'name' => $data['firstName'] . ' ' . $data['lastName'],
          'role' => $data['role'],
        ],
        'token' => $token,
      ], 201);

    } catch (\Exception $e) {
      return new JsonResponse([
        'message' => 'An error occurred during registration',
      ], 500);
    }
  }

  /**
   * Logout endpoint.
   */
  public function logout(Request $request) {
    // For JWT, we can't invalidate tokens server-side easily
    // The frontend should remove the token from storage
    return new JsonResponse([
      'message' => 'Logged out successfully',
    ]);
  }

  /**
   * Get current user endpoint.
   */
  public function me(Request $request) {
    $user = User::load($this->currentUser->id());
    
    if (!$user) {
      return new JsonResponse([
        'message' => 'User not found',
      ], 404);
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

    return new JsonResponse([
      'user' => [
        'id' => $user->id(),
        'email' => $user->getEmail(),
        'name' => $user->getDisplayName(),
        'role' => $custom_role,
      ],
    ]);
  }
}