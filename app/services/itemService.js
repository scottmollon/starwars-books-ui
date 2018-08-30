var app = angular.module("theSeries");

app.factory('itemService', function ($q, dbService, googleService) {
    var canonSettings = {
        timelineType: 'canon',  //default timelinetype
        nextPage: 0,            //first page of tiems
        totalPages: 0,          //total number of pages of items on the server
        pageSize: 10,            //number of items per page
        busy: false,             //whether the item service is busy or if it has gotten all items from the server
        firstload: false
    };
    var legendsSettings = {
        timelineType: 'legends',  //default timelinetype
        nextPage: 0,            //first page of tiems
        totalPages: 0,          //total number of pages of items on the server
        pageSize: 10,            //number of items per page
        busy: false,             //whether the item service is busy or if it has gotten all items from the server
        firstload: false
    };
    var itemList = {
        settings: legendsSettings
    };
    var tempItemList = null;
    
    //format information for the timelineItem
    var eraFormats = {'itemStyle': '', 'panelStyle': 'era-panel', 'badge': 'eraBadge', 'icon': ''};
    var movieFormats = {'itemStyle': '', 'panelStyle': 'movie-panel', 'badge': 'movieBadge', 'icon': 'fa-ticket'};
    var bookFormats = {'itemStyle': 'book-item', 'panelStyle': 'book', 'badge': 'bookBadge', 'icon': 'fa-book'};
    
    //construct an item that can be consumed by the UI
    var constructItem = function(originalItem) {
        //add format information for the timeline items
        //if a book with an id get the info for it from google books
        var deferred = $q.defer();
        
        var promises = [];
        
        if (originalItem.type === 'book')
        {
            originalItem.formats = bookFormats;
            if (originalItem.googleid !== '')
            {
                promises.push(googleService.getVolume(originalItem.googleid).then(function(volume) {
                   originalItem.image= (volume.imageLinks.medium ? volume.imageLinks.medium : 
                           volume.imageLinks.thumbnail ? volume.imageLinks.thumbnail : 'assets/img/no_book_cover.jpg');
                   originalItem.title=volume.title;
                   originalItem.body=volume.description;
                   originalItem.author=volume.authors.join(', ');
                   originalItem.link=(volume.canonicalVolumeLink ? volume.canonicalVolumeLink : null);
                }));
            }
        }
        else if (originalItem.type === 'era')
            originalItem.formats = eraFormats;
        else
            originalItem.formats = movieFormats;
        
        $q.all(promises).then(function() {
            deferred.resolve(originalItem);
        });
        
        return deferred.promise;
    };
    
    //whether to get more items
    //disabled if currently retrieving items or if all items have been retrieved
    itemList.disable = function() {
        return itemList.settings.busy || (itemList.settings.nextPage === itemList.settings.totalPages);
    };
    
    //switch the timeline types beign displayed
    itemList.switchTimeline = function(timelineType) {
        var deferred = $q.defer();
       
        if (itemList.settings.timelineType === "canon")
            itemList.settings = legendsSettings;
        else
            itemList.settings = canonSettings;

        if (itemList.settings.firstload === false)
        {
            dbService.getCount(itemList.settings.timelineType, itemList.settings.pageSize).then(function(count){
                itemList.settings.totalPages = count.pages;

                itemList.getItems().then(function(items) {
                    itemList.settings.firstload = true;
                    deferred.resolve(items);
                });
            });
        }

        return deferred.promise;
    };
    
    //get and construct the next page of items
    itemList.getItems = function() {
        itemList.settings.busy = true;
        
        var deferred = $q.defer();

        dbService.getPage(itemList.settings.timelineType, itemList.settings.pageSize, itemList.settings.nextPage).then(function(response) {
            //processing response from server
            
            //var list = [];
            var promises = [];
            
            var list = response.list;
            for (var j = 0; j < list.length; j++)
            {   
                (function (savedIndex) {                  
                    promises.push(constructItem(list[savedIndex]));
                })(j);
            }

            //wait for all http calls to finish and return before return the array of items
            $q.all(promises).then(function() {
                itemList.settings.nextPage = response.nextpage;
                itemList.settings.busy = false;
                deferred.resolve(list);
            });
        });

        return deferred.promise;
    };
    
    //add an item to the list
    itemList.addItem = function(newItem) {
         var deferred = $q.defer();
         
         newItem.nextPage = itemList.settings.nextPage;
         newItem.size = itemList.settings.pageSize;
         
        //add item on server
        dbService.addItem(newItem).then(function(result) {
            itemList.settings.totalPages = result.totalPages;
            
            //return new item and whether to dropLast
            constructItem(result.newItem).then(function(constItem) {
                result.constructedItem = constItem;
                deferred.resolve(result);
            });
        });      
        return deferred.promise;
    };
    
    return itemList;
});