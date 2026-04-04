from fastapi import APIRouter

router: APIRouter = APIRouter(prefix="/api/v1/core", tags=["Core"])

@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Backend is alive!"}
