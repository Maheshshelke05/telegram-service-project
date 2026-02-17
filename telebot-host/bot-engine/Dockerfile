FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production
COPY bot.js ./
CMD ["node","bot.js"]
