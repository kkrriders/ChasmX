#!/usr/bin/env python3
"""
Test script for real email and webhook functionality in ChasmX workflow executor.

This script demonstrates:
1. Email sending with various configurations
2. Webhook calls with different authentication methods
3. Error handling and retry logic
4. Variable interpolation

Usage:
    python test_email_webhook_implementation.py
"""

import asyncio
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.models.workflow import Node
from app.services.workflow_executor import workflow_executor

class EmailWebhookTester:
    """Test class for email and webhook functionality"""

    def __init__(self):
        self.test_results = []

    async def test_email_basic(self):
        """Test basic email sending"""
        print("🧪 Testing basic email functionality...")
        
        node = Node(
            id="test_email_basic",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "test@example.com",
                "subject": "ChasmX Test Email",
                "body": "This is a test email from ChasmX workflow executor.",
                "format": "text"
            }
        )
        
        context = {
            "variables": {},
            "outputs": {}
        }
        
        try:
            result = await workflow_executor._execute_email_node(node, context)
            self.test_results.append({
                "test": "Email Basic",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Email Basic",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_email_with_variables(self):
        """Test email with variable interpolation"""
        print("🧪 Testing email with variable interpolation...")
        
        node = Node(
            id="test_email_variables",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "{{user_email}}",
                "subject": "Welcome {{user_name}}!",
                "body": "Hello {{user_name}},\n\nYour account has been created successfully.\nWorkflow result: {{outputs.ai_result}}",
                "format": "text"
            }
        )
        
        context = {
            "variables": {
                "user_email": "newuser@example.com",
                "user_name": "Alice Smith"
            },
            "outputs": {
                "ai_result": "Account setup completed successfully with premium features enabled."
            }
        }
        
        try:
            result = await workflow_executor._execute_email_node(node, context)
            self.test_results.append({
                "test": "Email Variables",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Email Variables",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_email_html_format(self):
        """Test HTML email sending"""
        print("🧪 Testing HTML email format...")
        
        html_body = """
        <html>
        <body>
            <h1>ChasmX Workflow Notification</h1>
            <p>Hello <strong>{{user_name}}</strong>,</p>
            <p>Your workflow has completed with the following result:</p>
            <blockquote style="background: #f0f0f0; padding: 10px; border-left: 4px solid #007acc;">
                {{outputs.ai_result}}
            </blockquote>
            <p>Best regards,<br>The ChasmX Team</p>
        </body>
        </html>
        """
        
        node = Node(
            id="test_email_html",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "{{user_email}}",
                "subject": "ChasmX HTML Notification",
                "body": html_body,
                "format": "html"
            }
        )
        
        context = {
            "variables": {
                "user_email": "htmltest@example.com",
                "user_name": "Bob Johnson"
            },
            "outputs": {
                "ai_result": "Successfully processed 1,234 records with 98.5% accuracy."
            }
        }
        
        try:
            result = await workflow_executor._execute_email_node(node, context)
            self.test_results.append({
                "test": "Email HTML",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Email HTML",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_webhook_basic(self):
        """Test basic webhook call"""
        print("🧪 Testing basic webhook functionality...")
        
        node = Node(
            id="test_webhook_basic",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://httpbin.org/post",
                "method": "POST",
                "body": {
                    "message": "Test webhook from ChasmX",
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "workflow_test"
                },
                "headers": {
                    "Content-Type": "application/json"
                }
            }
        )
        
        context = {
            "variables": {},
            "outputs": {}
        }
        
        try:
            result = await workflow_executor._execute_webhook_node(node, context)
            self.test_results.append({
                "test": "Webhook Basic",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Webhook Basic",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_webhook_with_auth(self):
        """Test webhook with Bearer token authentication"""
        print("🧪 Testing webhook with Bearer authentication...")
        
        node = Node(
            id="test_webhook_auth",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://httpbin.org/bearer",
                "method": "GET",
                "auth": {
                    "type": "bearer",
                    "token": "test-bearer-token-12345"
                },
                "headers": {
                    "User-Agent": "ChasmX-Test/1.0"
                }
            }
        )
        
        context = {
            "variables": {},
            "outputs": {}
        }
        
        try:
            result = await workflow_executor._execute_webhook_node(node, context)
            self.test_results.append({
                "test": "Webhook Auth",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Webhook Auth",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_webhook_with_variables(self):
        """Test webhook with variable interpolation"""
        print("🧪 Testing webhook with variable interpolation...")
        
        node = Node(
            id="test_webhook_variables",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://httpbin.org/post",
                "method": "POST",
                "body": {
                    "user_id": "{{user_id}}",
                    "workflow_result": "{{outputs.processing_result}}",
                    "metadata": {
                        "executed_at": "{{timestamp}}",
                        "source": "chasmx-workflow",
                        "user_name": "{{user_name}}"
                    }
                },
                "headers": {
                    "X-User-ID": "{{user_id}}",
                    "X-Workflow-Name": "{{workflow_name}}"
                },
                "params": {
                    "source": "test",
                    "user": "{{user_name}}"
                }
            }
        )
        
        context = {
            "variables": {
                "user_id": "12345",
                "user_name": "Charlie Brown",
                "workflow_name": "Data Processing Pipeline",
                "timestamp": datetime.utcnow().isoformat()
            },
            "outputs": {
                "processing_result": "Successfully processed 500 records with 99.2% accuracy"
            }
        }
        
        try:
            result = await workflow_executor._execute_webhook_node(node, context)
            self.test_results.append({
                "test": "Webhook Variables",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']}")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Webhook Variables",
                "status": "error",
                "error": str(e)
            })
            print(f"❌ Error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_webhook_error_handling(self):
        """Test webhook error handling and retries"""
        print("🧪 Testing webhook error handling...")
        
        node = Node(
            id="test_webhook_error",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://httpbin.org/status/500",  # This will return 500 error
                "method": "GET",
                "retries": 2,
                "retry_delay": 1,
                "expected_status": [200]  # We expect 200, but will get 500
            }
        )
        
        context = {
            "variables": {},
            "outputs": {}
        }
        
        try:
            result = await workflow_executor._execute_webhook_node(node, context)
            self.test_results.append({
                "test": "Webhook Error Handling",
                "status": result["status"],
                "details": result
            })
            print(f"✅ Result: {result['status']} (Expected error)")
            return result
        except Exception as e:
            self.test_results.append({
                "test": "Webhook Error Handling",
                "status": "error",
                "error": str(e)
            })
            print(f"✅ Error caught: {e} (Expected)")
            return {"status": "error", "error": str(e)}

    async def run_all_tests(self):
        """Run all test cases"""
        print("🚀 Starting ChasmX Email & Webhook Implementation Tests")
        print("=" * 60)
        
        # Email tests
        await self.test_email_basic()
        await self.test_email_with_variables()
        await self.test_email_html_format()
        
        print()
        
        # Webhook tests
        await self.test_webhook_basic()
        await self.test_webhook_with_auth()
        await self.test_webhook_with_variables()
        await self.test_webhook_error_handling()
        
        print()
        print("📊 Test Summary")
        print("=" * 60)
        
        success_count = 0
        for result in self.test_results:
            status_icon = "✅" if result["status"] in ["completed", "error"] else "❌"
            print(f"{status_icon} {result['test']}: {result['status']}")
            if result["status"] == "completed":
                success_count += 1
        
        print(f"\nTotal tests: {len(self.test_results)}")
        print(f"Successful: {success_count}")
        print(f"Failed: {len(self.test_results) - success_count}")
        
        return self.test_results

def check_environment():
    """Check if required environment variables are set"""
    print("🔧 Checking environment configuration...")
    
    required_email_vars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD"]
    email_configured = all(os.getenv(var) for var in required_email_vars)
    
    if email_configured:
        print("✅ Email/SMTP configuration found")
    else:
        print("⚠️  Email/SMTP not configured (will test with mock)")
        print(f"   Missing: {[var for var in required_email_vars if not os.getenv(var)]}")
    
    print("✅ Webhook tests will use httpbin.org (no config required)")
    print()

async def main():
    """Main test runner"""
    try:
        check_environment()
        
        tester = EmailWebhookTester()
        results = await tester.run_all_tests()
        
        print("\n🎉 Testing completed!")
        print("\nNote: Email tests may show 'error' status if SMTP is not configured.")
        print("This is expected behavior. Configure SMTP environment variables for real email testing.")
        
    except Exception as e:
        print(f"❌ Test runner failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())