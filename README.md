
# UCSD Course Search Web Application README

## Project Overview
This project develops a web application that enables users to search through UCSD courses using semantic search capabilities. It leverages a weighted cosine similarity algorithm to compare the query embeddings with the embeddings of course titles and descriptions, ensuring relevant search results. The core of this semantic search functionality is powered by the FlagModel BAAI/bge-small-en-v1.5 embedding model. For more details on the embedding model, visit [Hugging Face's model repository](https://huggingface.co/BAAI/bge-small-en-v1.5).

If you would just like to visit the website: [http://ucsd-course-search.westus2.azurecontainer.io:8000/](http://ucsd-course-search.westus2.azurecontainer.io:8000/)

## Getting Started

### Setting Up the Development Environment
To run the Jupyter notebooks included in this project, follow these steps:

1. **Create a Virtual Environment:**
   ```sh
   python -m venv venv
   ```
2. **Activate the Virtual Enviroment**
    ```sh
    venv/Scripts/activate
    ```
3. **Install Required Dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Run the Desired Notebook**

### Docker Image Creation and Deployment on Azure

#### Prerequisites
- Docker Desktop must be installed and running.
- You must have a Docker Hub account
- Azure CLI should be installed.
- You must have an Azure account and be able to log in.

#### Publishing the Docker Image
Execute the following commands to build and publish the Docker image: (replace names with your own)
1. **Login to Docker Hub and create a Repository**

2. **Build the Docker Image:**
   ```sh
   docker build -t ucsdcoursesearch-docker .
   ```
3. **Tag the Docker Image:**
   ```sh
   docker tag ucsdcoursesearch-docker:latest mfrankne/ucsdcoursesearch:latest
   ```
4. **Push the Docker Image to a Registry:**
   ```sh
   docker push mfrankne/ucsdcoursesearch:latest
   ```
5. **Login to Azure:**
   ```sh
   az login
   ```
   Follow the prompts for credentials.

#### Setting up Azure Container Registry (ACR)
Create an Azure Container Registry to store your Docker images:

```sh
az acr create --name ucsdcoursesearch --resource-group ucs-resource-group --sku standard --admin-enabled true
```

#### Deploying the Web Application
To deploy the web application on Azure with a Docker image, use the following command:

```sh
az container create --resource-group ucs-resource-group --name min-ucs-app-instance --image mfrankne/ucsdcoursesearch:latest --cpu 2 --memory 3 --dns-name-label ucsd-course-search --ports 8000
```

The website will be accessible at `http://ucsd-course-search.eastus.azurecontainer.io:8000/`.

### Useful Commands for Logs and Debugging
- **To Check the Container State:**
  ```sh
  az container show --resource-group ucs-resource-group --name min-ucs-app-instance --query containers[0].instanceView.currentState.state
  ```
- **To View Container Events:**
  ```sh
  az container show --resource-group ucs-resource-group --name min-ucs-app-instance --query instanceView.events
  ```
- **To Access Container Logs:**
  ```sh
  az container logs --resource-group ucs-resource-group --name min-ucs-app-instance
  ```
