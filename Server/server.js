var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var record = require('node-record-lpcm16');
var request = require('request');
var multer = require('multer');
// var upload = multer({ dest: 'uploads/' });
// var upload = multer();
var db = require('../mongo-db/config.js');
var inputs = require('../mongo-db/inputs.js');
var Speech = require('../Server/speechToText.js');

var app = express();


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.wav');
  }
});

var upload = multer({ storage: storage });

app.use(express.static(__dirname + '/../angular-client'));
app.use(express.static(__dirname + '/../node_modules'));



// app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json({
  extended: true
}));


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.wav');
  }
});

var upload = multer({ storage: storage });

var port = process.env.PORT || 5000;

app.post('/log', function(req, res) {
  console.log('req.body.query', req.body.query);
  res.status(201).end();
});

app.post('/record', upload.single('recording'), function(req, res) {
  console.log('post handled: request file', req.file);
  console.log('post handled: request body', req.body);
  // console.log('response', res);
  res.status(201).end();
});


// Creates a file first, THEN transcribes the audio from the file
// RETURNS the transcribed text string.
app.post('/testCreate', (req, res) => {
  record.start({
    sampleRate: 44100,
    threshold: 0.5,
    verbose: true
  })
  .pipe(Speech.createAndStream('./Server/audio/test.wav', (data) => {
    if(data.endpointerType === 'ENDPOINTER_EVENT_UNSPECIFIED') {
      res.status(201).send(data.results[0].transcript);
    }
  }));
});


// Creates a direct data stream from the user's microphone into the Speech-to-text API
// RETURNS the transcribed text string when the user is done talking
app.post('/testStream', function(req, res) {
  record.start({
    sampleRate: 44100,
    threshold: 0.5,
    verbose: true
  })
  .pipe(Speech.liveStreamAudio((data) => {
    console.log(data)
    if(data.endpointerType === 'ENDPOINTER_EVENT_UNSPECIFIED') {
      res.status(201).send(data.results[0].transcript);
    }
  }));
});


// Transcribes a local audio file that already exisits
// RETURN the transcribed text string when done 
app.post('/testFile', function(req, res) {
  Speech.streamFile('./Server/audio/test.wav', (data)=>{
    console.log(data.results);
    if(data.endpointerType === 'ENDPOINTER_EVENT_UNSPECIFIED') {
      res.status(201).send(data.results[0].transcript);
    }
  });
});

app.listen(port, function() {
  console.log('In space no one can hear you scream', port);
});