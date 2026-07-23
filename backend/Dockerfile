FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .


RUN mkdir -p uploads/products

EXPOSE 8080

CMD ["node", "server.js"]
