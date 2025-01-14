import logging

from semantic_kernel import Kernel
from semantic_kernel.agents.open_ai import AzureAssistantAgent

from app.config import get_settings

logger = logging.getLogger("uvicorn.error")

async def create_apim_agent(kernel: Kernel) -> AzureAssistantAgent:
    return await AzureAssistantAgent.create(
                    kernel=kernel,
                    name="apim-agent",
                    instructions="""Instructions:
                    - Break the task into steps, and output the result of each step as you perform it.
                    - You are an AI assistant that helps with calling APIs to generate useful information based on a user's question.
                    - Use the proper function calls to get information that will be useful to the user.
                    - If one function call depends on the output of another, make sure to call them in order and use the outputs appropriately.
                    - Include what you are thinking, working on, and next steps in your responses, and ask for more information if needed.
                    - If you don't know something, and are not able to ask the user for more information, or can't call an API, you can say 'I don't know'.
                    - Always format an email as HTML. Ensure the content is well orangized and use bullet lists or tables where necessary.
                    - For Weather API's, if a query parameter is required, read the description as the query will need to be converted into latitude and longitude and not a city and state.
                    """,
                    enable_code_interpreter=False,
                    endpoint=get_settings().azure_openai_endpoint,
                    #api_key=get_settings().azure_openai_api_key,
                    default_headers={
                        "Ocp-Apim-Subscription-Key": get_settings().azure_apim_service_subscription_key
                        },
                    api_version=get_settings().azure_openai_api_version,
                    deployment_name=get_settings().azure_openai_chat_deployment_name,
                    enable_file_search=False,
                )

__all__ = ["create_apim_agent"]
