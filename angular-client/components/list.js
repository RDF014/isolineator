angular.module('app')
.controller('listCtrl', function($scope) {
  console.log('inside list : scope: ', $scope);
})

.directive('list', function() {
  return {
    scope: {
      logs: '<',
      service: '<'
    },
    restrict: 'E',
    controller: 'listCtrl',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/list.html'
    // template:'<h1>Inside list</h1>'
  };
});