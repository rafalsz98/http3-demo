FROM ubuntu:20.04

WORKDIR /temp

ENV TZ=Europe/Warsaw
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get upgrade
RUN apt-get update

RUN apt-get install -yq openssl git gcc g++ wget cmake autoconf

RUN wget -O - https://sh.rustup.rs/ | sh -s -- -y
ENV PATH="${PATH}:/root/.cargo/bin"

# steps from https://curl.se/docs/http3.html
RUN git clone -b 0.18.0 --recursive https://github.com/cloudflare/quiche
WORKDIR /temp/quiche
RUN cargo build --package quiche --release --features ffi,pkg-config-meta,qlog
RUN mkdir quiche/deps/boringssl/src/lib
RUN ln -vnf $(find target/release -name libcrypto.a -o -name libssl.a) quiche/deps/boringssl/src/lib/

WORKDIR /temp
RUN git clone https://github.com/curl/curl
WORKDIR /temp/curl
RUN apt-get install -yq libtool
RUN autoreconf -fi
RUN ./configure LDFLAGS="-Wl,-rpath,/temp/quiche/target/release" --with-openssl=/temp/quiche/quiche/deps/boringssl/src --with-quiche=/temp/quiche/target/release
RUN make
RUN make install

CMD [ "/bin/sh" ]
