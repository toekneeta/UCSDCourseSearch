
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
   docker build -t <your-docker-image-name> .
   
   # example
   docker build -t ucsdcoursesearch-docker .
   ```

3. **Tag the Docker Image:**
   ```sh
   docker tag <your-docker-image-name>:<your-dockerhub-username>/<your-repository-name>:<target-tag>
   
   # example
   docker tag ucsdcoursesearch-docker:latest mfrankne/ucsdcoursesearch:latest
   ```

4. **Push the Docker Image to a Registry:**
   ```sh
   docker push <your-dockerhub-username>/<your-repository-name>:<target-tag>

   # example
   docker push mfrankne/ucsdcoursesearch:latest
   ```
5. **Login to Azure:**
   ```sh
   az login
   ```
   Follow the prompts for credentials.

#### Deploying the Web Application
To deploy the web application on Azure with a (public) Docker image, use the following command:

```sh
az container create --resource-group <your-resource-group-name> --name  <your-container-instance-name> --image your-dockerhub-username>/<your-repository-name>:<target-tag> --cpu 4 --memory 4 --dns-name-label <website-url-tag> --ports <port-number>

# example
az container create --resource-group ucs-resource-group --name min-ucs-app-instance --image mfrankne/ucsdcoursesearch:latest --cpu 4 --memory 4 --dns-name-label ucsd-course-search --ports 8000
```

The website will be accessible at `http://ucsd-course-search.eastus.azurecontainer.io:8000/`.

### Useful Commands for Logs and Debugging
- **To Check the Container State:**
  ```sh
  az container show --resource-<your-resource-group-name> --name <your-container-instance-name> --query containers[0].instanceView.currentState.state

  # example
  az container show --resource-group ucs-resource-group --name min-ucs-app-instance --query containers[0].instanceView.currentState.state
  ```
- **To View Container Events:**
  ```sh
  az container show --resource-<your-resource-group-name> --name <your-container-instance-name> --query instanceView.events

  # example
  az container show --resource-group ucs-resource-group --name min-ucs-app-instance --query instanceView.events
  ```
- **To Access Container Logs:**
  ```sh
  az container logs --resource-<your-resource-group-name> --name <your-container-instance-name>

  # example
  az container logs --resource-group ucs-resource-group --name min-ucs-app-instance
  ```
