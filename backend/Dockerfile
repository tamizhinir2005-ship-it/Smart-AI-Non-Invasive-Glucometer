FROM node:20-bullseye
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv
WORKDIR /app
COPY . .
RUN npm install
RUN python3 -m venv ./ml/venv
RUN ./ml/venv/bin/pip install -r ./ml/requirements.txt
EXPOSE 5000
CMD ["node", "server.js"]
