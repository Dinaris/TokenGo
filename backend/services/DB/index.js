var mysql = require("mysql");
var config = require("../../config.json");

var connection;

function getInstance() {
  connection = mysql.createConnection(config.DB);

  console.log("Connecting to DB...");
  connection.connect();

  return connection;
}

function closeConnection(instance) {
  instance.end();
  console.log("Close DB connection...");
}

function getHistory(email) {
  return new Promise(async (resolve, reject) => {
    connection = getInstance();

    const query = `SELECT
        location.id,
        CASE
            WHEN COUNT(his.id) > 0 THEN 1
            ELSE 0
        END AS visited,
        CASE
            WHEN (SELECT h.email FROM history h WHERE h.location_id = location.id ORDER BY h.createdAt LIMIT 1) = ? THEN 1
            ELSE 0
        END AS isOG
    FROM
        locations location
    LEFT JOIN
        history his
        ON location.id = his.location_id AND his.email = ?
    GROUP BY
        location.id;`;

    connection.query(query, [email, email], function (error, results, fields) {
      if (error) reject(error);
      resolve(results ? results : []);
    });

    closeConnection(connection);
  });
}

module.exports = {
  getHistory,
};