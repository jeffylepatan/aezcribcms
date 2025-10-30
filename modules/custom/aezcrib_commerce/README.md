# AezCrib Commerce Module

This Drupal custom module provides the AezCoins donation and worksheet purchase system for the AezCrib educational platform.

## Features

### 🪙 AezCoins Credit System
- **Digital Currency**: 1 PHP = 10 AezCoins conversion rate
- **Credit Management**: Add, deduct, and track user credits
- **Transaction Tracking**: Complete history of credit purchases and usage
- **Manual Verification**: Admin can approve credit transactions manually

### 🛒 Worksheet Purchase System
- **AezCoins Payments**: Purchase worksheets using digital credits
- **Ownership Tracking**: Prevent duplicate purchases
- **Download Access**: Secure PDF downloads for purchased content
- **Purchase History**: Complete record of all worksheet purchases

### 📊 Smart Recommendations
- **Personalized Suggestions**: Based on purchase history and preferences
- **Subject-Based**: Recommendations by preferred subjects
- **Grade Level Matching**: Suggestions for appropriate grade levels
- **Popular Content**: Trending worksheets across the platform

### 📈 Transaction Management
- **Dual Transaction Types**: Credit purchases and worksheet purchases
- **Status Tracking**: Pending, completed, failed, and refunded statuses
- **Receipt Management**: Image upload for payment verification
- **Real Money Tracking**: Links digital credits to actual donations. 

## Installation

1. Place the module in `modules/custom/aezcrib_commerce/`
2. Enable the module via Drupal admin or drush:
   ```bash
   drush en aezcrib_commerce
   ```
3. The module will automatically:
   - Add `field_credits` to user entities
   - Create `credit_transaction` and `purchase_transaction` content types
   - Set up all required fields and configurations

## API Endpoints

### Credit Management
- `GET /api/aezcrib/credits` - Get user's current balance
- `POST /api/aezcrib/credits/add` - Request credit addition
- `GET /api/aezcrib/credits/rates` - Get conversion rates

### Worksheet Operations
- `GET /api/aezcrib/user/worksheets` - Get purchased worksheets
- `POST /api/aezcrib/purchase/worksheet/{id}` - Purchase a worksheet
- `GET /api/aezcrib/purchase/check/{id}` - Check purchase eligibility
- `GET /api/aezcrib/download/worksheet/{id}` - Download purchased PDF

### Transactions & History
- `GET /api/aezcrib/user/transactions` - Get transaction history
- `GET /api/aezcrib/user/stats` - Get transaction statistics

### Recommendations
- `GET /api/aezcrib/recommendations` - Get personalized recommendations
- `GET /api/aezcrib/popular` - Get popular worksheets

## Content Types Created

### Credit Transaction
Fields:
- `field_transaction_amount` (Integer) - AezCoins amount
- `field_real_money_amount` (Decimal) - PHP amount donated
- `field_payment_method` (String) - Payment method used
- `field_payment_reference` (String) - Payment reference number
- `field_transaction_status` (List) - pending/completed/failed/refunded
- `field_receipt_image` (Image) - Receipt upload for verification
- `field_user_reference` (Entity Reference) - User who made transaction

### Purchase Transaction
Fields:
- `field_worksheet_reference` (Entity Reference) - Purchased worksheet
- `field_purchase_amount` (Integer) - AezCoins spent
- `field_purchase_status` (List) - completed/refunded
- `field_user_reference` (Entity Reference) - User who made purchase

## Required Worksheet Fields

Your existing worksheet content type should have:
- `field_worksheet_price` (Integer) - Price in AezCoins
- `field_worksheet` (File) - PDF file for download
- `field_worksheet_subject` (List Text) - Subject category
- `field_worksheet_level` (List Text) - Grade level
- `field_worksheet_image` (Image) - Optional thumbnail

## Services Available

### CreditService
- `getUserCredits($user_id)` - Get user's credit balance
- `addCredits($user_id, $amount)` - Add credits to account
- `deductCredits($user_id, $amount)` - Deduct credits from account
- `createCreditTransaction()` - Create transaction record

### PurchaseService
- `purchaseWorksheet($user_id, $worksheet_id)` - Purchase worksheet
- `userOwnsWorksheet($user_id, $worksheet_id)` - Check ownership
- `getUserPurchasedWorksheets($user_id)` - Get user's worksheets

### RecommendationService
- `getRecommendationsForUser($user_id, $limit)` - Get personalized recommendations

## Admin Workflow

### Processing Credit Requests
1. User submits credit request with payment details
2. Transaction created with 'pending' status
3. Admin reviews payment receipt
4. Admin changes status to 'completed' 
5. Credits automatically added to user account

### Manual Credit Addition
```php
// Add 100 AezCoins to user ID 5
$credit_service = \Drupal::service('aezcrib_commerce.credit_service');
$credit_service->addCredits(5, 100);
```

## Integration with Frontend

The React dashboard can call these endpoints:

```javascript
// Get user credits
const response = await fetch('/api/aezcrib/credits');
const data = await response.json();

// Purchase worksheet
const purchase = await fetch('/api/aezcrib/purchase/worksheet/123', {
  method: 'POST'
});

// Get recommendations
const recs = await fetch('/api/aezcrib/recommendations');
```

## Database Schema

The module creates:
- User field: `field_credits` (Integer)
- Content types: `credit_transaction`, `purchase_transaction`
- All associated field storage and configurations

## Logging

All transactions are logged to the 'aezcrib_commerce' log channel for audit purposes.

## Security Features

- All endpoints require authentication
- Users can only access their own data
- File downloads verified against ownership
- SQL injection protection via Entity API
- CSRF protection on all POST requests

## Configuration

No additional configuration needed - the module works out of the box after installation.

## Troubleshooting

### Common Issues
1. **Credits not adding**: Check transaction status is 'completed'
2. **Download not working**: Verify PDF file exists and user owns worksheet
3. **Recommendations empty**: User needs purchase history for personalization

### Debug Commands
```bash
# Check user credits
drush eval "echo aezcrib_commerce_get_user_credits(1);"

# Check if user owns worksheet
drush eval "echo aezcrib_commerce_user_owns_worksheet(1, 123) ? 'Yes' : 'No';"
```