FROM debian:12 AS builder

WORKDIR /opt

ARG CURL_VERSION=curl-8_4_0
ARG QUICHE_VERSION=0.18.0

RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential git autoconf libtool cmake golang-go curl libnghttp2-dev zlib1g-dev

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y -q;

# steps from https://curl.se/docs/http3.html
RUN git clone --recursive https://github.com/cloudflare/quiche

RUN cd quiche && \
  export PATH="$HOME/.cargo/bin:$PATH" && \
  git checkout $QUICHE_VERSION && \
  cargo build --package quiche --release --features ffi,pkg-config-meta,qlog && \
  mkdir quiche/deps/boringssl/src/lib && \
  ln -vnf $(find target/release -name libcrypto.a -o -name libssl.a) quiche/deps/boringssl/src/lib/

RUN git clone https://github.com/curl/curl
RUN cd curl && \
  git checkout $CURL_VERSION && \
  autoreconf -fi && \
  ./configure LDFLAGS="-Wl,-rpath,/opt/quiche/target/release" --with-openssl=/opt/quiche/quiche/deps/boringssl/src --with-quiche=/opt/quiche/target/release --with-nghttp2 --with-zlib && \
  make && \
  make DESTDIR="/debian/" install


FROM debian:12-slim
RUN apt-get update && apt-get install -y ca-certificates nghttp2 zlib1g && rm -rf /var/lib/apt/lists/*

COPY --from=builder /debian/usr/local/ /usr/local/
COPY --from=builder /opt/quiche/target/release /opt/quiche/target/release

RUN ldconfig

WORKDIR /opt

CMD ["curl"]