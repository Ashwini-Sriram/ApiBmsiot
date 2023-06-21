const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const router = express.Router();
const mysqlConnection = require("../connection");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//get all users
router.get('/', ensureToken, (req, res) => {
    let token = req.token;
    // mysqlConnection.query(`SELECT userId from usertokens where token = '${token}'`, (err, rows, fields) => {
    //     if (rows.length > 0) {
    mysqlConnection.query("SELECT userId, emailId, userName from userlogins", (err, rows, fields) => {
        if (!err) {
            res.json({
                data: rows
            });
        } else {
            res.send(err);
        }
    })
    // } else {
    //     res.sendStatus(403);
    // }
    // })
});
//get particular user
router.get('/:userId', (req, res) => {

    mysqlConnection.query(`SELECT * from userlogins where userId = ${req.params.userId}`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })
});
//add a user
router.post('/', (req, res, next) => {

    let userObj = req.body;
    userObj.password = getHashedPassword(userObj.password);
    mysqlConnection.query(`INSERT INTO userlogins (userName, emailId, password) VALUES ('${userObj.userName}','${userObj.emailId}','${userObj.password}') `, (err, rows, fields) => {
        if (!err) {
            // res.send(rows);
            console.log(rows.insertId);
            console.log(fields);
            res.status(201).json({
                message: 'User created successfully!'
            });
        } else {
            console.log(err);
        }
    })

});
router.post('/login', (req, res) => {
    let userObj = req.body;
    userObj.password = getHashedPassword(userObj.password);

    mysqlConnection.query(`SELECT userLevelTagId, userId, password from userlogins where emailId = '${userObj.emailId}'`, (err, rows, fields) => {
        if (rows.length > 0) {
            if (userObj.password == rows[0].password) {
                const generateAuthToken = crypto.randomBytes(30).toString('hex');
                let userId = rows[0].userId;
                mysqlConnection.query(`SELECT userId from usertokens where userId = '${userId}'`, (err, rows, fields) => {
                    if (!err) {
                        if (rows.length > 0) {
                            mysqlConnection.query(`UPDATE usertokens SET token = '${generateAuthToken}', expireDateTime = '${new Date()}' WHERE userId = '${userId}'`, (err, rows, fields) => {
                                if (!err) {
                                    res.send(generateAuthToken);
                                } else {
                                    res.send(err);
                                }
                            })
                        } else {
                            mysqlConnection.query(`INSERT INTO usertokens (userId, token, expireDateTime) VALUES ('${userId}','${generateAuthToken}','${new Date()}')`, (err, rows, fields) => {
                                if (!err) {
                                    res.send(generateAuthToken);
                                } else {
                                    res.send(err);
                                }
                            })
                        }
                    } else {
                        res.send(err);
                    }
                })
            } else {
                res.send("Password not correct");
            }

        } else {
            res.send("user not found");
        }
    })

});

//edit a user
router.put('/', (req, res) => {
    let userObj = req.body;
    userObj.password = getHashedPassword(userObj.password);
    mysqlConnection.query(`UPDATE userlogins SET userName = '${userObj.userName}', emailId = '${userObj.emailId}', password = '${userObj.password}' WHERE userId = '${userObj.userId}'`, (err, rows, fields) => {
        if (!err) {
            res.status(201).json({
                message: 'User updated successfully!'
            });
        } else {
            console.log(err);
        }
    })
});

// const generateAuthToken = crypto.randomBytes(30).toString('hex');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    //console.log(sha256.update("bmsce@123").digest('base64'));
    return hash;
};
function ensureToken(req, res, next) {
    const bearerheader = req.headers["authorization"];
    if (typeof bearerheader !== 'undefined') {
        const bearer = bearerheader.split(" ");
        const bearerToken = bearer[1];

        mysqlConnection.query(`SELECT token from usertokens where token = '${bearerToken}'`, (err, rows, fields) => {
            if (rows.length > 0) {
                req.token = bearerToken;
                next();
            } else {
                res.sendStatus(403);
            }
        })

    } else {
        res.sendStatus(403);
    }
    // mysqlConnection.query(`SELECT userId from usertokens where token = '${token}'`, (err, rows, fields) => {
    //     if (rows.length > 0) {
    //         return rows;
    //     } else {
    //         return false;
    //     }
    // })
}


module.exports = router;