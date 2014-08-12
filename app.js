var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort('COM6', {
  baudrate: 9600,
  buffersize: 1
}, false);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//app.listen(3000);
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
// socket.io
console.log(io);
io.on('connection', function (socket) {
  // serialport
  serialPort.open(function() {
    console.log('SerialPort:open');
    serialPort.on('data', function(data) {
      var raw  = data[0].toString(2).split("").reverse().join("");
      var inst = data[0].toString(2).split("").splice(0,4);
      inst.unshift("0000");
      inst = inst.join("");
      var op;
      switch (inst) {
        case '00000000':
          op = 'ADD';
          break;
        case '00000001':
          op = 'AND';
          break;
        case '00000011':
          op = 'SLT';
          break;
        case '00000100':
          op = 'NOT';
          break;
        case '00000110':
          op = 'SR';
          break;
        case '00000111':
          op = 'HLT';
          break;
        case '00001000':
          op = 'LD';
          break;
        case '00001001':
          op = 'ST';
          break;
        case '00001010':
          op = 'LDA';
          break;
        case '00001011':
          op = 'AHI';
          break;
        case '00001110':
          op = 'BZ';
          break;
        case '00001111':
          op = 'BAL';
          break;
      }
      if (op) {
        io.sockets.emit('push_op', op);
        console.log('SerialPort:data received: ' + op);
      } else {
        console.log('SerialPort:data received: ' + raw);
      }
    });
  });

  /*
  var echos = setInterval(function () {
    var rand = Math.floor(Math.random() * 8);
    var op = "";
    if (rand == 0) {
      op = 'ADD';
    } else if (rand == 1) {
      op = 'LD';
    } else if (rand == 2) {
      op = 'NOT';
    } else if (rand == 4) {
      op = 'SLT';
    } else if (rand == 5) {
      op = 'SR';
    } else if (rand == 6) {
      op = 'SLT';
    } else if (rand == 7) {
      op = 'BAL';
    } else if (rand == 8) {
      op = 'LDA';
    }
    console.log('socket:data sending: ' + op);
    socket.emit('push_op', op);
  }, 100);
  */

  socket.on('push_op', function (op) {
    console.log('socket:data sending: ' + op);
  })
}),


server.listen(3000);

module.exports = app;

