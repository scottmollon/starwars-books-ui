var app = angular.module('theSeries');

app.controller('adminController', function($scope, $routeParams, $location, userService) {
    
    //checks if good admin key
    userService.checkAdmin($routeParams.code).then(function() {
        $location.path('/');
    });
});