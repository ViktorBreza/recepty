#!/bin/bash
# Install and start webhook service on Raspberry Pi

echo "Setting up webhook deployment service..."

# Install Python dependencies
pip3 install -r requirements-webhook.txt

# Create systemd service file
sudo tee /etc/systemd/system/kitkuhar-webhook.service > /dev/null <<EOF
[Unit]
Description=KitKuhar Webhook Deployment Service
After=network.target

[Service]
Type=simple
User=baktorz
WorkingDirectory=/home/baktorz/kitkuhar
Environment=WEBHOOK_SECRET=${WEBHOOK_SECRET:-your-webhook-secret-here}
Environment=WEBHOOK_PORT=9000
ExecStart=/usr/bin/python3 /home/baktorz/kitkuhar/webhook-deploy.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable kitkuhar-webhook
sudo systemctl start kitkuhar-webhook

echo "Webhook service status:"
sudo systemctl status kitkuhar-webhook

echo "Webhook service started on port 9000"
echo "Add to Cloudflare tunnel config:"
echo "  - hostname: webhook.kitkuhar.com"
echo "    service: http://localhost:9000"