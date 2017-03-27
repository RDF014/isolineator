angular.module('app')
.controller('AppCtrl', function($scope, isolineatorService) {

  var socket = io.connect();

  isolineatorService.getAll((data) => {
    console.log('data', data);
    this.logs = data;
  });

  socket.on('transcription', (data, trans) => {
    // if (Array.isArray(data.results) && data.results[0].transcript !== undefined) {
    //   console.log(data.results[0].isFinal);
    //   this.text = data.results[0].transcript;
    //   this.translate = trans;
    // } else {
      this.text = data;
      this.translate = trans;
    // }
  });

  console.log('logs', this.logs);

  this.recording = false;
  this.record = () => {
    this.recording = !this.recording;
  }

  this.service = isolineatorService;
  this.searchResults = (data) => {
    this.logs = data;
  }

  this.histclicked = () => {
    console.log('inside histclicked');
    this.service.getAll((data) => {
    console.log('data', data);
    this.logs = data;
  });
  }

})

.directive('app', function() {
  return {
    scope: {},
    restrict: 'E',
    controller: 'AppCtrl',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'templates/app2.html'
  }

})


