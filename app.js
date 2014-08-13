var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

if ((process.env.SNX_ENV !== 'standalone' &&
     process.env.SNX_ENV !== 'novisual') &&
    (!process.env.SNX_SERIAL_PORT ||
     !process.env.SNX_SERIAL_BAUDRATE)) {
  console.log("example: SNX_SERIAL_PORT=COM6 SNX_SERIAL_BAUDRATE=9600 node app.js");
  return;
}

if (process.env.SNX_ENV !== 'standalone' && process.env.SNX_ENV !== 'novisual') {
  var serialport = require('serialport');
  var SerialPort = serialport.SerialPort;
  var serialPort = new SerialPort(process.env.SNX_SERIAL_PORT, {
    baudrate: process.env.SNX_SERIAL_BAUDRATE,
    buffersize: 1
  }, false);
}

var routes = require('./routes/index');

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

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
// socket.io
io.on('connection', function (socket) {
  if (process.env.SNX_ENV === 'novisual') {
    // nop
  } else if (process.env.SNX_ENV === 'standalone') {
    console.log('*** demo mode ***');
    // demo mode
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
  } else {
    // using serial port
    serialPort.open(function() {
      console.log('SerialPort:open');
      serialPort.on('data', function(data) {
        //var raw  = data[0].toString(2).split("").reverse().join("");
        //var inst = data[0].toString(2).split("").splice(0,4);
        var inst = data[0].toString(2);
        var op;
        switch (inst) {
          case '00000000':
            op = 'ADD';
            break;
          case '00010000':
            op = 'AND';
            break;
          case '00110000':
            op = 'SLT';
            break;
          case '01000000':
            op = 'NOT';
            break;
          case '01100000':
            op = 'SR';
            break;
          case '01110000':
            op = 'HLT';
            break;
          case '10000000':
            op = 'LD';
            break;
          case '10010000':
            op = 'ST';
            break;
          case '10100000':
            op = 'LDA';
            break;
          case '10110000':
            op = 'AHI';
            break;
          case '11100000':
            op = 'BZ';
            break;
          case '11110000':
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
  }

  socket.on('push_op', function (op) {
    console.log('socket:data sending: ' + op);
  });
});

if (process.env.NODE_PORT) {
  server.listen(process.env.NODE_PORT);
} else {
  server.listen(3000);
}

module.exports = app;

