angular.module('app')
.service('isolineatorService', function($http, $window) {

  this.getAll = function(callback) {
    $http.get('/log')
    .then(function({data}) {
      if(callback) {
        callback(data);
      }
    })
    .catch(function({err}) {
      console.log(err);
    });
  };

  this.getFileByTopic = function(query, callback) {

    console.log('this is queried');

    $http({
      method: 'POST',
      url: '/getFileByTopic', 
      // data: JSON.stringify(req)
      data: JSON.stringify({'query': query})
    })
    // $http.get('/log')
    .then(function(data) {
      console.log('success data:', data);
      if(callback) {
        callback(data);
      }
    })
    .catch(function(err) {
      console.log('error in searchLogs:', err);
    });
  };

  this.getFileById = function(id, callback) {
    
    console.log('getFilebyId called');

    $http({
      method: 'POST',
      url: '/getFileById',
      // data: JSON.stringify(req)
      data: JSON.stringify({'id': id}),
      responseType: 'arraybuffer'
    })
    // $http.get('/log')
    .then(function(response) {
      console.log('success data:', response);
      var audioContext = new AudioContext();
      console.log('response', response);
      audioContext.decodeAudioData(response.data, function(buffer) {
        mainBuffer = buffer;
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.loop = false;
        source.start(0);
        // source.onended(function() {
        //   audioContext.close();
        // });
        if (callback) {
          callback(response);
        }
        // audioContext.close();
      });
    })
    .catch(function(err) {
      console.log('error in getFileById:', err);
    });
  };

  this.postStream = function(callback) {

    $http({
      method: 'POST',
      url: '/testStream', 
      responseType: 'arraybuffer'
    })
    .then(function(response) {
      var audioContext = new AudioContext();
      console.log('response', response);
      audioContext.decodeAudioData(response.data, function(buffer) {
        mainBuffer = buffer;
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.loop = false;
        source.start(0);
      }, function(err) {
        console.log(err);
      });
    })
     .catch(function(err) {
       console.log('error in postRecording', err);
     });
  };

  this.stopStream = function(callback) {
    $http({
      method: 'POST',
      url: '/stopStream', 
    })
    .then(function(data) {
      console.log('voice streaming has stopped', data);
      // io.disconnect();
      if (callback) {
        callback(data);
      }
    })
     .catch(function(err) {
       console.log('error in stopStream', err);
     });
    };

  this.postRecording = function(topic, recording, date, callback) { 

    var formData = new FormData();
    formData.append('recording', recording, topic);

    console.log('get recording', formData.get('recording'));

    $http({
      method: 'POST',
      url: '/record', 
      data: formData,
      // contentType: 'multipart/form-data',
      contentType: false,
      transformRequest: angular.identity,
      processData: false,
      headers: {'Content-type': undefined}
    })
    .then(function(data) {
      // console.log('data from success:', data);
      if (callback) {
        callback(data);
      }
    })
     .catch(function(err) {
       console.log('error in postRecording', err);
     });
  };

  // CREATED NEW SERVICE TO ACCOMODATE NEW WORK AROUND

  this.transOnEnd = function(topic, recording, date, lang, callback) { 

    var formData = new FormData();
    formData.append('recording', recording, topic);
    formData.append('langCode', lang)

    console.log('get recording', formData.get('recording'));
    console.log('formdata in transOnEnd: ', formData);

    $http({
      method: 'POST',
      url: '/onEnd', 
      data: formData,
      responseType: 'arraybuffer',
      contentType: false,
      transformRequest: angular.identity,
      processData: false,
      headers: {'Content-type': undefined}
    })
    .then(function(response) {
      var audioContext = new AudioContext();
      console.log('response', response);
      audioContext.decodeAudioData(response.data, function(buffer) {
        mainBuffer = buffer;
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.loop = false;
        source.start(0);
      }, function(err) {
        console.log(err);
      });
    })
     .catch(function(err) {
       console.log('error in postRecording', err);
     });
  };

  this.getLang = (callback) => {
    $http.get('/getLang')
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

});