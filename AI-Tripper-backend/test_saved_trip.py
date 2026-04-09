import requests

# Register user
user_data = {"username": "testuser999", "email": "testuser999@test.com", "password": "password", "full_name": "Test User"}
res = requests.post("http://localhost:8080/api/auth/register", json=user_data)

login_data = {"username": "testuser999", "password": "password"}
res = requests.post("http://localhost:8080/api/auth/login", data=login_data)
if res.status_code == 200:
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    trip_data = {
        "city": "Rome",
        "country": "Italy",
        "duration_days": 3,
        "travelers": "yalniz",
        "interests": ["kultur", "yemek"],
        "budget": "orta",
        "transport": "farketmez",
        "trip_plan": {"test": "data"},
        "is_saved": True,
        "name": "My Rome Trip"
    }
    
    print("Testing /api/routes/saved POST...")
    res = requests.post("http://localhost:8080/api/routes/saved", headers=headers, json=trip_data)
    print("Status:", res.status_code)
    print(res.text)

    print("Testing /api/routes/saved GET...")
    res = requests.get("http://localhost:8080/api/routes/saved", headers=headers)
    print("Status:", res.status_code)
    print(res.text)
else:
    print("Login failed, code:", res.status_code)
