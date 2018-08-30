var app = angular.module("theSeries");

app.factory('dbService', function($http, $q) {
    var db = {};
    
    //get if the user is authorized for admin functions based on provided key
    db.auth = function(key) {
        var url = 'http://www.scottmollon.com/starwars/api/auth.php';
        
        var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }
        return $http.post(url, $.param({key: key}), config).then(function(response) {
            return response.data.admin;
        });
    };
    
    db.getKey = function(keyName) {
        var url = 'http://www.scottmollon.com/starwars/api/keys.php?name='+keyName;
        
        return $http.get(url).then(function(response) {
            return response.data.key;
        });
    };
    
    //get count of total pages for a timeline type
    db.getCount = function(type, pageSize) {
        var url = 'http://www.scottmollon.com/starwars/api/counts.php?type='+type+'&page='+pageSize;
        
        return $http.get(url).then(function(response) {
            return response.data;
        });
    };
    
    //get a page of items
    db.getPage = function(type, size, page) {
        var url = 'http://www.scottmollon.com/starwars/api/items.php?type='+type+'&size='+size+'&page='+page;
        
        return $http.get(url).then(function(response) {
            return response.data;
        });
    };
    
    //add an item to the db
    db.addItem = function(newItem) {
        var url = 'http://www.scottmollon.com/starwars/api/items.php';
        
        var config = {
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            }
        return $http.post(url, $.param(newItem), config).then(function(response) {
            return response.data;
        });
    };
    
    return db;
});