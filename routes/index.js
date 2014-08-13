var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'SNX' });
});

router.post('/api/snxasm', function(req, res) {
  var spawn = require('child_process').spawn;
  var snxasm = spawn('/home/ishikuro/bin/snxasm', ['i']);
  var result = {
    success: false,
    error: '',
    hex: ''
  };

  console.log(req.body.asm);

  snxasm.stdin.write(req.body.asm + '\n');

  snxasm.stdout.on('data', function(data) {
    result.hex = data.toString();
  });
  snxasm.stderr.on('data', function(data) {
    result.error = data.toString();
  });

  snxasm.stdin.end();

  snxasm.on('close', function(code) {
    if (!result.err) {
      result.success = true;
    }
    console.log(result);
    res.send(result);
  });
});

module.exports = router;
