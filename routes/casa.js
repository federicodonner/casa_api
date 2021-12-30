// Route file for getting casa information
var express = require("express");
var router = express.Router();
var db = require("../config/db");
const { check, escape } = require("express-validator");
var messages = require("../data/messages");

// Returns casa by hash
router.get("/hash/:casaHash", [check("casaHash").escape()], (req, res) => {
  var casaHash = req.params.casaHash;
  let sql = "SELECT * FROM casa WHERE hash = '" + casaHash + "'";
  let query = db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    // Verify that there is at least one casa with that hash
    if (results.length == 0) {
      // If there are no casas with that hash, return error
      return res.status(404).send(messages.CASA_NOT_FOUND);
    }
    // Strips the casa id from the result
    delete results[0].id;
    // Sends the results back
    res.send(results[0]);
  });
});

module.exports = router;
