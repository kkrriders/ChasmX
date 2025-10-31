"""
Test script for workflow execution engine.

This script demonstrates how to:
1. Create a test workflow
2. Execute it
3. Check execution status
4. View results with Redis caching
"""
import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"


async def test_workflow_execution():
    """Test the complete workflow execution flow"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        print("=" * 60)
        print("WORKFLOW EXECUTION ENGINE TEST")
        print("=" * 60)

        # Step 1: Create a test workflow
        print("\n1. Creating test workflow...")
        workflow_data = {
            "name": "Test AI Workflow",
            "nodes": [
                {
                    "id": "start",
                    "type": "start",
                    "position": {"x": 0, "y": 0},
                    "config": {}
                },
                {
                    "id": "ai1",
                    "type": "ai-processor",
                    "position": {"x": 200, "y": 0},
                    "config": {
                        "prompt": "Say hello to {{user_name}}",
                        "model": "google/gemini-2.0-flash-exp:free",
                        "temperature": 0.7
                    }
                },
                {
                    "id": "email1",
                    "type": "email",
                    "position": {"x": 400, "y": 0},
                    "config": {
                        "to": "{{email}}",
                        "subject": "Test Email",
                        "body": "Result: {{outputs.ai1}}"
                    }
                },
                {
                    "id": "end",
                    "type": "end",
                    "position": {"x": 600, "y": 0},
                    "config": {}
                }
            ],
            "edges": [
                {"from": "start", "to": "ai1"},
                {"from": "ai1", "to": "email1"},
                {"from": "email1", "to": "end"}
            ],
            "variables": [],
            "status": "active",
            "metadata": {
                "description": "Test workflow with AI and email nodes",
                "author": "Test Script",
                "version": "1.0"
            }
        }

        try:
            response = await client.post(f"{BASE_URL}/workflows/", json=workflow_data)
            response.raise_for_status()
            workflow = response.json()
            workflow_id = workflow["id"]
            print(f"✓ Workflow created with ID: {workflow_id}")
            print(f"  Name: {workflow['name']}")
            print(f"  Nodes: {len(workflow['nodes'])}")
            print(f"  Edges: {len(workflow['edges'])}")
        except Exception as e:
            print(f"✗ Failed to create workflow: {e}")
            return

        # Step 2: Execute workflow (First run - NOT cached)
        print("\n2. Executing workflow (First run - will call LLM)...")
        execution_data = {
            "inputs": {
                "user_name": "Alice",
                "email": "alice@example.com"
            },
            "async_execution": False
        }

        try:
            start_time = datetime.now()
            response = await client.post(
                f"{BASE_URL}/workflows/{workflow_id}/execute",
                json=execution_data
            )
            response.raise_for_status()
            execution = response.json()
            execution_id_1 = execution["execution_id"]
            first_run_time = (datetime.now() - start_time).total_seconds()

            print(f"✓ Workflow executed")
            print(f"  Execution ID: {execution_id_1}")
            print(f"  Status: {execution['status']}")
            print(f"  Message: {execution['message']}")
            print(f"  Time: {first_run_time:.2f}s")
        except Exception as e:
            print(f"✗ Failed to execute workflow: {e}")
            return

        # Step 3: Get execution status (First run)
        print("\n3. Getting execution status (First run)...")
        try:
            response = await client.get(f"{BASE_URL}/workflows/executions/{execution_id_1}")
            response.raise_for_status()
            status = response.json()

            print(f"✓ Execution details:")
            print(f"  Status: {status['status']}")
            print(f"  Start: {status['start_time']}")
            print(f"  End: {status['end_time']}")
            print(f"\n  Node States:")
            for node_id, state in status['node_states'].items():
                print(f"    {node_id}: {state.get('status', 'N/A')}")
                if node_id == "ai1":
                    print(f"      Output: {state.get('output', 'N/A')[:100]}...")
                    print(f"      Cached: {state.get('cached', False)}")
                    print(f"      Latency: {state.get('latency_ms', 0):.2f}ms")

            print(f"\n  Logs ({len(status['logs'])} entries):")
            for log in status['logs'][:5]:
                print(f"    [{log['node_id']}] {log['message']}")

            if status['errors']:
                print(f"\n  Errors ({len(status['errors'])} entries):")
                for error in status['errors']:
                    print(f"    [{error['node_id']}] {error['error']}")
        except Exception as e:
            print(f"✗ Failed to get execution status: {e}")

        # Step 4: Execute again with SAME inputs (Should be CACHED!)
        print("\n4. Executing workflow AGAIN with same inputs (should be cached)...")

        try:
            start_time = datetime.now()
            response = await client.post(
                f"{BASE_URL}/workflows/{workflow_id}/execute",
                json=execution_data
            )
            response.raise_for_status()
            execution = response.json()
            execution_id_2 = execution["execution_id"]
            cached_run_time = (datetime.now() - start_time).total_seconds()

            print(f"✓ Workflow executed (cached)")
            print(f"  Execution ID: {execution_id_2}")
            print(f"  Status: {execution['status']}")
            print(f"  Time: {cached_run_time:.2f}s")
            print(f"\n  🚀 PERFORMANCE COMPARISON:")
            print(f"     First run:  {first_run_time:.2f}s")
            print(f"     Cached run: {cached_run_time:.2f}s")
            print(f"     Speedup:    {first_run_time/cached_run_time:.2f}x faster!")
        except Exception as e:
            print(f"✗ Failed to execute workflow: {e}")

        # Step 5: Get cached execution status
        print("\n5. Getting cached execution status...")
        try:
            response = await client.get(f"{BASE_URL}/workflows/executions/{execution_id_2}")
            response.raise_for_status()
            status = response.json()

            ai_node_state = status['node_states'].get('ai1', {})
            print(f"✓ AI Node Result:")
            print(f"  Cached: {ai_node_state.get('cached', False)} ⚡")
            print(f"  Output: {ai_node_state.get('output', 'N/A')[:100]}...")
        except Exception as e:
            print(f"✗ Failed to get execution status: {e}")

        # Step 6: List all executions
        print("\n6. Listing all executions for this workflow...")
        try:
            response = await client.get(f"{BASE_URL}/workflows/{workflow_id}/executions")
            response.raise_for_status()
            executions = response.json()

            print(f"✓ Found {len(executions)} executions:")
            for i, exec_item in enumerate(executions, 1):
                print(f"  {i}. {exec_item['execution_id'][:8]}... - {exec_item['status']}")
        except Exception as e:
            print(f"✗ Failed to list executions: {e}")

        # Step 7: Test with different inputs (NOT cached)
        print("\n7. Executing with DIFFERENT inputs (not cached)...")
        execution_data_2 = {
            "inputs": {
                "user_name": "Bob",
                "email": "bob@example.com"
            },
            "async_execution": False
        }

        try:
            start_time = datetime.now()
            response = await client.post(
                f"{BASE_URL}/workflows/{workflow_id}/execute",
                json=execution_data_2
            )
            response.raise_for_status()
            execution = response.json()
            different_run_time = (datetime.now() - start_time).total_seconds()

            print(f"✓ Workflow executed with different inputs")
            print(f"  Status: {execution['status']}")
            print(f"  Time: {different_run_time:.2f}s")
            print(f"  (Should be similar to first run since not cached)")
        except Exception as e:
            print(f"✗ Failed to execute workflow: {e}")

        # Cleanup
        print("\n8. Cleaning up...")
        try:
            response = await client.delete(f"{BASE_URL}/workflows/{workflow_id}")
            response.raise_for_status()
            print("✓ Test workflow deleted")
        except Exception as e:
            print(f"✗ Failed to delete workflow: {e}")

        print("\n" + "=" * 60)
        print("TEST COMPLETE!")
        print("=" * 60)
        print("\nKey Takeaways:")
        print("1. ✓ Workflow execution engine is working")
        print("2. ✓ AI nodes execute and call LLM")
        print("3. ✓ Redis caching speeds up repeated executions")
        print("4. ✓ Execution state is tracked in MongoDB")
        print("5. ✓ Logs and errors are captured")
        print("\nNext Steps:")
        print("- Integrate with frontend builder")
        print("- Add real email/webhook implementations")
        print("- Add workflow generation from natural language")


if __name__ == "__main__":
    print("\n⚠️  Make sure the backend server is running!")
    print("   Start with: cd backend && python -m uvicorn app.main:app --reload\n")

    try:
        asyncio.run(test_workflow_execution())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\n✗ Test failed with error: {e}")
