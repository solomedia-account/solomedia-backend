FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p logs
EXPOSE 5000
ENV NODE_OPTIONS=--max-old-space-size=768
CMD ["node", "server.js"]
