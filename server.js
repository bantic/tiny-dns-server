const dns = require("native-node-dns");
const dnsPacket = require("native-node-dns-packet");
const fs = require("fs");

const responseFilepath = process.env.RESPONSE_FILEPATH;
const lookupCountFilepath = process.env.LOOKUP_COUNT_FILEPATH;
const VERBOSE = !!process.env.VERBOSE;

const port = parseInt(process.env.PORT || 53);
const ttlSeconds = parseInt(process.env.TTL_SECONDS || 60);
const server = dns.createServer();

const readFile = (filepath) =>
  fs.readFileSync(filepath, { encoding: "utf-8" }).trim();
const getResolvedIP = (/*q*/) => readFile(responseFilepath);
const getLookupCount = () => parseInt(readFile(lookupCountFilepath));
const incrementLookups = () =>
  fs.writeFileSync(lookupCountFilepath, getLookupCount() + 1 + "", {
    encoding: "utf-8",
  });
server.on("request", (req, res) => {
  let q = req.question[0].name;
  let qtype = req.question[0].type;
  let qtypeName = dnsPacket.consts.qtypeToName(qtype);

  if (qtypeName !== "A") {
    console.error(`Cannot handle qtype ${qtypeName}`);
    process.exit(1);
  }

  let address = getResolvedIP(q);
  let count = getLookupCount();
  console.log(
    `request #${count} for ${q} (${qtypeName}), returning: ${address}`
  );
  if (VERBOSE) {
    console.log("request:", req);
  }
  incrementLookups();

  res.answer.push(
    dns.A({
      name: q,
      address: getResolvedIP(q),
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
console.log(`DNS server will resolve all requests to: ${getResolvedIP()}`);
console.log(`lookup-count file: ${lookupCountFilepath}`);
console.log(`resolve response file: ${responseFilepath}`);

process.on("SIGINT", () => {
  console.log("Caught SIGINT, exiting");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("Caught SIGTERM exiting");
  process.exit(0);
});
