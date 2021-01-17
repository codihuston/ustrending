package thirdparty

// OAuth2
import (
	"os"

	"github.com/dghubble/go-twitter/twitter"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

// GetTwitterClient returns a twitter client
func GetTwitterClient() *twitter.Client {
	// oauth2 configures a client that uses app credentials to keep a fresh token
	config := &clientcredentials.Config{
		ClientID:     os.Getenv("TWITTER_API_KEY"),
		ClientSecret: os.Getenv("TWITTER_API_SECRET_KEY"),
		TokenURL:     "https://api.twitter.com/oauth2/token",
	}
	// http.Client will automatically authorize Requests
	httpClient := config.Client(oauth2.NoContext)

	// Twitter client
	TwitterClient := twitter.NewClient(httpClient)

	return TwitterClient
}
