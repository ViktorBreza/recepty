#!/bin/bash
# Database backup script for Kitkuhar

# Configuration
CONTAINER_NAME="kitkuhar-db"
DB_NAME="kitkuhar"
DB_USER="kitkuhar_user"
BACKUP_DIR="/home/baktorz/kitkuhar/database/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kitkuhar_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
echo "Creating database backup..."
sudo docker exec -e PGPASSWORD=kitkuhar_password_2024 "$CONTAINER_NAME" \
    pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" \
    > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Keep only the last 7 backups
    cd "$BACKUP_DIR"
    ls -t kitkuhar_backup_*.sql | tail -n +8 | xargs -r rm
    echo "Old backups cleaned up (keeping last 7)"
else
    echo "Backup failed!"
    exit 1
fi