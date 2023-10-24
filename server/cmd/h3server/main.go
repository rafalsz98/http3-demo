package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/quic-go/quic-go/http3"
	"github.com/rafalsz98/http3-demo/utils"
)

var envs utils.Environment

func main() {
	envs = utils.GetEnvs()

	address := fmt.Sprintf("0.0.0.0:%s", envs.Port)
	log.Printf("Starting HTTP/3 server on %s", address)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("TEST"))
	})

	http.HandleFunc("/page", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		data, err := os.ReadFile("utils/page/index.html")
		if err != nil {
			log.Fatal("Error: " + err.Error())
		}
		w.Write((data))
	})

	err := http3.ListenAndServe(address, envs.SSL.CertPath, envs.SSL.KeyPath, nil)
	if err != nil {
		log.Fatal(err)
	}
}
