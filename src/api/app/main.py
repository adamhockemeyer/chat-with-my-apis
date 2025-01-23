import logging
import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI

import app.temp_logging

from app.routers import chat
from app.routers import liveness, readiness, startup, apim

@asynccontextmanager
async def lifespan(_: FastAPI):
    yield

app = FastAPI(lifespan=lifespan, debug=True)

logging.basicConfig(level=logging.DEBUG)

app.include_router(chat.router, prefix="/v1")
app.include_router(liveness.router, prefix="/v1")
app.include_router(readiness.router, prefix="/v1")
app.include_router(startup.router, prefix="/v1")
app.include_router(apim.router, prefix="/v1")
