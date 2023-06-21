const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const axios=require('axios')
const router = express.Router();
const mysqlConnection = require("../connection");
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



router.get('/currentstatus', ensureToken,(req, res) => {


    mysqlConnection.query("SELECT status from switch where id = 0", (err, rows, fields) => {
        if (!err) {
            res.json({
                data: rows
            });
        } else {
            res.send(err);
        }
    })

});


router.post('/currentstatus', ensureToken, (req, res) => {

    let switchdata = req.body;
    let status=switchdata.status;
    //console.log(req.body);
    //update switch table
    let sqlQuerry = "";
    
        sqlQuerry = `UPDATE switch SET status = '${switchdata.status}' WHERE id = '0'`
   
    mysqlConnection.query(sqlQuerry, (err, rows, fields) => {
        if (!err) {
            //res.sendStatus(201);
        } else {
            res.send(err);
        }
    })
    //select userid
 
    const bearerheader = req.headers["authorization"];
    const bearer = bearerheader.split(" ");
    const bearerToken = bearer[1];
    var userId="";

        mysqlConnection.query(`SELECT userId from usertokens where token = '${bearerToken}'`, (err, rows, fields) => {
            if (!err) {
                console.log(rows);
                console.log(rows[0].userId);
                userId=rows[0].userId;
                //console.log(`hello this is the user id ${userId}`)
                insertIntoUSer(userId)
            } else {
               console.log(err);
            }
        })

    //insert into user_actions table 
    function insertIntoUSer(userId){
   
    sqlQuerry = `INSERT INTO user_actions(userId,switchaction) VALUES ('${userId}','${switchdata.status}')`
   
    mysqlConnection.query(sqlQuerry, (err, rows, fields) => {
        if (!err) {
            res.sendStatus(201);
        } else {
            res.send(err);
        }
    })

    }
   //calling the ubidots api
   const options = {
            method: 'POST',
            url: 'https://industrial.api.ubidots.com/api/v1.6/variables/639179fb72ec12000c900fb2/values/',
            headers: {
                'content-type': 'application/json',
                'X-Auth-Token': 'BBFF-LtAIEbHEpPlRavdXFOC9Nu8SRnTN9y'
            },
            data: { value:status }
        };

        // console.log("turn off");
        axios.request(options).then(function (response) {
            console.log(response.data);
           
        }).catch(function (error) {
            console.error(error);
        });
   

});


function ensureToken(req, res, next) {
    const bearerheader = req.headers["authorization"];
   // console.log(bearerheader);
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

}


module.exports = router;