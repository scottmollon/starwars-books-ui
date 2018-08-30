var app = angular.module("theSeries");

app.factory('userService', function(dbService) {
    var user = {
        admin: false //if user is in admin mode or not
    };
    
    //get users admin status
    user.getAdmin = function() {
        return user.admin;
    };
    
    //get if supplied key authorizes user for admin mode
    user.checkAdmin = function (key) {
        return dbService.auth(key).then(function(result) {
            user.admin = result;
        });
    };
    
    //rescind admin mode
    user.removeAdmin = function() {
        user.admin = false;
    };
    
    return user;
});