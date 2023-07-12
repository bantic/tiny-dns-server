# lts-bullseye-slim selected based on
# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
FROM node:lts-bullseye-slim

ENV PORT=53
ENV TTL_SECONDS=60
ENV VERBOSE=""

ARG LOOKUP_COUNT_FILEPATH=/dns-lookup-count.txt
ARG RESPONSE_FILEPATH=/dns-response.txt
ENV LOOKUP_COUNT_FILEPATH=${LOOKUP_COUNT_FILEPATH}
ENV RESPONSE_FILEPATH=${RESPONSE_FILEPATH}

RUN mkdir /app
WORKDIR /app
RUN npm install native-node-dns
RUN echo "0" > ${LOOKUP_COUNT_FILEPATH}
RUN echo "127.0.0.1" > ${RESPONSE_FILEPATH}
COPY server.js server.js
EXPOSE ${PORT}/udp
CMD ["node", "server.js"]
