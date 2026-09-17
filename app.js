require("dotenv").config();
const express = require("express");
const cors = require("cors");
const DBConnect = require("./src/config/dbConnect");
const indexRoute = require("./src/router/index");
const session = require("express-session");
const path = require("path");

DBConnect();

const app = express();

const Port = process.env.PORT || 3008;

app.use(cors());

// =====================================================
// STATIC FILES
// =====================================================

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(indexRoute);

app.listen(Port, () => {
  console.log(`Server is running on port: ${Port}`);
});
