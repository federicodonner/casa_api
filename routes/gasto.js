// Route file for getting and editing gastos
var express = require("express");
var router = express.Router();
var db = require("../config/db.js");
const { check, escape, validationResult } = require("express-validator");
var messages = require("../data/messages.js");

// Create a new gasto
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

// Get the gastos for the hashed casa in the especified month
router.get(
  "/:casaHash/mensual/:gastosAno/:gastosMes",
  [
    check("casaHash").escape(),
    check("gastosAno").isNumeric().isFloat({ min: 2000 }),
    check("gastosMes").isNumeric().isFloat({ max: 12, min: 1 }),
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
    var gastosAno = req.params.gastosAno;
    var gastosMes = req.params.gastosMes;

    // Verifies that the specified casa exists
    let sql = "SELECT id FROM casa WHERE hash = '" + casaHash + "'";
    let query = db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      // Verify that there is at least one casa with that hash
      if (!results.length) {
        return res.status(404).send(messages.CASA_NOT_FOUND);
      }

      var casaId = results[0].id;

      // Set the dates for the query
      var startDate = new Date(gastosAno, gastosMes - 1);
      startDate = Math.round(startDate / 1000);
      var endDate = new Date(gastosAno, gastosMes);
      endDate = Math.round(endDate / 1000 - 1);

      // Get the categoria to fetch each gasto
      sql =
        "SELECT * FROM categoria WHERE casaId = " + casaId + " ORDER BY nombre";
      query = db.query(sql, (err, categoriaResults) => {
        if (err) {
          throw err;
        }

        // Set up a promieses array to resolve when the
        // gastos for each categoria return
        var categoriaPromises = [];
        categoriaResults.forEach((categoria, index) => {
          // Get the gastos of the categoria
          // Create a promise for each one and resolve when the query finishes
          categoriaPromises.push(
            new Promise((resolve, reject) => {
              var categoriaId = categoria.id;
              // Filter by the specified dates
              sql =
                "SELECT * FROM gasto WHERE categoriaId = " +
                categoriaId +
                " AND fecha >" +
                startDate +
                " AND fecha <" +
                endDate +
                " ORDER BY fecha";
              query = db.query(sql, (err, gastosResults) => {
                if (err) {
                  throw err;
                }
                // When the query finishes, resolve the promise
                resolve({ index: index, gastos: gastosResults });
              });
            })
          );
        });

        // When all the promises resolve, populate the categorias
        // and return the request
        Promise.all(categoriaPromises).then((values) => {
          values.forEach((value) => {
            categoriaResults[value.index].gastos = value.gastos;
          });

          // Go over the categoria results and delete all
          // that have no gastos for the period
          categoriaResults.forEach((categoria, index) => {
            if (!categoria.gastos.length) {
              categoriaResults.splice(index, 1);
            }
          });
          res.status(200).send(categoriaResults);
        });
      });
    });
  }
);

module.exports = router;
