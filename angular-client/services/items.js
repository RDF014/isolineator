angular.module('app')
.service('isolineatorService', function($http, $window) {

  this.getAll = function(callback) {
    $http.get('/logs')
    .then(function({data}) {
      if(callback) {
        callback(data);
      }
    })
    .catch(function({err}) {
      console.log(err);
    });
  };

  this.searchLogs = function(query, callback) {
    var req = {};
    req.query = query;

    $http({
      method: 'POST',
      url: '/log', 
      data: JSON.stringify(req)
    })
    // $http.get('/log')
    .then(function(data) {
      console.log('success');
      if(callback) {
        callback(data);
      }
    })
    .catch(function(err) {
      console.log('error in searchLogs:', err);
    });
  };

  this.postRecording = function(filename, recording, date, callback) { 
    // var req = {};
    // req.filename = filename;
    // req.recording = recording;
    // req.date = date;
    // console.log('attempt to post from items...');
    // console.log('req before post', req);
    // console.log('stringified Request', JSON.stringify(req));

    // $http({
    //   method: 'POST',
    //   url: '/record', 
    //   data: req
    // })
    // .then(function(data) {
    //   console.log('posted in original postrecording');
    //   if (callback) {
    //     callback(data);
    //   }
    // })
    //  .catch(function(err) {
    //    console.log('error in postRecording', err);
    //  });

    var formData = new FormData();
    formData.append('recording', recording, filename);

    console.log('get recording', formData.get('recording'));

    console.log('Form data:', formData);

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
      console.log('data from success:', data);
      if (callback) {
        callback(data);
      }
    })
     .catch(function(err) {
       console.log('error in postRecording', err);
     });

   //  $http.post('/record', formData, {
   //    transformRequest: angular.identity,
   //    headers: {'Content-type': undefined}
   //  })
   //  .success(function(data) {
   //    console.log('data from success:', data);
   //    // console.log('data.config.data.get(recording)', data.config.data.get('recording').name);
   //    if (callback) {
   //      callback(data);
   //    }
   //  })
   // .error(function(err) {
   //   console.log('error in postRecording', err);
   // });


  };

});