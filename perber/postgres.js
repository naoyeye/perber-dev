
var config = require('./config');

// var pg = require("pg");

// var client = new pg.Client({
//         user: 'perber-user',
//         password: 'perber-password',
//         database: 'perber-data-test',
//         host: 'http://localhost:3000'
//     });

// client.connect(function(err) {
//     if(err) {
//         return console.error('could not connect to postgres', err);
//     }
// })


var pg = require('pg'); 

var conString = config.postgresConfig;

var client = new pg.Client(conString);

client.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);
    }
    
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }
        console.log(result.rows[0].theTime);
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
        client.end();
    });
});