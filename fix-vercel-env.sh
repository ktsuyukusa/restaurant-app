#!/bin/bash

echo "🔧 Fixing Vercel Environment Variables for Database Connection Issue"
echo "=================================================================="

# Remove incorrect environment variables
echo "📝 Removing incorrect VITE_SUPABASE_URL..."
vercel env rm VITE_SUPABASE_URL --yes

echo "📝 Removing incorrect VITE_SUPABASE_ANON_KEY..."
vercel env rm VITE_SUPABASE_ANON_KEY --yes

# Add correct environment variables
echo "✅ Adding correct VITE_SUPABASE_URL..."
echo "https://qqcoooscyzhyzmrcvsxi.supabase.co" | vercel env add VITE_SUPABASE_URL production

echo "✅ Adding correct VITE_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E" | vercel env add VITE_SUPABASE_ANON_KEY production

# Also add for preview and development environments
echo "✅ Adding for preview environment..."
echo "https://qqcoooscyzhyzmrcvsxi.supabase.co" | vercel env add VITE_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E" | vercel env add VITE_SUPABASE_ANON_KEY preview

echo "✅ Adding for development environment..."
echo "https://qqcoooscyzhyzmrcvsxi.supabase.co" | vercel env add VITE_SUPABASE_URL development
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxY29vb3NjeXpoeXptcmN2c3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ2MTMsImV4cCI6MjA2OTAwMDYxM30.8PIgWiNvwcUVKWyK6dH74eafBMgD-mfhaRZeanCzb6E" | vercel env add VITE_SUPABASE_ANON_KEY development

echo "🚀 Triggering deployment to apply changes..."
vercel --prod

echo "✅ Environment variables fixed! Your production site should now connect to the correct database."
echo "🔍 Check navikko.com in a few minutes to verify the fix."