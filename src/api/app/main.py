
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from contextlib import asynccontextmanager
#from fastapi import FastAPI
import fastapi
from app.routers import liveness, readiness, startup, apim, chat

# OTel Logging Configuration
import app.otel_app_insights_logging


@asynccontextmanager
async def lifespan(_: fastapi.FastAPI):
    yield

app = fastapi.FastAPI(lifespan=lifespan, debug=True, title="API Chat", version="1.0.0")

#FastAPIInstrumentor.instrument_app(app)

app.include_router(chat.router, prefix="/v1")
app.include_router(liveness.router, prefix="/v1")
app.include_router(readiness.router, prefix="/v1")
app.include_router(startup.router, prefix="/v1")
app.include_router(apim.router, prefix="/v1")
