@description('The name of the API Management instance to deploy this API to.')
param serviceName string
//param endpoint string

resource apimService 'Microsoft.ApiManagement/service@2023-09-01-preview' existing = {
  name: serviceName
}

var openApiSpecSwagger = loadTextContent('../openapi-specs/Swagger API.openapi.yaml')

resource apiDefinition 'Microsoft.ApiManagement/service/apis@2023-09-01-preview' = {
  name: 'swagger-api'
  parent: apimService
  properties: {
    path: 'docs'
    description: 'OpenAPI specs and utility APIs for Azure Management Rest API operations'
    displayName: 'swagger-api'
    format: 'openapi'
    value: openApiSpecSwagger
    subscriptionRequired: true
    type: 'http'
    protocols: ['https']
    serviceUrl: '${apimService.properties.gatewayUrl}/docs'
  }
}

module namedValueAPIMServiceUrl '../apim-namevalue.bicep' = {
  name: 'named-value-apim-service-url'
  params: {
    apiManagementServiceName: apimService.name
    name: 'apim-management-service-url'
    displayName: 'APIM-Management-Service-URL'
    value: 'https://management.azure.com/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.ApiManagement/service/${apimService.name}'
  }
}

resource operationOpenAPISpec 'Microsoft.ApiManagement/service/apis/operations@2024-06-01-preview' existing = {
  name: 'openapi-spec'
  parent: apiDefinition
}

resource operationPolicy 'Microsoft.ApiManagement/service/apis/operations/policies@2023-09-01-preview' = {
  parent: operationOpenAPISpec
  name: 'policy'
  properties: {
    format: 'rawxml'
    value: policy1
  }
}

var policy1 = '''
<policies>
    <inbound>
        <base />
        <!-- Cache lookup before making the API management call -->
        <cache-lookup-value key="@(context.Request.MatchedParameters.GetValueOrDefault("api-id",""))" variable-name="cachedSpec" />
        <!--Dynamically call the APIM Management API-->
        <choose>
            <when condition="@(!context.Variables.ContainsKey("cachedSpec"))">
                <send-request mode="new" response-variable-name="result" timeout="60" ignore-error="true">
                    <set-url>@("{{APIM-Management-Service-URL}}" + "/apis/" + context.Request.MatchedParameters.GetValueOrDefault("api-id","") + "?export=true&format=openapi&api-version=2022-09-01-preview")</set-url>
                    <set-method>GET</set-method>
                    <authentication-managed-identity resource="https://management.azure.com/" />
                </send-request>
                <set-variable name="responseBody" value="@((string)(((IResponse)context.Variables["result"]).Body.As<JObject>()["value"]))" />
                <cache-store-value key="@(context.Request.MatchedParameters.GetValueOrDefault("api-id",""))" value="@((string)context.Variables["responseBody"])" duration="300" />
                <!--Return the response-->
                <return-response>
                    <set-status code="200" reason="OK" />
                    <set-header name="Content-Type" exists-action="override">
                        <value>application/yaml</value>
                    </set-header>
                    <set-body>@((string)context.Variables["responseBody"])</set-body>
                </return-response>
            </when>
            <otherwise>
                <return-response>
                    <set-status code="200" reason="OK" />
                    <set-header name="Content-Type" exists-action="override">
                        <value>application/yaml</value>
                    </set-header>
                    <set-body>@((string)context.Variables["cachedSpec"])</set-body>
                </return-response>
            </otherwise>
        </choose>
    </inbound>
    <backend>
        <base />
    </backend>
    <outbound>
        <base />
    </outbound>
    <on-error>
        <base />
    </on-error>
</policies>
    '''

output id string = apiDefinition.id
