angular.module('app')
.controller('LogCtrl', function($scope) {
      console.log('inside histlogctrl scope : ', $scope);
      
    },)
.directive('historylog', function() {
  return {
    scope: {
      service: '<',
      result: '=',
      logs: '<'
    },
    // controller: 
    controller: 'LogCtrl',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'templates/historylog.html'
    // template: '<h1>Hello</h1>'
  };
});