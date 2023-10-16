FROM golang:1.21.3-alpine

ARG CMD=h3server.go

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -v -o /usr/local/bin/app ./cmd/${CMD}

CMD [ "app" ]