#!/bin/bash

# GitHub Pages Setup Script
# This script helps set up GitHub Pages deployment for the NetPulse React app

echo "🚀 GitHub Pages Setup for NetPulse React"
echo "========================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    echo "Please run this script from the root of your git repository"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the root of your React project"
    exit 1
fi

echo "✅ Git repository detected"
echo "✅ React project detected"
echo ""

# Get repository information
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    echo "❌ Error: No remote origin found"
    echo "Please add a GitHub remote origin first:"
    echo "git remote add origin https://github.com/USERNAME/REPOSITORY.git"
    exit 1
fi

# Extract username and repository name from URL
if [[ $REPO_URL == *"github.com"* ]]; then
    # Remove .git suffix if present
    REPO_URL=${REPO_URL%.git}
    
    # Extract from HTTPS URL
    if [[ $REPO_URL == https://github.com/* ]]; then
        REPO_PATH=${REPO_URL#https://github.com/}
    # Extract from SSH URL
    elif [[ $REPO_URL == git@github.com:* ]]; then
        REPO_PATH=${REPO_URL#git@github.com:}
    else
        echo "❌ Error: Could not parse GitHub repository URL"
        exit 1
    fi
    
    USERNAME=$(echo $REPO_PATH | cut -d'/' -f1)
    REPOSITORY=$(echo $REPO_PATH | cut -d'/' -f2)
    
    echo "📋 Repository Information:"
    echo "   Username: $USERNAME"
    echo "   Repository: $REPOSITORY"
    echo "   GitHub Pages URL: https://$USERNAME.github.io/$REPOSITORY"
    echo ""
else
    echo "❌ Error: Remote origin is not a GitHub repository"
    echo "GitHub Pages only works with GitHub repositories"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Warning: You're not on the main/master branch"
    echo "GitHub Pages deployment is configured for the 'main' branch"
    echo ""
fi

# Verify workflow file exists
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ Error: GitHub Actions workflow file not found"
    echo "Expected: .github/workflows/deploy.yml"
    echo "Please ensure the workflow file is created"
    exit 1
fi

echo "✅ GitHub Actions workflow file found"

# Check if homepage is correctly set in package.json
EXPECTED_HOMEPAGE="https://$USERNAME.github.io/$REPOSITORY"
CURRENT_HOMEPAGE=$(node -p "require('./package.json').homepage || ''" 2>/dev/null)

if [ "$CURRENT_HOMEPAGE" = "$EXPECTED_HOMEPAGE" ]; then
    echo "✅ Homepage correctly configured in package.json"
else
    echo "⚠️  Homepage in package.json: $CURRENT_HOMEPAGE"
    echo "   Expected: $EXPECTED_HOMEPAGE"
    echo ""
    read -p "Would you like to update the homepage in package.json? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update package.json homepage
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.homepage = '$EXPECTED_HOMEPAGE';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
            console.log('✅ Updated homepage in package.json');
        "
    fi
fi

echo ""
echo "🔧 Setup Instructions:"
echo "======================"
echo ""
echo "1. 📤 Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m \"Add GitHub Pages deployment workflow\""
echo "   git push origin main"
echo ""
echo "2. 🌐 Enable GitHub Pages:"
echo "   • Go to: https://github.com/$USERNAME/$REPOSITORY/settings/pages"
echo "   • Under 'Source', select 'GitHub Actions'"
echo "   • Save the settings"
echo ""
echo "3. 🚀 Trigger deployment:"
echo "   • Push any commit to the main branch, or"
echo "   • Go to Actions tab and manually run the workflow"
echo ""
echo "4. 📱 Access your deployed app:"
echo "   • URL: https://$USERNAME.github.io/$REPOSITORY"
echo "   • It may take a few minutes for the first deployment"
echo ""
echo "🔍 Monitoring:"
echo "=============="
echo "• Check deployment status: https://github.com/$USERNAME/$REPOSITORY/actions"
echo "• View deployment logs for troubleshooting"
echo "• Deployments typically take 2-5 minutes"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Don't forget to commit and push them!"
    echo ""
fi

echo "✅ Setup complete! Follow the instructions above to deploy your app."
