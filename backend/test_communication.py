"""
Test script for node-to-node communication functionality.

This script creates and executes test workflows to verify that:
1. Nodes can ask questions to each other
2. Communication logs are properly stored
3. The execution completes successfully
"""
import asyncio
import httpx
import json
from datetime import datetime


async def test_basic_communication():
    """Test basic node-to-node communication"""
    print("\n" + "="*60)
    print("TEST 1: Basic Node Communication")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create workflow with 2 communicating nodes
        workflow = {
            "name": "Communication Test - Basic Q&A",
            "nodes": [
                {
                    "id": "asker",
                    "type": "ai-processor",
                    "position": {"x": 100, "y": 100},
                    "config": {
                        "name": "Asker",
                        "prompt": "What is 2+2? Use the CALL format to ask node 'calculator' for the answer: CALL: ask_node('calculator', 'What is 2+2?')",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                },
                {
                    "id": "calculator",
                    "type": "ai-processor",
                    "position": {"x": 400, "y": 100},
                    "config": {
                        "name": "Calculator",
                        "description": "I can solve math problems",
                        "prompt": "You are a calculator. When asked math questions, provide the answer.",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                }
            ],
            "edges": [{"from": "asker", "to": "calculator"}],
            "variables": [],
            "status": "active",
            "metadata": {
                "description": "Test workflow for node communication",
                "tags": ["test", "communication"]
            }
        }

        # Create workflow
        print("\n📝 Creating workflow...")
        try:
            resp = await client.post("http://localhost:8000/workflows/", json=workflow)
            resp.raise_for_status()
            workflow_data = resp.json()
            workflow_id = workflow_data["id"]
            print(f"✅ Created workflow: {workflow_id}")
        except Exception as e:
            print(f"❌ Failed to create workflow: {str(e)}")
            return False

        # Execute workflow
        print("\n⚙️  Executing workflow...")
        try:
            exec_resp = await client.post(
                f"http://localhost:8000/workflows/{workflow_id}/execute",
                json={"inputs": {}, "async_execution": False}
            )
            exec_resp.raise_for_status()
            result = exec_resp.json()
            execution_id = result['execution_id']
            print(f"✅ Execution started: {execution_id}")
            print(f"   Status: {result['status']}")
        except Exception as e:
            print(f"❌ Failed to execute workflow: {str(e)}")
            return False

        # Get execution status
        print("\n📊 Fetching execution results...")
        try:
            status_resp = await client.get(
                f"http://localhost:8000/workflows/executions/{execution_id}"
            )
            status_resp.raise_for_status()
            execution = status_resp.json()

            print(f"   Execution Status: {execution['status']}")
            print(f"   Nodes Executed: {len(execution.get('node_states', {}))}")
            print(f"   Logs: {len(execution.get('logs', []))}")
            print(f"   Errors: {len(execution.get('errors', []))}")

            # Check communication log
            comm_log = execution.get("communication_log", [])
            print(f"   Communication Events: {len(comm_log)}")

            if len(comm_log) > 0:
                print("\n✅ COMMUNICATION WORKING!")
                print("\n📡 Communication Log:")
                for i, comm in enumerate(comm_log, 1):
                    print(f"\n   Event {i}:")
                    print(f"      Type: {comm['type']}")
                    print(f"      From: {comm['from_node']}")
                    print(f"      To: {comm['to_node']}")
                    print(f"      Time: {comm['timestamp']}")
                    if 'content' in comm:
                        content_preview = str(comm['content'])[:100]
                        print(f"      Content: {content_preview}...")

                return True
            else:
                print("\n⚠️  No communication detected")
                print("   This might be expected if the LLM didn't use the CALL format")
                return False

        except Exception as e:
            print(f"❌ Failed to get execution status: {str(e)}")
            return False


async def test_shared_context():
    """Test shared context functionality"""
    print("\n" + "="*60)
    print("TEST 2: Shared Context")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        workflow = {
            "name": "Communication Test - Shared Context",
            "nodes": [
                {
                    "id": "setter",
                    "type": "ai-processor",
                    "position": {"x": 100, "y": 100},
                    "config": {
                        "name": "Setter",
                        "prompt": "Store 'project_name' as 'ChasmX' in shared context using: CALL: set_shared_context('project_name', 'ChasmX')",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                },
                {
                    "id": "getter",
                    "type": "ai-processor",
                    "position": {"x": 400, "y": 100},
                    "config": {
                        "name": "Getter",
                        "prompt": "Get the project name from shared context and use it in a sentence.",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                }
            ],
            "edges": [{"from": "setter", "to": "getter"}],
            "variables": [],
            "status": "active",
            "metadata": {
                "description": "Test shared context",
                "tags": ["test", "context"]
            }
        }

        print("\n📝 Creating workflow...")
        try:
            resp = await client.post("http://localhost:8000/workflows/", json=workflow)
            resp.raise_for_status()
            workflow_id = resp.json()["id"]
            print(f"✅ Created workflow: {workflow_id}")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False

        print("\n⚙️  Executing workflow...")
        try:
            exec_resp = await client.post(
                f"http://localhost:8000/workflows/{workflow_id}/execute",
                json={"inputs": {}, "async_execution": False}
            )
            exec_resp.raise_for_status()
            execution_id = exec_resp.json()['execution_id']
            print(f"✅ Execution: {execution_id}")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False

        print("\n📊 Checking results...")
        try:
            status_resp = await client.get(
                f"http://localhost:8000/workflows/executions/{execution_id}"
            )
            status_resp.raise_for_status()
            execution = status_resp.json()

            comm_log = execution.get("communication_log", [])
            context_updates = [c for c in comm_log if c['type'] == 'context_update']

            if len(context_updates) > 0:
                print(f"✅ Context updates detected: {len(context_updates)}")
                for update in context_updates:
                    print(f"   Key: {update.get('metadata', {}).get('key', 'unknown')}")
                return True
            else:
                print("⚠️  No context updates detected")
                return False

        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False


async def test_broadcast():
    """Test broadcast messaging"""
    print("\n" + "="*60)
    print("TEST 3: Broadcast Messaging")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        workflow = {
            "name": "Communication Test - Broadcast",
            "nodes": [
                {
                    "id": "broadcaster",
                    "type": "ai-processor",
                    "position": {"x": 100, "y": 100},
                    "config": {
                        "name": "Broadcaster",
                        "prompt": "Broadcast a message 'Hello team!' to all nodes using: CALL: broadcast_message('Hello team!')",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                },
                {
                    "id": "listener1",
                    "type": "ai-processor",
                    "position": {"x": 300, "y": 50},
                    "config": {
                        "name": "Listener 1",
                        "prompt": "You are listening for broadcast messages. Acknowledge any you receive.",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                },
                {
                    "id": "listener2",
                    "type": "ai-processor",
                    "position": {"x": 300, "y": 150},
                    "config": {
                        "name": "Listener 2",
                        "prompt": "You are listening for broadcast messages. Acknowledge any you receive.",
                        "can_communicate": True,
                        "model": "google/gemini-2.0-flash-exp:free"
                    }
                }
            ],
            "edges": [
                {"from": "broadcaster", "to": "listener1"},
                {"from": "broadcaster", "to": "listener2"}
            ],
            "variables": [],
            "status": "active",
            "metadata": {
                "description": "Test broadcast messaging",
                "tags": ["test", "broadcast"]
            }
        }

        print("\n📝 Creating workflow...")
        try:
            resp = await client.post("http://localhost:8000/workflows/", json=workflow)
            resp.raise_for_status()
            workflow_id = resp.json()["id"]
            print(f"✅ Created workflow: {workflow_id}")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False

        print("\n⚙️  Executing workflow...")
        try:
            exec_resp = await client.post(
                f"http://localhost:8000/workflows/{workflow_id}/execute",
                json={"inputs": {}, "async_execution": False}
            )
            exec_resp.raise_for_status()
            execution_id = exec_resp.json()['execution_id']
            print(f"✅ Execution: {execution_id}")
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False

        print("\n📊 Checking results...")
        try:
            status_resp = await client.get(
                f"http://localhost:8000/workflows/executions/{execution_id}"
            )
            status_resp.raise_for_status()
            execution = status_resp.json()

            comm_log = execution.get("communication_log", [])
            broadcasts = [c for c in comm_log if c['type'] == 'broadcast']

            if len(broadcasts) > 0:
                print(f"✅ Broadcasts detected: {len(broadcasts)}")
                for bc in broadcasts:
                    print(f"   From: {bc['from_node']}")
                return True
            else:
                print("⚠️  No broadcasts detected")
                return False

        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            return False


async def main():
    """Run all tests"""
    print("\n" + "🚀"*30)
    print("NODE COMMUNICATION TEST SUITE")
    print("🚀"*30)
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = []

    # Test 1: Basic Communication
    try:
        result = await test_basic_communication()
        results.append(("Basic Communication", result))
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        results.append(("Basic Communication", False))

    await asyncio.sleep(2)

    # Test 2: Shared Context
    try:
        result = await test_shared_context()
        results.append(("Shared Context", result))
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        results.append(("Shared Context", False))

    await asyncio.sleep(2)

    # Test 3: Broadcast
    try:
        result = await test_broadcast()
        results.append(("Broadcast", result))
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        results.append(("Broadcast", False))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")

    total = len(results)
    passed = sum(1 for _, p in results if p)

    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    if passed == total:
        print("\n🎉 All tests passed! Node communication is working!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check logs above.")


if __name__ == "__main__":
    asyncio.run(main())
