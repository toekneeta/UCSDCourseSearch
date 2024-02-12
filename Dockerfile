# syntax=docker/dockerfile:1

FROM python:3.11-slim

WORKDIR /app

# Install dependencies in a way that optimizes build cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copying application data
COPY nltk_data ./nltk_data
COPY board ./board
COPY data/course_catalog_with_flag_embeddings.pkl ./data/course_catalog_with_flag_embeddings.pkl

# NLTK data environment variable is correctly set
ENV NLTK_DATA /app/nltk_data

# Expose the port the app runs on
EXPOSE 8000

# Use gunicorn or another WSGI server for serving Flask apps in production
# RUN pip install gunicorn
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "board:app"]
# CMD ["python", "-m", "flask", "--app", "board", "run", "--port", "8000", "--debug"]
# CMD ["gunicorn", "--workers=2", "--threads=4", "--worker-class=gthread", "--bind", "0.0.0.0:8000", "board:app"]
CMD ["gunicorn", "--workers=3", "--bind", "0.0.0.0:8000", "board:create_app()"]
