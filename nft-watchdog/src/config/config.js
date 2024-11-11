require("dotenv").config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  PRIVATE_KEY: process.env.PRIVATE_KEY
};
