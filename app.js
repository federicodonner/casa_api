const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware for authentication
var authenticationMiddleware = require("./middleware/authentication");
app.use("/gasto", authenticationMiddleware.authentication);

// Routes for casa operations
var oauthRoute = require("./routes/oauth");
app.use("/oauth", oauthRoute);

// Routes for casa operations
var casaRoute = require("./routes/casa");
app.use("/casa", casaRoute);

// Routes for gasto operations
var gastoRoute = require("./routes/gasto");
app.use("/gasto", gastoRoute);

app.listen("3000", () => {
  console.log("server started on port 3000");
});
