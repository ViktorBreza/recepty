#!/usr/bin/env python3
"""
Test webhook deployment locally
"""
import requests
import hashlib
import hmac
import json
import sys
import os

def create_signature(payload, secret):
    """Create HMAC-SHA256 signature for webhook"""
    mac = hmac.new(secret.encode(), payload.encode(), hashlib.sha256)
    return f"sha256={mac.hexdigest()}"

def test_webhook(webhook_url, secret):
    """Test webhook deployment"""
    
    # Test payload (similar to GitHub webhook)
    payload = {
        "ref": "refs/heads/main",
        "after": "test123456789",
        "head_commit": {
            "message": "Test deployment via webhook"
        }
    }
    
    payload_str = json.dumps(payload)
    signature = create_signature(payload_str, secret)
    
    headers = {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature
    }
    
    print(f"Testing webhook at: {webhook_url}")
    print(f"Payload: {payload_str}")
    print(f"Signature: {signature}")
    
    try:
        # Test health check first
        health_response = requests.get(f"{webhook_url}/health", timeout=10)
        print(f"Health check status: {health_response.status_code}")
        print(f"Health response: {health_response.json()}")
        
        # Test deployment webhook
        response = requests.post(
            f"{webhook_url}/webhook/deploy",
            data=payload_str,
            headers=headers,
            timeout=30
        )
        
        print(f"Webhook status: {response.status_code}")
        print(f"Webhook response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Webhook test successful!")
            return True
        else:
            print("❌ Webhook test failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 test-webhook.py <webhook_url> <secret>")
        print("Example: python3 test-webhook.py http://localhost:9000 your-secret-here")
        sys.exit(1)
    
    webhook_url = sys.argv[1]
    secret = sys.argv[2]
    
    success = test_webhook(webhook_url, secret)
    sys.exit(0 if success else 1)