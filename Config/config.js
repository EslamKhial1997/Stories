const mongoose = require("mongoose");

const dbCollection = () => {
  mongoose
    .connect(process.env.DB_URL, {
    })
    .then(() => console.log("Connected")).catch((err) => {
      console.error('Database connection error:', err);
    });;
};

module.exports = dbCollection;
