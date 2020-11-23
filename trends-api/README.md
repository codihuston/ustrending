# Purpose

This project was designed to sort of emulate a commonly useed
project structure for a web API. The idea was to separate each
`model` and `controller` (and other services, such as `database` connectors)
into their own `packages`.

## Testing

To test, please do the following

1. Install docker

1. Setup the database using docker

```
docker pull postgres
docker run --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
```

1. Setup environment variables

```
powershell
$env:GMH_DB_USERNAME="postgres"
$env:GMH_DB_PASSWORD="postgres"
$env:GMH_DB_NAME="postgres"

bash
export GMH_DB_USERNAME=postgres
export GMH_DB_PASSWORD=postgres
export GMH_DB_NAME=postgres
```

1. In the root of this project, run:

```
go test -v
```

Expected output:

```
PS C:\Users\Codi\git\ustrending/trends-api> go test -v
=== RUN   TestEmptyTable
--- PASS: TestEmptyTable (0.01s)  
=== RUN   TestCreateProduct     
--- PASS: TestCreateProduct (0.01s)
=== RUN   TestGetProduct
--- PASS: TestGetProduct (0.01s)
=== RUN   TestUpdateProduct
--- PASS: TestUpdateProduct (0.02s)
=== RUN   TestDeleteProduct
--- PASS: TestDeleteProduct (0.02s)
PASS
ok      github.com/codihuston/ustrending/trends-api  0.459s
```

## Cleanup

Be sure to clean up the docker image you started.

```
docker ps

CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
0ae813bf8d41        postgres            "docker-entrypoint.s…"   3 hours ago         Up 3 hours          0.0.0.0:5432->5432/tcp   some-postgres

docker kill some-postgres
docker rm 0ae813bf8d41
```