#!/bin/bash

# Deploy auth fix to live site
echo "Deploying authentication fix to live site..."

# Upload the updated AuthController
echo "Uploading AuthController.php..."
scp modules/custom/aezcrib_auth/src/Controller/AuthController.php u382181170@aezcrib.xyz:public_html/app/modules/custom/aezcrib_auth/src/Controller/

# Upload the updated CreditController
echo "Uploading CreditController.php..."
scp modules/custom/aezcrib_commerce/src/Controller/CreditController.php u382181170@aezcrib.xyz:public_html/app/modules/custom/aezcrib_commerce/src/Controller/

echo "Files uploaded successfully!"
echo "Please clear Drupal cache via admin interface: Configuration > Performance > Clear all caches"