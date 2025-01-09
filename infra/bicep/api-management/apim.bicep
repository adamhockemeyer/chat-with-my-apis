param location string = resourceGroup().location
param name string
param publisherEmail string
param publisherName string
param appInsightsName string
param commonTags object = {}

@description('The pricing tier of this API Management service')
@allowed([
  'Consumption'
  'Developer'
  'Basic'
  'Basicv2'
  'Standard'
  'Standardv2'
  'Premium'
])
param skuName string = 'Developer'

resource apimService 'Microsoft.ApiManagement/service@2024-05-01' = {
  name: name
  location: location
  sku: {
    name: skuName
    capacity: 1
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publisherEmail: publisherEmail
    publisherName: publisherName
  }
  tags: commonTags
}

resource apimSubscription 'Microsoft.ApiManagement/service/subscriptions@2023-09-01-preview' = {
  name: 'apichat-subscription'
  parent: apimService
  properties: {
    allowTracing: true
    displayName: 'apichat-subscription'
    // All API's are included in this example subscription
    scope: '/apis'
    state: 'active'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: appInsightsName
}

resource apimLogger 'Microsoft.ApiManagement/service/loggers@2023-09-01-preview' = {
  name: 'logger-appinsights'
  parent: apimService
  properties: {
    credentials: {
      instrumentationKey: appInsights.properties.InstrumentationKey
    }
    description: 'Logger for Application Insights'
    isBuffered: false
    loggerType: 'applicationInsights'
    resourceId: appInsights.id
  }
}

output id string = apimService.id
output name string = apimService.name
output principalId string = apimService.identity.principalId
output loggerId string = apimLogger.id
output loggerName string = apimLogger.name
