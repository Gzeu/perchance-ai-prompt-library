#!/bin/bash
# Setup script for IBM Cloud deployment

set -e

echo "🚀 Setting up IBM Cloud deployment for Perchance AI Prompt Library..."

# Check IBM Cloud CLI
if ! command -v ibmcloud &> /dev/null; then
    echo "Installing IBM Cloud CLI..."
    curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
fi

# Install plugins
echo "📦 Installing IBM Cloud plugins..."
ibmcloud plugin install code-engine -f
ibmcloud plugin install container-registry -f
ibmcloud plugin install cloud-functions -f

# Login check
echo "🔐 Checking IBM Cloud authentication..."
if ! ibmcloud target &> /dev/null; then
    echo "Please login to IBM Cloud:"
    ibmcloud login --sso
fi

# Set target region
ibmcloud target -r us-south -g Default

echo "✅ IBM Cloud CLI setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create Code Engine project: ibmcloud ce project create --name gzeu-cloud-deployment"
echo "2. Create Container Registry namespace: ibmcloud cr namespace-add gzeu-registry"
echo "3. Setup Cloudant database: ibmcloud resource service-instance-create gzeu-cloudant cloudantnosqldb lite us-south"
echo "4. Deploy application: ./deploy.sh"
echo ""
echo "🔗 Useful commands:"
echo "- View projects: ibmcloud ce project list"
echo "- View apps: ibmcloud ce app list"
echo "- View logs: ibmcloud ce app logs --name perchance-ai-prompt"
echo "- Scale app: ibmcloud ce app update --name perchance-ai-prompt --max-scale 5"