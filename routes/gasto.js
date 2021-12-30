// Route file for getting and editing gastos
var express = require("express");
var router = express.Router();
var db = require("../config/db.js");
const { check, escape, validationResult } = require("express-validator");
var messages = require("../data/messages.js");

// Returns casa by hash
router.post(
  "/:casaHash",
  [
    check("casaHash").escape(),
    check("date").isNumeric(),
    check("name").escape(),
    check("detail").escape(),
    check("category").isNumeric(),
    check("amount").isNumeric().isFloat({ min: 0 }),
    check("currency").isNumeric(),
  ],
  (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      return res.status(400).send(messages.PARAMETERS_ERROR);
    }
    // Loads the data into variables to use
    var casaHash = req.params.casaHash;
    var gastoDate = req.body.date;
    var gastoName = req.body.name;
    var gastoDetail = req.body.detail;
    var gastoCategory = req.body.category;
    var gastoAmount = req.body.amount;
    var gastoCurrency = req.body.currency;
    var userId = req.userId;

    // Validates that all the compulsory fields are present
    if (
      !gastoDate ||
      !gastoName ||
      !gastoCategory ||
      !gastoAmount ||
      !gastoCurrency ||
      !userId
    ) {
      return res.status(400).send(messages.PARAMETERS_ERROR);
    }
    // Verifies that the specified casa exists
    let sql = "SELECT * FROM casa WHERE hash = '" + casaHash + "'";
    let query = db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      // Verify that there is at least one casa with that hash
      if (!results.length) {
        return res.status(404).send(messages.CASA_NOT_FOUND);
      }
      // Verifies that the category exists
      sql = "SELECT * FROM categoria WHERE id = " + gastoCategory;
      query = db.query(sql, (err, results) => {
        if (err) {
          throw err;
        }
        if (!results.length) {
          return res.status(400).send(messages.PARAMETERS_ERROR);
        }
        // Verifies that the currency exists
        sql = "SELECT * FROM moneda WHERE id = " + gastoCurrency;
        query = db.query(sql, (err, results) => {
          if (err) {
            throw err;
          }
          if (!results.length) {
            return res.status(400).send(messages.PARAMETERS_ERROR);
          }
          sql =
            "INSERT INTO gasto (fecha, nombre, descripcion, categoriaId, monto, monedaId, usuarioId) VALUES (" +
            gastoDate +
            ",'" +
            gastoName +
            "','" +
            gastoDetail +
            "'," +
            gastoCategory +
            "," +
            gastoAmount +
            "," +
            gastoCurrency +
            "," +
            userId +
            ")";
          query = db.query(sql, (err, results) => {
            if (err) {
              throw err;
            }
            // After the gasto is inserted, return it to the UI
            sql = "SELECT * FROM gasto WHERE id = LAST_INSERT_ID()";
            query = db.query(sql, (err, results) => {
              if (err) {
                throw err;
              }
              res.status(201).send(results[0]);
            });
          });
        });
      });
    });
  }
);

module.exports = router;
