angular.module('app')
.directive('listItem', function() {
  return {
    scope: {
      log: '<',
      service: '='
    },
    restrict: 'E',
    controller: function() {
      this.clicked = function() {
        console.log('attempting to play recording');
        this.service.getFileById(this.log.id, (data) => {
          console.log('data');
        });
      };
    },
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/list-item.html'
  };
});