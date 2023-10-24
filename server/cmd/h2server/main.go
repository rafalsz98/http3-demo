package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rafalsz98/http3-demo/utils"
)

var envs utils.Environment

func main() {
	envs = utils.GetEnvs()

	address := fmt.Sprintf("0.0.0.0:%s", envs.Port)
	log.Printf("Starting HTTP/2 server on %s", address)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("TEST"))
	})

	err := http.ListenAndServeTLS(address, envs.SSL.CertPath, envs.SSL.KeyPath, nil)
	if err != nil {
		log.Fatal(err)
	}
}
