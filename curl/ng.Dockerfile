# Base stage for fetching dependencies and building
FROM ubuntu:22.04 as base
RUN apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
  git build-essential pkg-config autoconf libtool tzdata libev-dev

# Build OpenSSL
WORKDIR /root
RUN git clone --depth 1 -b openssl-3.0.10+quic https://github.com/quictls/openssl
WORKDIR /root/openssl
RUN ./config enable-tls1_3 --prefix=/openssl && \
  make -j$(nproc) && \
  make install

# Build nghttp3
WORKDIR /root
RUN git clone --depth 1 -b v0.15.0 https://github.com/ngtcp2/nghttp3
WORKDIR /root/nghttp3
RUN autoreconf -fi && \
  ./configure --prefix=/nghttp3 --enable-lib-only && \
  make -j$(nproc) && \
  make install

# Build ngtcp2
WORKDIR /root
RUN git clone --depth 1 -b v0.19.1 https://github.com/ngtcp2/ngtcp2
WORKDIR /root/ngtcp2
RUN autoreconf -fi && \
  ./configure PKG_CONFIG_PATH=/openssl/lib/pkgconfig:/nghttp3/lib/pkgconfig \
  LDFLAGS="-Wl,-rpath,/openssl/lib" \
  --prefix=/ngtcp2 \
  --enable-lib-only && \
  make -j$(nproc) && \
  make install

RUN apt-get install -y libpsl-dev

# Build Curl
WORKDIR /root
RUN git clone --depth 1 https://github.com/curl/curl
WORKDIR /root/curl
RUN autoreconf -fi && \
  LDFLAGS="-Wl,-rpath,/openssl/lib" \
  ./configure --with-openssl=/openssl \
  --with-nghttp3=/nghttp3 \
  --with-ngtcp2=/ngtcp2 \
  --with-ca-path=/etc/ssl/certs && \
  make -j$(nproc) && \
  make install

RUN ldconfig
ENTRYPOINT [ "curl" ]
