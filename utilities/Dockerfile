FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for audio processing (ffmpeg)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install Python dependencies
# Note: For real GPU support, use a pytorch/cuda base image, but this suffices for general compat
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
