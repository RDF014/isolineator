angular.module('app')

.directive('topic', function() {
  return {
    controller: function() {
      this.clicked = function() {
        console.log('attempting search');
        // console.log('input', this.input);
        // this.service.searchLogs(this.input, (data) => { 
        //   console.log('input', this.input);
        //   this.result(data); 
        // });
      };
      
      
    },
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: 'templates/topic.html'
  };
});