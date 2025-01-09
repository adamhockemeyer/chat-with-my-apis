param name string
param tags object = {}
param managedEnvironmentId string
param secrets array = []
param containerImage string
param containerName string
param containerCommand array = []
param containerTargetPort int
param containerEnvironmentVariables array = []
param containerResourcesCPU string = '2'
param containerResourcesMemory string = '4Gi'
param containerMinReplicas int = 1
param containerMaxRepliacs int = 3
param workloadProfileName string = 'Consumption'

param currentUtc string = utcNow()

var resourceName = '${name}-ca'

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: resourceName
  location: resourceGroup().location
  tags: tags
  properties: {
    managedEnvironmentId: managedEnvironmentId
    workloadProfileName: workloadProfileName
    configuration: {
      secrets: secrets
      //activeRevisionsMode: 'Multiple'
      ingress: {
        external: true
        targetPort: containerTargetPort
        transport: 'auto'
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        allowInsecure: false
      }
      registries: []
    }
    template: {
      containers: [
        {
          image: containerImage
          name: containerName
          command: containerCommand
          env: containerEnvironmentVariables
          resources: {
            cpu: json(containerResourcesCPU)
            memory: containerResourcesMemory
          }
          probes: []
        }
      ]
      revisionSuffix: toLower(currentUtc)
      scale: {
        minReplicas: containerMinReplicas
        maxReplicas: containerMaxRepliacs
      }
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
output principalId string = containerApp.identity.principalId
