# Use the node:18-slim as the base image
FROM node:18-slim AS client-build
#-slim AS client-build
# Pinned on version 18 for LTS
### Manager
#WORKDIR /usr/src/app
# INSTALL CURL
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@10.3.0

COPY automationtest-manager /usr/src/app/manager/
WORKDIR /usr/src/app/manager/
RUN npm cache clean --force && npm config rm proxy && npm config rm https-proxy && npm install -g @angular/cli && npm install && npm run build
#RUN npm install -g @angular/cli && npm install --omit=dev && ng build --configuration=production
#RUN npm install -g @angular/cli && npm install && npm run build
### Controller
COPY automationtest-controller /usr/src/app/controller/
WORKDIR /usr/src/app/controller/
RUN npm install
WORKDIR /usr/src/app/manager/
EXPOSE 4200
EXPOSE 3001

ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
NEW_RELIC_NO_CONFIG_FILE=true \
NEW_RELIC_LOG=stdout \
NEW_RELIC_LICENSE_KEY=ff67bd61a2504f7ebfcbe03e19582e4eFFFFNRAL \
NEW_RELIC_APP_NAME="AUTOMATIONTEST-CONTROLLER"


CMD ["npm", "start"]
#, "start:angular"]
