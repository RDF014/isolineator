angular.module('app', ['angularAudioRecorder'])
    .controller('DemoController', function ($scope, $timeout) {
      console.log('Loaded');
      $scope.timeLimit = 100;


    }).config(function (recorderServiceProvider) {
      recorderServiceProvider
      .forceSwf(false)
      //.setSwfUrl('/lib/recorder.swf')
      .withMp3Conversion(false)
    ;
    });