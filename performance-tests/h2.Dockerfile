FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
  curl iproute2 unzip

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH=$PATH:/root/.bun/bin

WORKDIR /app
COPY . .

ENTRYPOINT ["/root/.bun/bin/bun"]