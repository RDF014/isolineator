angular.module('app')
.controller('InterCtrl', function($scope) {
      console.log('inside interpreter scope : ', $scope);

      // this.clicked = function() {
      //   // console.log('attempting search');
      //   // console.log('input', this.input);
      //   if (this.input === undefined || this.input.length === 0) {
      //     this.service.getAll((data) => {
      //       this.logs = data;
      //     });
      //   } else {
      //     this.service.getFileByTopic(this.input, (data) => { 
      //       console.log('input', this.input);
      //       console.log('data from search', data);
      //       this.result(data.data); 
      //     });
      //   }
      // };
      
      
    },)
.directive('interpreter', function() {
  return {
    scope: {
      text: '<',
      translate: '<'
    },
    // controller: 
    controller: 'InterCtrl',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'templates/interpreter.html'
  };
});