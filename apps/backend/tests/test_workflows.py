import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from bson import ObjectId
from mongomock_motor import AsyncMongoMockClient
import beanie

from app.main import app
from app.models.workflow import WorkflowStatus, VariableType, VariableScope, Workflow
from app.core.database import get_database, connect_to_mongo, close_mongo_connection

# Set up mock MongoDB for testing
@pytest_asyncio.fixture(autouse=True)
async def mock_db():
    client = AsyncMongoMockClient()
    db = client.test_database

    # Initialize Beanie with the test database
    await beanie.init_beanie(
        database=db,
        document_models=[Workflow]
    )

    # Override the database dependency
    async def get_test_database():
        return db

    app.dependency_overrides[get_database] = get_test_database
    yield db
    app.dependency_overrides.clear()

client = TestClient(app)

# Sample data for workflow creation
sample_workflow = {
    "name": "Test Workflow",
    "nodes": [
        {
            "id": "node1",
            "type": "start",
            "position": {"x": 100, "y": 100},
            "config": {}
        },
        {
            "id": "node2",
            "type": "task",
            "position": {"x": 200, "y": 200},
            "config": {"action": "print"}
        }
    ],
    "edges": [
        {
            "from": "node1",
            "to": "node2"
        }
    ],
    "variables": [
        {
            "id": "var1",
            "name": "test_var",
            "value": "test_value",
            "type": VariableType.STRING.value,
            "description": "Test variable",
            "secret": False,
            "scope": VariableScope.WORKFLOW.value
        }
    ],
    "status": WorkflowStatus.DRAFT.value,
    "metadata": {
        "description": "Test workflow description",
        "tags": ["test", "demo"],
        "author": "test_user",
        "version": "1.0.0"
    }
}

def test_create_workflow():
    response = client.post("/workflows/", json=sample_workflow)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_workflow["name"]
    # Store the workflow ID for other tests
    return data["_id"]

def test_get_all_workflows():
    response = client.get("/workflows/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Verify the summary fields are present
    for workflow in data:
        assert all(key in workflow for key in ["id", "name", "status", "updated_at"])

def test_get_workflow_by_id(created_workflow_id):
    response = client.get(f"/workflows/{created_workflow_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == sample_workflow["name"]
    assert data["_id"] == created_workflow_id

def test_get_workflow_not_found():
    non_existent_id = str(ObjectId())
    response = client.get(f"/workflows/{non_existent_id}")
    assert response.status_code == 404

def test_update_workflow(created_workflow_id):
    update_data = {
        "name": "Updated Test Workflow",
        "metadata": {
            "description": "Updated description",
            "tags": ["test", "updated"],
            "version": "1.0.1"
        }
    }
    response = client.put(f"/workflows/{created_workflow_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["metadata"]["description"] == update_data["metadata"]["description"]
    assert data["metadata"]["version"] == update_data["metadata"]["version"]

def test_delete_workflow(created_workflow_id):
    # Delete the workflow
    response = client.delete(f"/workflows/{created_workflow_id}")
    assert response.status_code == 200
    
    # Verify it's been deleted by trying to get it
    response = client.get(f"/workflows/{created_workflow_id}")
    assert response.status_code == 404

# Test invalid ID format
def test_invalid_workflow_id():
    invalid_id = "not-a-valid-id"
    
    # Test GET with invalid ID
    response = client.get(f"/workflows/{invalid_id}")
    assert response.status_code == 400
    
    # Test PUT with invalid ID
    response = client.put(
        f"/workflows/{invalid_id}",
        json={"name": "Test Update"}
    )
    assert response.status_code == 400
    
    # Test DELETE with invalid ID
    response = client.delete(f"/workflows/{invalid_id}")
    assert response.status_code == 400

@pytest.fixture
def created_workflow_id(request):
    """Fixture to create a workflow and clean it up after tests"""
    workflow_id = test_create_workflow()
    
    def cleanup():
        client.delete(f"/workflows/{workflow_id}")
    
    request.addfinalizer(cleanup)
    return workflow_id