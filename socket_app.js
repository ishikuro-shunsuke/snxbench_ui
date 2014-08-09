var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort('COM6', {
  baudrate: 9600,
  buffersize: 1
}, false);

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
    }
    res.writeHead(200);
    res.end(data);
  });
}


io.sockets.on('connection', function (socket) {
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
        socket.volatile.emit('push_op', op);
        console.log('SerialPort:data received: ' + op);
      } else {
        console.log('SerialPort:data received: ' + raw);
      }
    });
  });

  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});

