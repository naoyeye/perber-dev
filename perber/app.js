
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// var postgres = require('./postgres');

var activity = require('./routes/activity');

// var redis = require('redis');
// var db = redis.createClient();

var config = require('./config');

// When the app starts
var Bookshelf  = require('bookshelf');
Bookshelf.PG = Bookshelf.initialize({
  client: 'pg',
  connection: config.postgresConfig
});

// // elsewhere, to use the client:
// var Bookshelf = require('bookshelf').PG;

// var Post = Bookshelf.Model.extend({
//   // ...
// });


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('perber_session_'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/activity', activity.activity);
app.get('/activities', activity.activities);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
