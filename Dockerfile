FROM node:16.6.0-alpine
RUN apk add postfix
WORKDIR /code
COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
COPY src /code
RUN yarn --production
ENV PORT=80
ENTRYPOINT postfix start && node server.js
HEALTHCHECK --interval=1m --timeout=10s CMD node healthcheck.js