FROM node:16.6.0-alpine
WORKDIR /code
COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
COPY src /code
RUN yarn --production
ENV PORT=80
ENTRYPOINT node server.js
HEALTHCHECK --interval=5m --timeout=10s CMD curl -sS 'http://localhost:${PORT}/health'