#!/bin/bash

echo "Deploying Firestore indexes..."
echo "This will fix the 'query requires an index' error."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Deploy only the Firestore indexes
firebase deploy --only firestore:indexes

echo ""
echo "Index deployment complete! The notes query should now work properly."
