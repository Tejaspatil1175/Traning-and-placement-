const express = require('express');

const app = express();

const PORT = 3000;


app.get('/', (req, res) => {
  res.send('Hello this is the Traning and placemetn portal backend server!');
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});