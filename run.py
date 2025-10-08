# run.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "backend.app.main:app",  # module path to your FastAPI app
        host="127.0.0.1",
        port=8000,
        reload=True
    )
