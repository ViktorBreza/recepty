"""
Basic tests for Kitkuhar application
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_application_imports():
    """Test that main application modules can be imported"""
    try:
        from app import models, schemas, auth
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import application modules: {e}")

def test_environment_variables():
    """Test that environment variables are handled properly"""
    from app.auth import SECRET_KEY, ALGORITHM
    
    # Should not be empty
    assert SECRET_KEY is not None
    assert SECRET_KEY != ""
    assert ALGORITHM == "HS256"

def test_password_hashing():
    """Test password hashing functionality"""
    from app.auth import get_password_hash, verify_password
    
    password = "test_password_123"
    hashed = get_password_hash(password)
    
    # Hash should be different from original
    assert hashed != password
    assert len(hashed) > 10
    
    # Verification should work
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_health_check():
    """Test basic application health"""
    # This is a placeholder - would need actual FastAPI app setup
    assert True  # Basic smoke test