# tiny dns server docker container

Very tiny dns server in a docker container

It resolves all DNS "A" record requests to a single IP address.

Looks up the IP address from the file `/dns-response.txt`
Increments the count of all requests to `/dns-lookup-count.txt`

This can be used to narrowly control DNS responses when testing.
Write to the docker container's response file to change the response, or read the lookup count file to see how many requests it has served.

## Usage

Basic:

```
docker run --rm -it -p 8080:53/udp coryfaddepar/tiny-dns-server:latest
```

Query it from another terminal via:

```
dig @localhost -p 8080 example.com
```

Some options that can be set via env variable:

- `PORT` the container listen port
- `VERBOSE` prints out more info
- `TTL_SECONDS` The ttl to use in responses (default: 60)

### Troubleshooting

The node js script can be run locally, too:

```
npm install native-node-dns
echo '0' > ./lookup.txt
echo '127.0.0.1' > ./response.txt
PORT=8080 \
 LOOKUP_COUNT_FILEPATH=./lookup.txt \
 RESPONSE_FILEPATH=./response.txt \
 node server.js
```
