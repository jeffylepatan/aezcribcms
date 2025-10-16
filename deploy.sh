#!/bin/bash

# Hostinger Deployment Script
# This script handles common deployment conflicts

echo "Starting deployment process..."

# Navigate to project directory
cd /path/to/your/project

# Backup any local changes (optional)
git stash

# Force clean untracked files
git clean -fd

# Reset to match remote repository exactly
git reset --hard origin/master

# Pull latest changes
git pull origin master

# Install/update dependencies
composer install --no-dev --optimize-autoloader

echo "Deployment completed successfully!"