const mysql = require('mysql');
const mysqlConnection = mysql.createConnection({
    host: "localhost",
    port:"3026",
    user: "root",
    password: "",
    database: "bmsiot",
    multipleStatements: true,
});
mysqlConnection.connect((err) => {
    if (!err) {
        console.log("Connected");
    } else {
        console.log("Connection Failed");
    }
});
module.exports = mysqlConnection;