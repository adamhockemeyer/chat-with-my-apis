@description('The name of the API Management instance to deploy this API to.')
param serviceName string

resource apimService 'Microsoft.ApiManagement/service@2023-09-01-preview' existing = {
  name: serviceName
}

var api = {
    title: 'Azure Maps Weather Service'
    name: 'azure-maps-weather-service'
    description: 'Azure Maps Weather Service provides real-time weather data for a given location.'
    path: ''
    openapispec: 'https://raw.githubusercontent.com/Azure/azure-rest-api-specs/refs/heads/main/specification/maps/data-plane/Microsoft.Maps/Weather/preview/1.0/weather.json'
  }


resource apiDefinitions 'Microsoft.ApiManagement/service/apis@2023-09-01-preview' = {
    name: api.name
    parent: apimService
    properties: {
      path: api.path
      description: api.description
      displayName: api.title
      format: 'swagger-link-json'
      value: api.openapispec
      subscriptionRequired: true
      type: 'http'
      protocols: ['https']
      serviceUrl: 'https://atlas.microsoft.com'
    }
  }


output id string = apiDefinitions.id
