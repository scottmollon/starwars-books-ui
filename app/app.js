/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var app = angular.module('theSeries', ['ngRoute', 'ngSanitize', 'infinite-scroll', 'ui.bootstrap','ngNotify']);

//app routes
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl : 'app/components/timeline/timeline.html',
            controller : 'timelineController'
        })
        .when('/admin/:code', {
            templateUrl : 'app/components/admin/admin.html',
            controller: 'adminController'
        });
});
