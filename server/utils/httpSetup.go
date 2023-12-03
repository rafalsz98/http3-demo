package utils

import (
	"fmt"
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

	http.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte("405 - Method Not Allowed"))
			return
		}

		// Parse the multipart form in the request
		err := r.ParseMultipartForm(32 << 20) // 32MB is the default used by http package
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("500 - Internal Server Error (ParseMultipartForm)"))
			return
		}

		// Get the file from the uploaded form
		file, _, err := r.FormFile("file")
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Bad Request"))
			return
		}
		defer file.Close()

		// Calculate the size of the file
		fileSize, err := file.Seek(0, 2) // Seek to the end of the file
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("500 - Internal Server Error (Seek)"))
			return
		}

		// Set the file pointer back to the beginning
		_, err = file.Seek(0, 0)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("500 - Internal Server Error"))
			return
		}

		// Return the size of the file to the client
		fmt.Fprintf(w, "File size: %d bytes", fileSize)
		w.WriteHeader(http.StatusOK)
	})
}
