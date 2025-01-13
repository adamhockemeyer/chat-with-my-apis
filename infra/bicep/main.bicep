param prefix string = '${substring(uniqueString(resourceGroup().id),0,4)}-apichat'
param region string = resourceGroup().location
param commonTags object = {
  created_by: 'bicep'
  project: 'API Chat'
}
param apimPublisherEmail string = 'user@company.com'

var sharedRoleDefinitions = loadJsonContent('./role-definitions.json')

module logAnalytics 'logs/log-analytics.bicep' = {
  name: '${prefix}-la'
  params: {
    location: region
    name: '${prefix}-la'
    commonTags: commonTags
  }
}

module applicationInsights 'logs/application-insights.bicep' = {
  name: '${prefix}-appinsights'
  params: {
    location: region
    name: '${prefix}-appinsights'
    commonTags: commonTags
    logAnalyticsWorkspaceResourceId: logAnalytics.outputs.resourceId
  }
}

module storageAccount 'storage/storage.bicep' = {
  name: '${prefix}sa'
  params: {
    name: replace(replace('${prefix}storage', '-', ''), '_', '')
    tags: commonTags
  }
}

// Create multiple OpenAI Accounts to show Load Balancing in API Management

module cognitiveServices1 'cognitive-services/cognitive-services-openai.bicep' = {
  name: '${prefix}-oai-1'
  params: {
    location: region
    name: '${prefix}-oai-1'
    commonTags: commonTags
    roleAssignments: [
      {
        principalId: apim.outputs.principalId
        roleDefinitionId: sharedRoleDefinitions['Cognitive Services OpenAI User']
      }
    ]
  }
}

module openAIDeployments1 'cognitive-services/openai-deployments.bicep' = {
  name: '${prefix}-oai-deployments-1'
  params: {
    cognitiveServicesAccountName: cognitiveServices1.outputs.name
  }
}

module cognitiveServices2 'cognitive-services/cognitive-services-openai.bicep' = {
  name: '${prefix}-oai-2'
  params: {
    location: 'Sweden Central'
    name: '${prefix}-oai-2'
    commonTags: commonTags
    roleAssignments: [
      {
        principalId: apim.outputs.principalId
        roleDefinitionId: sharedRoleDefinitions['Cognitive Services OpenAI User']
      }
    ]
  }
}

module openAIDeployments2 'cognitive-services/openai-deployments.bicep' = {
  name: '${prefix}-oai-deployments-2'
  params: {
    cognitiveServicesAccountName: cognitiveServices2.outputs.name
  }
}

module apim 'api-management/apim.bicep' = {
  name: '${prefix}-apim'
  params: {
    location: region
    name: 'apim-${prefix}'
    commonTags: commonTags
    publisherEmail: apimPublisherEmail
    publisherName: 'apim-${prefix}'
    appInsightsName: applicationInsights.name
    roleAssignments: [
      {
        principalId: ''
        roleDefinitionId: sharedRoleDefinitions['API Management Service Reader Role']
      }
    ]
  }
}

module apimApisSwagger 'api-management/apis/swagger-api.bicep' = {
  name: '${prefix}-apim-swagger-api'
  params: {
    serviceName: apim.outputs.name
  }
}

module apimBackendsOpenAI 'api-management/apim-backends-aoai.bicep' = {
  name: '${prefix}-apim-openai-backends'
  params: {
    apimName: apim.outputs.name
    backendPoolName: 'openaibackendpool'
    backendNames: [
      cognitiveServices1.outputs.name
      cognitiveServices2.outputs.name
    ]
  }
}

module apimNameValueOpenAIPool 'api-management/apim-namevalue.bicep' = {
  name: '${prefix}-apim-namedvalue-openai-pool'
  params: {
    apiManagementServiceName: apim.outputs.name
    name: 'openai-backend-pool'
    displayName: 'OpenAI-Backend-Pool'
    value: apimBackendsOpenAI.outputs.backendPoolName
  }
}

module apimApisOpenAI 'api-management/apis/openai-api.bicep' = {
  name: '${prefix}-apim-openai-api'
  params: {
    serviceName: apim.outputs.name
    backendName: apimBackendsOpenAI.outputs.backendPoolName
    apimLoggerName: apim.outputs.loggerName
  }
}

module maps 'maps/maps.bicep' = {
  name: '${prefix}-maps'
  params: {
    location: region
    name: '${prefix}-maps'
    tags: commonTags
    storageAccountName: storageAccount.name
    roleAssignments: [
      {
        principalId: apim.outputs.principalId
        roleDefinitionId: sharedRoleDefinitions['Azure Maps Data Reader']
      }
    ]
  }
}

module apimNamedValueMapsId 'api-management/apim-namevalue.bicep' = {
  name: '${prefix}-apim-namedvalue-maps-id'
  params: {
    apiManagementServiceName: apim.outputs.name
    name: 'maps-clientId'
    displayName: 'Azure-Maps-Client-ID'
    value: maps.outputs.clientId
  }
}

module apimApisMaps 'api-management/apis/maps-api.bicep' = {
  name: '${prefix}-apim-maps-api'
  params: {
    serviceName: apim.outputs.name
  }
}

module apimProduct 'api-management/apim-product.bicep' = {
  name: '${prefix}-apim-product-generic-chat-agent'
  params: {
    apiManagementServiceName: apim.outputs.name
    productName: 'generic-chat-agent'
    productDisplayName: 'Generic Chat Agent'
    productDescription: 'This product has all all available APIs enabled for the Chat Agent'
    productTerms: 'API Chat Product Terms'
    productApis: [
      apimApisMaps.outputs.id
    ]
  }
}

module cosmosDB 'cosmos-db/cosmosdb.bicep' = {
  name: '${prefix}-cosmosdb'
  params: {
    location: 'East US2'
    accountName: '${prefix}-cosmosdb'
    databaseName: 'apichat-db'
    collectionNames: [
      'chatHistory'
    ]
    tags: commonTags
  }
}
