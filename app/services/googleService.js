
var app = angular.module("theSeries");

app.factory('googleService', function($http, $q, dbService, ngNotify) {
    var google = {
        key: null
    };
    
    var checkKey = function() {
        var deferred = $q.defer();
        
        if (google.key === null)
        {
            dbService.getKey('google').then(function(key) {
                google.key = key;
                deferred.resolve(google.key);
            });
        }
        else
            deferred.resolve(google.key);
        
        return deferred.promise;
    };
    
    //search for a book
    //default paging from google books api is 10 results
    //does not require the api key
    google.searchVolumeByTitle = function(title) {
        var url = 'https://www.googleapis.com/books/v1/volumes?q=intitle:'+title+'&fields=items(id,volumeInfo(title, authors))';
        //
        return $http.get(url).then(function(response) {
            return response.data.items;
        }, function(response) {
            ngNotify.set('Error Searching Google Books', 'error');
        });
    };
    
    //get a specific volume (book)
    google.getVolume = function(id) {
        var deferred = $q.defer();
        
        checkKey().then(function() {
            var url = 'https://www.googleapis.com/books/v1/volumes/'+id+'?fields=volumeInfo(authors,title,publishedDate,description,averageRating,ratingsCount,imageLinks,canonicalVolumeLink)&key='+google.key;
        
            return $http.get(url).then(function(response) {
                deferred.resolve(response.data.volumeInfo);
            }, function(response) {
                ngNotify.set('Google error: ' + response.data.error.message, 'error');
                deferred.reject('Error getting book info from google');
            });
        });
        
        return deferred.promise;
    };
    
    return google;
});