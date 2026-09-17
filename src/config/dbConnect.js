const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const DBconnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);

    if (connection) {
      console.log("MongoDB connected successfully");
    } else {
      console.log("MongoDB connection is failed");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = DBconnect;
