param location string = resourceGroup().location
param name string
param commonTags object = {}
param logAnalyticsWorkspaceResourceId string

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: name
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspaceResourceId
    CustomMetricsOptedInType: 'WithDimensions'
  }
  tags: commonTags
}
