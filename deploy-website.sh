#!/bin/bash

# Navikko Website Deployment Script
# This script deploys the Navikko website to Vercel

set -e

echo "🚀 Navikko Website Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if website directory exists
if [ ! -d "website" ]; then
    echo "❌ Error: website directory not found."
    exit 1
fi

echo "📁 Checking website files..."

# Check required files
required_files=("website/index.html" "website/beta-promo-system.html")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found."
        exit 1
    fi
    echo "✅ Found: $file"
done

echo ""
echo "🔧 Pre-deployment checks..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is available"

# Validate vercel.json
echo "🔍 Validating vercel.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))"; then
    echo "❌ Error: Invalid vercel.json file"
    exit 1
fi
echo "✅ vercel.json is valid"

echo ""
echo "🌐 GitHub Deployment Workflow:"
echo "1. Commit and push to GitHub (recommended)"
echo "2. Check deployment status"
echo "3. Manual Vercel deployment (emergency only)"
echo ""

read -p "Choose deployment option (1-3): " choice

case $choice in
    1)
        echo "🚀 Preparing GitHub deployment..."
        
        # Check if there are changes to commit
        if git diff --quiet && git diff --staged --quiet; then
            echo "ℹ️  No changes to commit. Repository is up to date."
        else
            echo "📝 Changes detected. Committing..."
            git add .
            read -p "Enter commit message (or press Enter for default): " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="Deploy website with beta promotional code system"
            fi
            git commit -m "$commit_msg"
        fi
        
        echo "📤 Pushing to GitHub..."
        git push origin main
        
        echo "✅ Pushed to GitHub! Vercel will auto-deploy."
        echo "🔗 Monitor deployment at: https://vercel.com/dashboard"
        ;;
    2)
        echo "📊 Checking deployment status..."
        echo "🔗 Visit: https://vercel.com/dashboard"
        echo "🔗 Test website: https://navikko.com"
        echo "🔗 Test beta: https://navikko.com/beta"
        ;;
    3)
        echo "⚠️  Emergency manual deployment..."
        echo "This bypasses GitHub workflow. Use only if necessary."
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            vercel --prod --yes
        else
            echo "❌ Manual deployment cancelled"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "□ Test website functionality"
echo "□ Test beta access with promo codes"
echo "□ Verify redirects to main app"
echo "□ Check mobile responsiveness"
echo "□ Test all language versions"
echo ""
echo "🔗 Useful links:"
echo "• Vercel Dashboard: https://vercel.com/dashboard"
echo "• Deployment Guide: ./NAVIKKO_DEPLOYMENT_GUIDE.md"
echo "• Beta Codes: Check website/beta-promo-system.html"
echo ""
echo "🎉 Happy deploying!"