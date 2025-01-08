from dataclasses import dataclass

from semantic_kernel.connectors.ai.open_ai.services.azure_chat_completion import AzureChatCompletion

@dataclass
class AllDependencies:
    azure_chat_completion: AzureChatCompletion

__all__ = ["AllDependencies"]
