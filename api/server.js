const express = require('express');
const app = express();
app.get('/api/notes', (req, res) =>
  res.json([{ id: 1, title: "Demo note from container" }])
);
app.listen(process.env.PORT || 3000, () =>
  console.log('API listening on port', process.env.PORT || 3000)
);
