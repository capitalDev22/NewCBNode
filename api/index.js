// api/index.js
const app = require("../server");

// Vercel expects a function
module.exports = (req, res) => {
  app(req, res);
};
