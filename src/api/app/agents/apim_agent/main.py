import logging

from semantic_kernel import Kernel
from semantic_kernel.agents.open_ai import AzureAssistantAgent

from app.config import get_settings

logger = logging.getLogger("uvicorn.error")

async def create_apim_agent(kernel: Kernel, agent_name: str = "apim-agent", instructions: str = None) -> AzureAssistantAgent:
    if instructions is None:
        instructions = """Instructions:
        - Break the task into steps, and output the result of each step as you perform it.
        - You are an AI assistant that helps with calling APIs to generate useful information based on a user's question.
        - Use the proper function calls to get information that will be useful to the user.
        - If one function call depends on the output of another, make sure to call them in order and use the outputs appropriately.
        - Include what you are thinking, working on, and next steps in your responses, and ask for more information if needed.
        - If you don't know something, and are not able to ask the user for more information, or can't call an API, you can say 'I don't know'.
        """

    return await AzureAssistantAgent.create(
                    kernel=kernel,
                    name=agent_name,
                    instructions=instructions,
                    enable_code_interpreter=False,
                    endpoint=get_settings().azure_apim_endpoint,
                    #endpoint=get_settings().azure_openai_endpoint,
                    #api_key=get_settings().azure_openai_api_key,
                    default_headers={
                        "Ocp-Apim-Subscription-Key": get_settings().azure_apim_apichat_subscription_key
                        },
                    api_version=get_settings().azure_openai_api_version,
                    deployment_name=get_settings().azure_openai_chat_deployment_name,
                    enable_file_search=False,
                )

__all__ = ["create_apim_agent"]
