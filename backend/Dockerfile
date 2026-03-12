FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Initialize Python venv and install heavy ML dependencies
COPY ml/requirements.txt ./ml/
RUN python3 -m venv ./ml/venv && ./ml/venv/bin/pip install --no-cache-dir -r ./ml/requirements.txt

# Now copy the rest of the application
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
