import logging

from fastapi import APIRouter, Query
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
from app.services.plugins import add_apim_apis_by_product, add_apim_api
from app.services.apim import fetch_named_value

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

router = APIRouter()

@tracer.start_as_current_span(name="create_agent")
@router.post("/create_agent")
async def post_create_agent(apim_product_id: str = Query(
        default=None, 
        description="(Optional) The APIM product ID from which to fetch the named value agent instructions."
    )):
    kernel = Kernel()

    if apim_product_id:
        try:
            named_value = fetch_named_value(f"{apim_product_id}-instructions")
            if named_value:
                instructions = named_value
                apim_agent = await create_apim_agent(kernel, agent_name=apim_product_id, instructions=instructions)
                return {"agent_id": apim_agent.assistant.id}
        except Exception as e:
            logger.error(f"Exception occurred while fetching named value for agent ID {apim_product_id}. Exception: {e}")

    apim_agent = await create_apim_agent(kernel)

    return {"agent_id": apim_agent.assistant.id}

@tracer.start_as_current_span(name="create_thread")
@router.post("/create_thread")
async def post_create_thread(agent_input: ChatCreateThreadInput):
    kernel = Kernel()

    apim_agent = None

    try:
        apim_agent = await AzureAssistantAgent.retrieve(
            id=agent_input.agent_id,
            kernel=kernel,
            endpoint=get_settings().azure_apim_endpoint,
            default_headers={"Ocp-Apim-Subscription-Key": get_settings().azure_apim_apichat_subscription_key},
            api_version=get_settings().azure_openai_api_version
            )
    
        
        apim_agent.client = apim_agent.client.copy(
            default_headers={"Ocp-Apim-Subscription-Key": get_settings().azure_apim_apichat_subscription_key}
        )
    except Exception as e:
        logger.error(f"Exception occurred while retrieving agent with ID {agent_input.agent_id}. Exception: {e}")
        logger.error(f"Agent with ID {agent_input.agent_id} not found")

    if not apim_agent:
        return {"error": f"Agent with ID {agent_input.agent_id} not found"}

    thread_id = await apim_agent.create_thread()
    
    return {"thread_id": thread_id}

@tracer.start_as_current_span(name="chat")
@router.post("/chat")
async def chat_endpoint(chat_input: ChatInput):
    # Build the generator or async content
    content = build_chat_results(chat_input)

    # Extract or compute your trace_id_hex here (or pass it from build_chat_results)
    # For example, if you do it in build_chat_results, store it in a variable or return it:
    current_span = trace.get_current_span()
    trace_id = current_span.get_span_context().trace_id
    trace_id_hex = format(trace_id, '032x')

    logger.info(f"      OTel Trace ID: {trace_id_hex}")

    return StreamingResponse(
        content,
        status_code=200,
        headers={"x-trace-id": trace_id_hex},
        media_type="text/event-stream"
    )

async def build_chat_results(chat_input: ChatInput):
    with tracer.start_as_current_span(name="build_chat_results"):
        kernel = Kernel()

        try:
            apim_agent = await AzureAssistantAgent.retrieve(
                id=chat_input.agent_id,
                kernel=kernel,
                endpoint=get_settings().azure_apim_endpoint,
                default_headers={"Ocp-Apim-Subscription-Key": get_settings().azure_apim_apichat_subscription_key},
                api_version=get_settings().azure_openai_api_version)
            
            apim_agent.client = apim_agent.client.copy(
                default_headers={"Ocp-Apim-Subscription-Key": get_settings().azure_apim_apichat_subscription_key}
            )
        except Exception as e:
            logger.error(f"Exception occurred while retrieving agent with ID {chat_input.agent_id}. Exception: {e}")
            logger.error(f"Agent with ID {chat_input.agent_id} not found")

        if not apim_agent:
            yield f"Agent with ID {chat_input.agent_id} not found"

        # If api_ids are provided and product_id is provided, we will use the agent instructions 
        # for the product_id, however, we will only load the specified api_ids, and not all apis in the product.
        # This is mainly to support the general chat functionality, to allow users to experiment chatting with and without 
        # certain APIs.

        if chat_input.product_id and (chat_input.api_ids is None or len(chat_input.api_ids) == 0):
            await add_apim_apis_by_product(kernel, chat_input.product_id)
        
        if chat_input.api_ids and len(chat_input.api_ids) > 0:
            logger.info("   ⚠️ api_ids provided - ignoring api_ids from product_id.")
            for api_id in chat_input.api_ids:
                await add_apim_api(kernel, api_id)

        if not chat_input.product_id and (chat_input.api_ids is None or len(chat_input.api_ids) == 0):
            logger.info("   ⚠️ No product_id or api_ids provided. Using default Semantic Kernel functionality.")

        try:
            await apim_agent.add_chat_message(thread_id=chat_input.thread_id,
                                              message=ChatMessageContent(role=AuthorRole.USER,
                                                                         content=chat_input.content))
        except Exception as e:
            logger.error(f"Exception occurred while adding chat message to thread with Agent ID {chat_input.agent_id}, Thread ID {chat_input.thread_id}. Exception: {e}")

        async for content in apim_agent.invoke_stream(thread_id=chat_input.thread_id):
            yield content.content
