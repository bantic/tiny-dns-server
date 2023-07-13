const dns = require("native-node-dns");
const dnsPacket = require("native-node-dns-packet");
const fs = require("fs");

const responseFilepath = process.env.RESPONSE_FILEPATH;
const statsFilepath = process.env.STATS_FILEPATH;
const VERBOSE = !!process.env.VERBOSE;

const port = parseInt(process.env.PORT || 53);
const ttlSeconds = parseInt(process.env.TTL_SECONDS || 60);
const server = dns.createServer();

const stats = {
  requests: {
    A: 0,
    AAAA: 0,
  },
};

const readFile = (filepath) =>
  fs.readFileSync(filepath, { encoding: "utf-8" }).trim();
const getResponseIP = (/*q*/) => readFile(responseFilepath);
const writeStats = () => {
  fs.writeFileSync(statsFilepath, JSON.stringify(stats), { encoding: "utf-8" });
};

// Write stats initially
writeStats(stats);

server.on("request", (req, res) => {
  let q = req.question[0].name;
  let qtypeName = dnsPacket.consts.qtypeToName(req.question[0].type);

  if (!["A", "AAAA"].includes(qtypeName)) {
    console.error("Unexpected DNS request type:", qtypeName);
    process.exit(1);
  }

  stats.requests[qtypeName] += 1;
  let count = stats.requests[qtypeName];
  writeStats();

  if (qtypeName === "AAAA") {
    console.log(`Request #${count} for AAAA, sending empty response`);
    res.send();
    return;
  }

  let address = getResponseIP(q);
  console.log(
    `request #${count} for ${q} (${qtypeName}), returning: ${address}`
  );
  if (VERBOSE) {
    console.log("request:", req);
  }

  res.answer.push(
    dns.A({
      name: q,
      address: getResponseIP(q),
      ttl: ttlSeconds,
    })
  );
  if (VERBOSE) {
    console.log("response:", res);
  }
  res.send();
});
server.on("error", (...args) => {
  console.log("DNS got error", ...args);
});
server.serve(port, "0.0.0.0");
console.log(
  `DNS server listening on port: ${port}, ttl: ${ttlSeconds} seconds`
);
console.log(`DNS server will resolve all requests to: ${getResponseIP()}`);
console.log(`stats file: ${statsFilepath}`);
console.log(`resolve response file: ${responseFilepath}`);

process.on("SIGINT", () => {
  console.log("Caught SIGINT, exiting");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("Caught SIGTERM exiting");
  process.exit(0);
});
