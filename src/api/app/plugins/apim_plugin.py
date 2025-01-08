import os, logging
import urllib
import requests
from requests.models import Response
from typing import Annotated
from opentelemetry import trace

from semantic_kernel.functions.kernel_function_decorator import kernel_function

from app.config import get_settings

tracer = trace.get_tracer(__name__)

logger = logging.getLogger("uvicorn.error")

class ApimPlugin:



__all__ = ["ApimPlugin"]
