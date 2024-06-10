const express = require("express");
const app = express();

app.use("/api", require("./server/routes.js"));

const port = 3000;

app.listen(port, () => {
  console.log(`Listening on http://localhost:3000/${port}`);
});
