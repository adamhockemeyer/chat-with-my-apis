import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from opentelemetry import trace

from semantic_kernel import Kernel
from semantic_kernel.agents.open_ai import AzureAssistantAgent
from semantic_kernel.contents.chat_message_content import ChatMessageContent
from semantic_kernel.contents.utils.author_role import AuthorRole

from app.models.chat_input import ChatInput
from app.models.chat_create_thread_input import ChatCreateThreadInput
from app.agents.apim_agent import create_apim_agent
from app.config import get_settings
from app.services.plugins import add_apim_apis_by_product

logger = logging.getLogger("uvicorn.error")
tracer = trace.get_tracer(__name__)

router = APIRouter()

@tracer.start_as_current_span(name="create_agent")
@router.post("/create_agent")
async def post_create_agent():
    kernel = Kernel()

    apim_agent = await create_apim_agent(kernel)

    return {"agent_id": apim_agent.assistant.id}

@tracer.start_as_current_span(name="create_thread")
@router.post("/create_thread")
async def post_create_thread(agent_input: ChatCreateThreadInput):
    kernel = Kernel()

    apim_agent = await AzureAssistantAgent.retrieve(
        id=agent_input.agent_id,
        kernel=kernel,
        endpoint=get_settings().azure_openai_endpoint,
        api_key=get_settings().azure_openai_api_key,
        api_version=get_settings().azure_openai_api_version
        )

    if not apim_agent:
        return {"error": f"Agent with ID {agent_input.agent_id} not found"}

    thread_id = await apim_agent.create_thread()

    return {"thread_id": thread_id}

@tracer.start_as_current_span(name="chat")
@router.post("/chat")
async def post_chat(chat_input: ChatInput):
    return StreamingResponse(build_chat_results(chat_input))

async def build_chat_results(chat_input: ChatInput):
    with tracer.start_as_current_span(name="build_chat_results"):
        kernel = Kernel()

        apim_agent = await AzureAssistantAgent.retrieve(
            id=chat_input.agent_id,
            kernel=kernel,
            endpoint=get_settings().azure_openai_endpoint,
            api_key=get_settings().azure_openai_api_key,
            api_version=get_settings().azure_openai_api_version)

        if not apim_agent:
            yield f"Agent with ID {chat_input.agent_id} not found"

        # Add the APIs from the specified product       
        await add_apim_apis_by_product(kernel, get_settings().azure_apim_service_product_id)

        await apim_agent.add_chat_message(thread_id=chat_input.thread_id,
                                          message=ChatMessageContent(role=AuthorRole.USER,
                                                                     content=chat_input.content))

        async for content in apim_agent.invoke_stream(thread_id=chat_input.thread_id):
            yield content.content
