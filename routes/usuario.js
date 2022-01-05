// Route file for getting and editing gastos
var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer();
var db = require("../config/db");
const { check, escape, validationResult } = require("express-validator");
var messages = require("../data/messages");
var utils = require("../utils/utils");

// Create a new usuario
router.post(
  "/",
  [upload.none(), check("username").escape(), check("nombre").escape()],
  (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }
    // Loads the data into variables to use
    var userUsername = req.body.username;
    var userNombre = req.body.nombre;

    // Validates that all the compulsory fields are present
    if (!userUsername || !userNombre) {
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }

    // Validates that the username has no spaces
    if (userUsername.indexOf(" ") !== -1) {
      return res.status(400).json({ message: messages.USERNAME_INCORRECT });
    }

    // Verifies that the username is not already in use
    let sql = "SELECT * FROM usuario WHERE username = '" + userUsername + "'";
    let query = db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      // If there is at least one result, return error
      if (results.length) {
        return res.status(400).json({ message: messages.USERNAME_REPEAT });
      }

      // Adds the user to the database
      sql =
        "INSERT INTO usuario (username, nombre) VALUES ('" +
        userUsername +
        "','" +
        userNombre +
        "')";
      query = db.query(sql, (err, results) => {
        if (err) {
          throw err;
        }

        // After the usuario is inserted, create a login record and return it
        sql = "SELECT * FROM usuario WHERE id = LAST_INSERT_ID()";
        query = db.query(sql, (err, usuarioResults) => {
          if (err) {
            throw err;
          }
          var usuarioId = usuarioResults[0].id;
          var currentTimestamp = Math.round(new Date() / 1000);
          var loginToken = utils.generateToken(25);
          sql =
            "INSERT INTO login (fecha, usuarioId, token) VALUES (" +
            currentTimestamp +
            "," +
            usuarioId +
            ",'" +
            loginToken +
            "')";
          query = db.query(sql, (err, results) => {
            if (err) {
              throw err;
            }
            // Add the generated token to the response
            usuarioResults[0].token = loginToken;
            delete usuarioResults[0].id;
            res.status(201).send(usuarioResults[0]);
          });
        });
      });
    });
  }
);

router.post(
  "/verify",
  [upload.none(), check("username").escape()],
  (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }
    // Loads the data into variables to use
    var userUsername = req.body.username;
    // Validates that all the compulsory fields are present
    if (!userUsername) {
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }
    // Validates that the username has no spaces
    if (userUsername.indexOf(" ") !== -1) {
      return res.status(400).json({ message: messages.USERNAME_INCORRECT });
    }
    // Verifies that the username is not already in use
    let sql = "SELECT * FROM usuario WHERE username = '" + userUsername + "'";
    let query = db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      // If there is at least one result, return error
      if (results.length) {
        return res.status(404).json({ message: messages.USERNAME_REPEAT });
      }
      // If the username doesn't exist, respond 200
      return res.status(200).json({ message: messages.USERNAME_CORRECT });
    });
  }
);

module.exports = router;
