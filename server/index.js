const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const helmet = require("helmet");

const users = require("./routes/users");
const api = require("./routes/api");

const app = express();
// app.use(helmet());

var corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/users", users);
app.use("/api", api);


module.exports = app

app.listen(5000, () =>{
    console.log("server is running on port 5000" );
});