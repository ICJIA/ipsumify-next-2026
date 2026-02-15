FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ENV NITRO_PRESET=node-server
RUN yarn build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output .output
ENV NODE_ENV=production
ENV PORT=5150
EXPOSE 5150
CMD ["node", ".output/server/index.mjs"]
