FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json tsconfig.json ./
# install all deps for build
RUN npm install
COPY src ./src
RUN npm run build
# remove dev deps to keep image lean
RUN npm prune --production
EXPOSE 5000
CMD ["node", "dist/index.js"]
