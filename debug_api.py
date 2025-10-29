#!/usr/bin/env python3
"""
Simple test to debug the workflow API issue
"""
import asyncio
import httpx
import json

async def debug_api():
    client = httpx.AsyncClient(base_url="http://localhost:8000", timeout=30)
    
    try:
        # Test health endpoint
        print("Testing health endpoint...")
        response = await client.get("/health")
        print(f"Health Status: {response.status_code}")
        print(f"Health Response: {response.text}")
        
        # Test API docs
        print("\nTesting API docs...")
        response = await client.get("/docs")
        print(f"Docs Status: {response.status_code}")
        
        # Test workflows endpoint with simple data
        print("\nTesting workflow creation...")
        simple_workflow = {
            "name": "Debug Test Workflow",
            "nodes": [
                {
                    "id": "start-1",
                    "type": "start",
                    "position": {"x": 100, "y": 100},
                    "config": {"message": "Starting"}
                }
            ],
            "edges": [],
            "variables": [],
            "status": "draft",
            "metadata": {
                "description": "Simple debug test",
                "tags": ["test"]
            }
        }
        
        print(f"Sending workflow data: {json.dumps(simple_workflow, indent=2)}")
        
        response = await client.post("/workflows/", json=simple_workflow)
        print(f"Create Status: {response.status_code}")
        print(f"Create Response: {response.text}")
        print(f"Response Headers: {response.headers}")
        
        if response.status_code != 201:
            print("❌ Workflow creation failed")
            # Try to get more detail
            try:
                error_detail = response.json()
                print(f"Error Detail: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"Raw response: {response.text}")
        else:
            print("✅ Workflow created successfully")
            
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
    
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(debug_api())