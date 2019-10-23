# loomo-webapp
A WebApp for Containers in support of Loomo-On-Azure

## Building

```
$ docker-compose build
```

## Running

Create a ```.env``` file in the same folder as ```docker-compose.yml```. This file should have the following format

```
# Azure Blob
BLOB_CONTAINER_URI_PATH=https://<storage-account-name>.blob.core.windows.net/<container>/
BLOB_SAS_QUERY_STRING=<use storage explorer in the portal to create a SAS querystring for the above container>
# Azure Cognitive Services
COGNITIVE_SERVICES_SUBSCRIPTION_KEY=<key from Keys bladed>
COGNITIVE_SERVICES_FACE_DETECT_URI=<endpoint from Overview blade>/detect?returnFaceAttributes=age,gender,headPose,emotion,occlusion,blur,exposure,noise&recognitionModel=recognition_02

```

## Test

```
$ curl -v -X PUT "http://localhost/api/recognize" --header "Content-Type:image/jpeg" --data-binary @/home/seank/Downloads/susan.jpg
```

## Configuring

1. Create a resource group
2. Create a Storage account
3. Create a Cognitive Services account
4. Create an Azure Container Registry
5. Create a Web App Service for Containers
6. Create LargePersonGroup

    ```
    $ curl -v -X PUT "[endpoint]/largepersongroups/[largePersonGroupId]" -H "Ocp-Apim-Subscription-Key: [Key]" -H "Content-Type: application/json" --data-ascii "{\"name\": \"[Friendly Name]\",\"userData\": \"[upto 16KB of data]\",\"recognitionModel\": \"recognition_02\"}"
    ```


## Deploy

```
$ docker login loomo.azurecr.io
$ docker tag loomo-web:latest loomo.azurecr.io/loomo-web:latest
$ docker push loomo.azurecr.io/loomo-web:latest
```

https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-faq#custom-containers
