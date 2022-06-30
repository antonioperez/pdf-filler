const csv = require("fast-csv");
const fs = require("fs");
const path = require('path');

function readPath(pathRoute) {
  return path.normalize(pathRoute);
}

module.exports = {
  readCSVFile
}

function readCSVFile(filename) {
  return new Promise(function(resolve, reject) {
    var result = [];
    fs.createReadStream(readPath(filename))
      .pipe(csv.parse({ headers: true }))
      .on("data", function(data) {
        result.push(data);
      })
      .on("end", function() {
        resolve(result);
      });
  });
}