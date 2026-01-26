FROM node:18-alpine
WORKDIR /usr/src/app

# Install only production dependencies by default
COPY node_server/package*.json ./node_server/
WORKDIR /usr/src/app/node_server
RUN npm install --production

# Copy app source
COPY node_server/ .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
