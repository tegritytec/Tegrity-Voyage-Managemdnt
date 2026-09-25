FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

EXPOSE 8082

ENV PORT=8082

CMD ["npm", "start"]
