import requests
import json

BASE_URL = "https://api.minutemaker.tech"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
HEALTH_URL = f"{BASE_URL}/health"

def test_endpoint(url, method="GET", data=None):
    print(f"Testing {method} {url}...")
    try:
        if method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        try:
            print(f"Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Body (Text): {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 50)

if __name__ == "__main__":
    # 1. Test Health Check
    test_endpoint(HEALTH_URL)

    # 2. Test Login (expect 400 or 401, but NOT 404)
    test_endpoint(LOGIN_URL, method="POST", data={"email": "test@test.com", "password": "password"})
