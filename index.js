const fs = require('fs');
const express = require('express');
const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const StreamZip = require('node-stream-zip');

const redis = require("redis");

const redisCertificateBase64 = process.env.redis_certificate_base64;
const redisUrl = process.env.redis_url;

const ca = Buffer.from(redisCertificateBase64, 'base64').toString('utf-8');

const clientRedis = redis.createClient(redisUrl, {tls: { ca } });

clientRedis.on('connect', () => console.info(`[redis][createClient]: Connected to Redis ${new Date()}`));
 
clientRedis.on("error", (error) => console.error(`[redis][createClient]: ${error}`));

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send(`Hola mundo`);
});

app.post('/unzip', upload.single('file'), (req, res) => {
  const path = req.file.path;
  const zip = new StreamZip({ file: path, storeEntries: true });
  zip.on('ready', () => {
    let response = {};
    response.entriesCount = zip.entriesCount;
    response.entries = [];
    for (const entry of Object.values(zip.entries())) {
      const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
      response.entries.push({ name: entry.name, desc });
    }
    res.json(response);
  });
});

app.get('/redis', (req, res) => {
  clientRedis.get("content", function(err, reply) {
    return res.send(reply.toString());
  });
});


app.post('/redis', (req, res) => {
  clientRedis.set("content", req.body.content);
  return res.send('OK');
});

app.listen(port);