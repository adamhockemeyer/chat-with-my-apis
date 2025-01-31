import logging
import logging.config

# from azure.monitor.opentelemetry.exporter import (
#     AzureMonitorLogExporter,
#     AzureMonitorMetricExporter,
#     AzureMonitorTraceExporter,
# )

# from opentelemetry._logs import set_logger_provider
# from opentelemetry.metrics import set_meter_provider
# from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
# from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
# from opentelemetry.sdk.metrics import MeterProvider
# from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
# from opentelemetry.sdk.metrics.view import DropAggregation, View
# from opentelemetry.sdk.resources import Resource
# from opentelemetry.sdk.trace import TracerProvider
# from opentelemetry.sdk.trace.export import BatchSpanProcessor
# from opentelemetry.semconv.resource import ResourceAttributes
# from opentelemetry.trace import set_tracer_provider
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from azure.monitor.opentelemetry import configure_azure_monitor

from contextlib import asynccontextmanager

from fastapi import FastAPI

import app.temp_logging

from app.routers import chat
from app.routers import liveness, readiness, startup, apim

@asynccontextmanager
async def lifespan(_: FastAPI):
    yield

# # Configure OpenTelemetry to use Azure Monitor with the 
# # APPLICATIONINSIGHTS_CONNECTION_STRING environment variable.
configure_azure_monitor()


app = FastAPI(lifespan=lifespan, debug=True)

FastAPIInstrumentor.instrument_app(app)

logging.basicConfig(level=logging.DEBUG)

app.include_router(chat.router, prefix="/v1")
app.include_router(liveness.router, prefix="/v1")
app.include_router(readiness.router, prefix="/v1")
app.include_router(startup.router, prefix="/v1")
app.include_router(apim.router, prefix="/v1")
