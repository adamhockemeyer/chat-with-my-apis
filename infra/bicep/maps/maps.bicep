
param name string
param tags object = {}
param location string
param storageAccountName string


resource storage 'Microsoft.Storage/storageAccounts@2023-05-01'existing = {
  name: storageAccountName
}

resource maps'Microsoft.Maps/accounts@2024-01-01-preview' = {
  name: name
  location: location
  tags: tags
  kind: 'Gen2'
  sku: {
    name: 'G2'
  }
  properties: {
    disableLocalAuth: false
    linkedResources: [
      {
        id: storage.id
        uniqueName: 'default-storage-account'
      }
    ]
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            '*'
          ]
        }
      ]
    }
    publicNetworkAccess: 'enabled'
    locations: []
  }
  
  identity: {
    type: 'SystemAssigned'
  }
}
