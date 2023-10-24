package utils

import (
	"net/http"
	"os"
)

func SetupHttp() {
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	fs := http.FileServer(http.Dir(wd + "/utils/page"))
	http.Handle("/public/", http.StripPrefix("/public", fs))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("TEST"))
	})
}
