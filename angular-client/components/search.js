angular.module('app')

.directive('search', function() {
  return {
    scope: {
      result: '=',
      service: '<',
      logs: '='
    },
    controller: function($scope) {
      console.log('inside controller: search: ', $scope);
      this.clicked = function() {
        console.log('attempting search');
        // console.log('input', this.input);
        if (this.input === undefined || this.input.length === 0) {
          this.service.getAll((data) => {
            this.logs = data;
          });
        } else {
          this.service.getFileByTopic(this.input, (data) => { 
            console.log('input', this.input);
            console.log('data from search', data);
            this.result(data.data); 
          });
        }
      };
      
      
    },
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'templates/search.html'
  };
});