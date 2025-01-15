# chat-with-my-apis
Demo code and Azure resources which enable the use of a large language model to chat with external APIs to extend its capabilities.

## Deployment

1.  Initialize the Azure Developer CLI

    ```shell
    azd init
    ```

1.  Set the Azure resource group you wish to deploy to

    ```shell
    azd env set AZURE_RESOURCE_GROUP <resource-group-name>
    ```

1.  Run the following command to build, deploy & configure the image

    ```shell
    azd up
    ```