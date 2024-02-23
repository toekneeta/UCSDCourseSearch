# syntax=docker/dockerfile:1

# Build stage for compiling and installing dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    unixodbc-dev \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final stage for running the app
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies and Microsoft ODBC Driver for SQL Server
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gnupg2 \
    curl \
    unixodbc \
    && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/* /usr/share/keyrings/microsoft-archive-keyring.gpg

# Copy pre-built wheels from the builder stage
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache-dir /wheels/* \
    && rm -rf /wheels

# Copying application data
COPY board ./board
COPY data/course_catalog_final.pkl ./data/

# Expose the port the app runs on
EXPOSE 8000

# Use gunicorn or another WSGI server for serving Flask apps in production
CMD ["gunicorn", "--workers=3", "--bind", "0.0.0.0:8000", "board:create_app()"]
