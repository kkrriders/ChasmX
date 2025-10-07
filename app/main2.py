# app/main2.py
from fastapi import FastAPI
from app.core.config import settings
from app.core.middleware import init_middleware

# Routers
from app.routers import workflow, llm, agent

def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG)

    # Middleware
    init_middleware(app, allowed_origins=settings.ALLOWED_ORIGINS)

    # Include routers
    app.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
    app.include_router(llm.router, prefix="/llm", tags=["llm"])
    app.include_router(agent.router, prefix="/agent", tags=["agent"])

    @app.get("/", summary="App root")
    async def root():
        return {"status": "ok", "project": settings.PROJECT_NAME}

    return app

# Rename app object
fastapi_app = create_app()
