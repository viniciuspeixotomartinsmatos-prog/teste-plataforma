FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=4173
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server ./server
COPY --from=build /app/dist/client ./dist/client
RUN mkdir var && chown node:node var
USER node
VOLUME ["/app/var"]
EXPOSE 4173
CMD ["node", "server/start.mjs"]
