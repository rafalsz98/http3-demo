FROM curl-ng

RUN apt-get update
RUN apt-get install -y unzip
RUN apt-get install -y iproute2

RUN curl -fsSL https://bun.sh/install | bash

ENV PATH=$PATH:/root/.bun/bin

WORKDIR /app
COPY . .

ENTRYPOINT ["/root/.bun/bin/bun"]