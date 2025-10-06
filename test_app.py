from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    # Test user registration
    response = client.post("/register", json={"email": "guptamahima108@gmail.com", "password": "Test@1234"})
    print("Register Response:", response.status_code, response.json())

    # Test login
    response = client.post("/login", json={"email": "testuser@example.com", "password": "Test@1234"})
    print("Login Response:", response.status_code, response.json())

    # Test workflow creation
    response = client.post("/workflow", json={"name": "Test Workflow", "description": "Sample workflow"})
    print("Create Workflow Response:", response.status_code, response.json())

    # List workflows
    response = client.get("/workflow")
    print("List Workflows Response:", response.status_code, response.json())


if __name__ == "__main__":
    run_tests()
