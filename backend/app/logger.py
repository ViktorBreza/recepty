import logging
import sys
from logging.handlers import TimedRotatingFileHandler
import os
from pathlib import Path

# Create logs directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

def setup_logger(name: str = __name__, level: str = "INFO") -> logging.Logger:
    """
    Sets up logger with required levels and formatting
    """
    logger = logging.getLogger(name)
    
    # If logger is already configured, return it
    if logger.handlers:
        return logger
    
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Log format
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation (daily)
    file_handler = TimedRotatingFileHandler(
        LOG_DIR / "app.log",
        when="midnight",
        interval=1,
        backupCount=7,  # Keep logs for 7 days
        encoding="utf-8"
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Separate file for errors
    error_handler = TimedRotatingFileHandler(
        LOG_DIR / "error.log",
        when="midnight",
        interval=1,
        backupCount=30,  # Keep errors longer
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)
    
    return logger

# Main application logger
app_logger = setup_logger("recipe_app")

def log_request(method: str, url: str, user_id: int = None):
    """Logs HTTP requests"""
    user_info = f"user_id={user_id}" if user_id else "anonymous"
    app_logger.info(f"Request: {method} {url} ({user_info})")

def log_error(error: Exception, context: str = ""):
    """Logs errors with context"""
    app_logger.error(f"Error in {context}: {str(error)}", exc_info=True)

def log_auth_event(event: str, user_id: int = None, username: str = None):
    """Logs authentication events"""
    user_info = f"user_id={user_id}, username={username}" if user_id and username else "unknown user"
    app_logger.info(f"Auth event: {event} ({user_info})")

def log_database_event(operation: str, table: str, record_id: int = None):
    """Logs database operations"""
    record_info = f"id={record_id}" if record_id else "bulk operation"
    app_logger.info(f"Database {operation}: {table} ({record_info})")