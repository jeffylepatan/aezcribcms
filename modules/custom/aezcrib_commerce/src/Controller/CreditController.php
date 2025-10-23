<?php

namespace Drupal\aezcrib_commerce\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\aezcrib_commerce\Service\CreditService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
   * Get user's current credit balance.
   */
  public function getCredits() {
    $user_id = $this->currentUser()->id();
    
    if (!$user_id) {
      return new JsonResponse(['error' => 'User not authenticated'], 401);
    }

    $credits = $this->creditService->getUserCredits($user_id);

    return new JsonResponse([
      'success' => TRUE,
      'credits' => $credits,
      'user_id' => $user_id,
    ]);
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