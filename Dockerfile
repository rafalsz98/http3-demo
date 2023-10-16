FROM golang:1.21.3-alpine

ARG CMD=h3server.go
ARG PORT

ENV PORT=${PORT}

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -v -o /usr/local/bin/app ./cmd/${CMD}

EXPOSE ${PORT}

CMD [ "app" ]