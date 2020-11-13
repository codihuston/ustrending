package main

import "os"

/*
TODO: implement dependency injection for:
- databases
- models
- model repository (for returning model instances from db as structs)
- services (a layer between http and the repository)
- implement DI and containers in main()

See:
- https://blog.drewolson.org/dependency-injection-in-go
- https://medium.com/@elliotchance/a-new-simpler-way-to-do-dependency-injection-in-go-9e191bef50d5

*/
func main() {
	a := App{}

	a.Initialize(
		os.Getenv("GMH_DB_USERNAME"),
		os.Getenv("GMH_DB_PASSWORD"),
		os.Getenv("GMH_DB_NAME"),
	)

	a.Run(":3000")
}
