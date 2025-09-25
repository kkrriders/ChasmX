"""Server launcher for the backend API."""
import sys
import uvicorn
from uvicorn.config import LOGGING_CONFIG

# Modify logging configuration
LOGGING_CONFIG["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
LOGGING_CONFIG["formatters"]["access"]["fmt"] = '%(asctime)s - %(levelname)s - %(client_addr)s - "%(request_line)s" %(status_code)s'

def run():
    """Run the server with configured settings."""
    try:
        config = uvicorn.Config(
            "app.main:app",
            host="127.0.0.1",
            port=8080,
            log_level="debug",
            log_config=LOGGING_CONFIG,
            workers=1,
            loop="asyncio",
            timeout_keep_alive=60,
            timeout_notify=30,
            limit_max_requests=None,
            reload=True
        )
        
        server = uvicorn.Server(config)
        server.run()
    except KeyboardInterrupt:
        print("\nShutting down gracefully...")
        sys.exit(0)
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run()
