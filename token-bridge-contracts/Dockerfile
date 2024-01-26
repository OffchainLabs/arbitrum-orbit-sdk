FROM node:16-bullseye-slim
RUN apt-get update && \
    apt-get install -y git docker.io python3 chromium build-essential
WORKDIR /workspace
RUN git clone -b v1.2.0 https://github.com/OffchainLabs/token-bridge-contracts.git ./
RUN yarn install
RUN yarn build
ENTRYPOINT ["yarn"]
