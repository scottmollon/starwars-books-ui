var app = angular.module('theSeries');

app.controller('viewItemModalController', function($scope, $uibModalInstance, item) {
    $scope.item = item;
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});