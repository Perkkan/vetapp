FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
EXPOSE 5001
EXPOSE 5004
EXPOSE 5005
EXPOSE 5006

CMD ["node", "api_veterinaria.js"]
