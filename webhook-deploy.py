#!/usr/bin/env python3
"""
Simple webhook service for deploying KitKuhar on Raspberry Pi
"""
import os
import subprocess
import logging
import hashlib
import hmac
from flask import Flask, request, jsonify
import threading
import time

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get webhook secret from environment
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'your-webhook-secret-here')
DEPLOY_DIR = '/home/baktorz/kitkuhar'

def verify_signature(payload_body, secret, signature):
    """Verify GitHub webhook signature"""
    if not signature:
        return False
    
    sha_name, signature = signature.split('=')
    if sha_name != 'sha256':
        return False
    
    mac = hmac.new(secret.encode(), payload_body, hashlib.sha256)
    expected_signature = mac.hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def run_deployment():
    """Run deployment commands in background"""
    try:
        logger.info("Starting deployment...")
        
        # Change to project directory
        os.chdir(DEPLOY_DIR)
        
        # Run deployment commands
        commands = [
            "git pull origin main",
            "cp .env.production .env",
            "docker-compose down",
            "docker-compose up --build -d",
            "docker-compose ps"
        ]
        
        for cmd in commands:
            logger.info(f"Executing: {cmd}")
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                logger.error(f"Command failed: {cmd}")
                logger.error(f"Error: {result.stderr}")
                return False
            else:
                logger.info(f"Success: {result.stdout}")
        
        logger.info("Deployment completed successfully!")
        return True
        
    except subprocess.TimeoutExpired:
        logger.error("Deployment timed out after 5 minutes")
        return False
    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        return False

@app.route('/webhook/deploy', methods=['POST'])
def deploy_webhook():
    """Handle deployment webhook from GitHub"""
    try:
        # Get request data
        payload = request.get_data()
        signature = request.headers.get('X-Hub-Signature-256', '')
        
        logger.info(f"Received webhook request, signature: {signature}")
        logger.info(f"Payload length: {len(payload)} bytes")
        
        # Verify signature
        if not verify_signature(payload, WEBHOOK_SECRET, signature):
            logger.warning("Invalid webhook signature")
            return jsonify({'error': 'Invalid signature'}), 403
        
        # Parse JSON
        try:
            data = request.get_json()
            if data is None:
                logger.error("Failed to parse JSON from request")
                return jsonify({'error': 'Invalid JSON'}), 400
        except Exception as json_error:
            logger.error(f"JSON parse error: {str(json_error)}")
            logger.error(f"Raw payload: {payload.decode('utf-8', errors='ignore')}")
            return jsonify({'error': 'Invalid JSON format'}), 400
        
        # Check if it's a push to main branch
        if data.get('ref') != 'refs/heads/main':
            logger.info(f"Ignoring push to branch: {data.get('ref')}")
            return jsonify({'message': 'Not main branch, ignoring'}), 200
        
        # Log deployment request
        commit_sha = data.get('after', 'unknown')[:8]
        commit_msg = data.get('head_commit', {}).get('message', 'No message')
        logger.info(f"Deployment requested for commit {commit_sha}: {commit_msg}")
        
        # Run deployment in background thread
        deployment_thread = threading.Thread(target=run_deployment)
        deployment_thread.daemon = True
        deployment_thread.start()
        
        return jsonify({
            'message': 'Deployment started',
            'commit': commit_sha
        }), 200
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'kitkuhar-webhook',
        'timestamp': time.time()
    })

@app.route('/status', methods=['GET'])
def deployment_status():
    """Check Docker containers status"""
    try:
        os.chdir(DEPLOY_DIR)
        result = subprocess.run("docker-compose ps", shell=True, capture_output=True, text=True)
        
        return jsonify({
            'containers': result.stdout,
            'success': result.returncode == 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('WEBHOOK_PORT', 9000))
    logger.info(f"Starting webhook service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)