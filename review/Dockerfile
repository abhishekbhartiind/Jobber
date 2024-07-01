FROM node:18-alpine as builder

# stage 1
# npm install
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
RUN npm install -g npm@latest
RUN npm ci && npm run build

# stage 2
# npm run build/test
FROM node:18-alpine

WORKDIR /app
# with alpine we can install curl with apk command
RUN apk add --no-cache curl
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./
RUN npm install -g pm2
RUN pm2 link tr9576v2namo64f 4exhsd4gfwi476u
RUN npm ci --production
COPY --from=builder /app/build ./build

EXPOSE 4007

CMD [ "npm", "run", "start" ]

# stage 3
# npm ci/build

# stage 4
