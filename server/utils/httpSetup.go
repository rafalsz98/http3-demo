package utils

import (
	"log"
	"net/http"
	"os"
)

func SetupHttp() {
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
}
