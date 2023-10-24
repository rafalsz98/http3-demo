package main

import (
	"fmt"
	"log"

	"github.com/quic-go/quic-go/http3"
	"github.com/rafalsz98/http3-demo/utils"
)

var envs utils.Environment

func main() {
	envs = utils.GetEnvs()

	utils.SetupHttp()

	address := fmt.Sprintf("0.0.0.0:%s", envs.Port)
	log.Printf("Starting HTTP/3 server on %s", address)

	err := http3.ListenAndServe(address, envs.SSL.CertPath, envs.SSL.KeyPath, nil)
	if err != nil {
		log.Fatal(err)
	}
}
