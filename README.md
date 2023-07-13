# tiny dns server docker container

Very tiny dns server in a docker container

It resolves all DNS "A" record requests to a single IP address.
It resolves all DNS "AAAA" requests with an empty (no answer) response.
All other DNS request types result in an error and the container exits.

Looks up the IP address from the file `/dns-response.txt`
Keeps request stats in JSON format in `/dns-stats.json`

This can be used to narrowly control DNS responses when testing.
Write to the docker container's response file to change the response, or read the lookup count file to see how many requests it has served.

## Usage

Basic:

```
docker run --rm -it -p 8080:53/udp --name tiny-dns coryfaddepar/tiny-dns-server:latest
```

Query it from another terminal via:

```
dig @localhost -p 8080 example.com
```

Or for an AAAA (ipv6) record (the answer will be empty):

```
dig @localhost -p 8080 example.com AAAA
```

View the stats by reading from the docker container:

```
docker exec tiny-dns cat /dns-stats.json | jq
```

Change the response IP address by overwriting the dns-response file:

```
docker exec tiny-dns /bin/sh -c 'echo "127.0.0.2" > /dns-response.txt'
```

Some options that can be set via env variable:

- `PORT` the container listen port
- `VERBOSE` prints out more info
- `TTL_SECONDS` The ttl to use in responses (default: 60)

### Troubleshooting

The node js script can be run locally, too:

```
npm install native-node-dns
echo '127.0.0.1' > ./response.txt
PORT=8080 \
 STATS_FILEPATH=./stats.txt \
 RESPONSE_FILEPATH=./response.txt \
 node server.js
```

### Building

Build for amd and arm:

```
docker buildx build --platform=linux/amd64,linux/arm64 --tag coryfaddepar/tiny-dns-server:latest --push .
```
