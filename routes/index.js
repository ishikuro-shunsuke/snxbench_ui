var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'SNX' });
});

router.post('/api/snxasm', function(req, res) {
  var spawn = require('child_process').spawn;
  var snxasm = spawn('/home/ishikuro/bin/snxasm');
  var result = {
    success: false,
    error: '',
    hex: ''
  };

  snxasm.stdin.write(req.body.asm);

  snxasm.stdout.on('data', function(data) {
    result.hex = data.toString();
  });
  snxasm.stderr.on('data', function(data) {
    result.error = data.toString();
  });

  snxasm.stdin.end();

  snxasm.on('close', function(code) {
    console.log(result.hex.toString());
    if (!result.err) {
      result.success = true;
    }
    res.send(result);
  });
});

module.exports = router;
