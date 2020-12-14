const fs = require('fs');
const express = require('express');
const port = process.env.PORT || 8080;

const app = express();

const StreamZip = require('node-stream-zip');

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

app.listen(port);