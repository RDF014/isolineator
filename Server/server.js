var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var fs = require('fs');
const Stream = require('stream');
var record = require('node-record-lpcm16');
var request = require('request');
var multer = require('multer');
var dbconn = require('../mongo-db/config.js');
var inputs = require('../mongo-db/inputs.js');
var Speech = require('../Server/speechToText.js');
var t2s = require('../Server/textToSpeech.js');
const {Translater, listLanguages} = require('./TextTranslateApi.js');

var io = require ('socket.io')(server);

io.on('connection', (socket) => {
 console.log('io connected');
});

io.on('disconnect', (socket) => {
 console.log('io is disconnected');
});


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
   var date = new Date().toISOString();
   cb(null, file.fieldname + '-' + date + '.wav');
 }
});

var upload = multer({ storage: storage });

var port = process.env.PORT || 5000;

//should this not be get ?
app.get('/log', function(req, res) {
  inputs.returnAllRecords(function(arrOfRecords) {
    console.log('inside callback of log');
    res.status(201).json(arrOfRecords);
  });
});

app.post('/getFileByTopic', function(req, res) {
  // get id from req
  //(id, metadata, callback)
  console.log('topic req body query', req.body.query);
  //Apurva uses req.query.topic as parameter
  inputs.getRecordByTopic(req.body.query, (arrOfRecords) => {
    res.status(201).json(arrOfRecords);
  });
});

app.post('/getFileById', function(req, res) {
  inputs.getRecordById(req.body.id, (readstream) => {
    readstream.pipe(res);
  });
});

app.post('/record', upload.single('recording'), function(req, res) {

  // console.log('post handled: request file', req.file);

  Speech.syncAudio(`./${req.file.path}`, (data)=>{
    console.log('data inside syncAudio', data);
    // (audFilePath, transcribedData, topic, metaData, callBack)
    // we can accomodate search tags in the future
    inputs.saveInputFile(`./${req.file.path}`, data, req.file.originalname, {}, (file) => {
      // inputs.consoleLogAllDataBase();
    });
    
  });
  res.status(201).end();
});

// CREATED NEW ROUTE TO ACCOMODATE NEW WORK AROUND

app.post('/onEnd', upload.single('recording'), function(req, res) {
  let langCode = req.body.langCode;
  console.log('lang code in req: ', req.body.langCode);
  console.log('type of lang code: ', typeof req.body.langCode);
  if (req.body.langCode === 'undefined') {
    langCode = 'es';
  }
  console.log('post handled: request file', req.file);

  Speech.syncAudio(`./${req.file.path}`, (text)=>{
    console.log('data inside syncAudio : on end langcode: ', langCode);
    
    Translater(text, langCode, (translate) => {
      io.emit('transcription', text, translate);
      console.log('Translater in on end: translate: ', translate);
      

      //Apurva's function goes here
      t2s.getSpeechStreamFromChunks(translate, (err, data) => { //translate should be equal to the final translated text
        if (err) {
          console.log(err.code)
        } else if (data) {
          console.log('inside data of getSpeechStreamFromChunks');
          if (data.AudioStream instanceof Buffer) {
            // Initiate the source
            var bufferStream = new Stream.PassThrough();
            // convert AudioStream into a readable stream
            bufferStream.end(data.AudioStream);
            // Pipe into Player
            bufferStream.pipe(res);
            bufferStream.on('end', () => {
              res.status(201).end();
            });
          }
        }
      });
    });
  });
});



app.post('/stopStream', function (req, res) {
 record.stop();
 io.on('remove', function() {
   // io.disconnect();
   console.log('socket should be disconnected');
 });
 res.status(201).end();
});

// Creates a file first, THEN transcribes the audio from the file
// RETURNS the transcribed text string.
// first audio create wave file, then transcribes
app.post('/testCreate', (req, res) => {
 record.start({
   sampleRate: 44100,
   threshold: 0.5,
   verbose: true
 })
 .pipe(Speech.createAndStream('./Server/audio/test.wav', (data) => {
   if(data.endpointerType === 'ENDPOINTER_EVENT_UNSPECIFIED') {
     res.status(201).end(data.results[0].transcript);
   }
 }));
});


// Creates a direct data stream from the user's microphone into the Speech-to-text API
// RETURNS the transcribed text string when the user is done talking
app.post('/testStream', function(req, res) {
  // res.status(201).send();

  var transcribeText = '';

  record.start({
    sampleRate: 16000,
    threshold: 0
    // verbose: true
  })
  .pipe(Speech.liveStreamAudio((data) => {
    console.log(data);
   
    if(Array.isArray(data.results) && data.results[0] !== undefined && data.results[0] !== '') {
      Translater(data.results[0].transcript, 'es', (translate) =>{
        io.emit('transcription', data, translate);
        // console.log(data); 
      })
    }else if(typeof data.results === 'string'){
      Translater(data.results, 'es', (translate) =>{
        io.emit('transcription', data, translate);
      })
    }
   
    if(Array.isArray(data.results) && data.results.length > 0 && data.results[0].isFinal) {
      transcribeText += data.results[0].transcript;
    } else if (typeof data.results === 'string' && data.results.length > 0) {
      transcribeText = data.results
    }
  })
  .on('end', () => {
    console.log('This is the end of transcribing');

    //Apurva's text to voice
    Translater(transcribeText, 'es', (translate) => {
      io.emit('transcription', transcribeText, translate);

      //Apurva's function goes here
      t2s.getSpeechStreamFromChunks(translate, (err, data) => { //translate should be equal to the final translated text
        if (err) {
          console.log(err.code)
        } else if (data) {
          console.log('inside data of getSpeechStreamFromChunks');
          if (data.AudioStream instanceof Buffer) {
            // Initiate the source
            var bufferStream = new Stream.PassThrough();
            // convert AudioStream into a readable stream
            bufferStream.end(data.AudioStream);
            // Pipe into Player
            bufferStream.pipe(res);
            bufferStream.on('end', () => {
              res.status(201).end();
            });
          }
        }
      });
    });
  })
  .on('error',function() {
    console.log('this is the big error', arguments);
  })

  );
});


// Transcribes a local audio file that already exisits
// RETURN the transcribed text string when done
app.post('/testFile', function(req, res) {
  Speech.syncAudio('./uploads/recording-2017-03-24T20:59:40.825Z.wav',(data)=>{
    console.log(data);
    res.status(201).send(data);
    // if(data.endpointerType === 'ENDPOINTER_EVENT_UNSPECIFIED') {
    //   res.status(201).send(data.results[0].transcript);
    // }
  });
});


// Mike's translation code
app.post('/txtTranslate', function(req, res) {
  console.log(Translater(req.body.textTranslate, 'es'));
})

app.get('/getLang', (req, res) => {
  listLanguages((lang) => {
    res.status(200).send(lang)
  })
})


server.listen(port, function () {
 console.log('server listening to', port);
});