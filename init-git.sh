#!/bin/bash

# Initialize Git Repository for Hostel Marketplace

echo "Initializing Git repository for Hostel Marketplace..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git and try again."
    exit 1
fi

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Hostel Marketplace project setup"

echo "Git repository initialized successfully!"
echo "Next steps:"
echo "1. Create a new repository on GitHub/GitLab/Bitbucket"
echo "2. Add the remote repository:"
echo "   git remote add origin https://github.com/yourusername/hostel-marketplace.git"
echo "3. Push to the remote repository:"
echo "   git push -u origin main"

exit 0 