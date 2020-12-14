const express = require('express');
const port = process.env.PORT || 8080;

const app = express();

app.get('/', (req, res) => {
  res.send(`Hola mundo`);
});

app.listen(port);