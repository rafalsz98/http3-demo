package utils

import (
	"log"

	env "github.com/Netflix/go-env"
	"github.com/joho/godotenv"
)

type Environment struct {
	Port string `env:"PORT"`
	SSL  struct {
		CertPath string `env:"SSL_CERT_PATH"`
		KeyPath  string `env:"SSL_KEY_PATH"`
	}
	Extras env.EnvSet
}

func GetEnvs() Environment {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	var environment Environment
	es, err := env.UnmarshalFromEnviron(&environment)
	if err != nil {
		log.Fatal(err)
	}

	environment.Extras = es

	return environment
}
