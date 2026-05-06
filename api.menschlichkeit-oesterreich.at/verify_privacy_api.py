"""
Quick verification script for Right to Erasure API implementation.
Run this after starting the API server (uvicorn).
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def verify_routes_structure():
    """Verify that privacy routes module structure is correct"""
    try:
        from app.routes import privacy
        print("✅ Privacy routes module imported successfully")
        
        # Check router
        assert hasattr(privacy, 'router'), "Missing router object"
        print("✅ Router object exists")
        
        # Check endpoint functions
        endpoints = [
            'request_data_deletion',
            'get_data_deletion_requests',
            'process_data_deletion_request',
            'get_all_deletion_requests_admin',
            'privacy_health_check'
        ]
        
        for endpoint in endpoints:
            assert hasattr(privacy, endpoint), f"Missing endpoint: {endpoint}"
            print(f"✅ Endpoint exists: {endpoint}")
        
        # Check data models
        models = ['DataDeletionRequest', 'DeletionStatus', 'ProcessDeletionRequest']
        for model in models:
            assert hasattr(privacy, model), f"Missing model: {model}"
            print(f"✅ Model exists: {model}")
        
        print("\n🎉 All structural checks passed!")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def verify_api_integration():
    """Verify that main.py integrates privacy routes"""
    try:
        from app import main
        print("\n✅ Main API module imported successfully")
        
        # Check if privacy router is included
        app = main.app
        routes = [route.path for route in app.routes]
        
        privacy_routes = [r for r in routes if r.startswith('/privacy')]
        print(f"✅ Found {len(privacy_routes)} privacy routes:")
        for route in privacy_routes:
            print(f"   - {route}")
        
        assert len(privacy_routes) > 0, "No privacy routes found in app"
        
        print("\n🎉 API integration verified!")
        return True
        
    except Exception as e:
        print(f"❌ Integration verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("GDPR Right to Erasure API - Verification Script")
    print("=" * 60)
    
    success = verify_routes_structure()
    if success:
        success = verify_api_integration()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ ALL CHECKS PASSED - Ready for testing!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Start API: cd api.menschlichkeit-oesterreich.at && uvicorn app.main:app --reload")
        print("2. Test endpoint: curl http://localhost:8000/privacy/health")
        print("3. View OpenAPI docs: http://localhost:8000/docs")
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ VERIFICATION FAILED - Fix errors above")
        print("=" * 60)
        sys.exit(1)
