var app = angular.module('theSeries');

//directive for timelineItems
app.directive('timelineItem', function() {
    return {
        restrict: 'E',
        scope: {item: '=itemData'},
        templateUrl: 'app/components/timeline/timelineItem.html'
    };
});

//directive for checklistItems
app.directive('tableItem', function() {
    return {
        restrict: 'EA',
        scope: {item: '=tableItem'},
        templateUrl: 'app/components/timeline/tableItem.html'
    };
});

app.controller('timelineController', function($scope, $location, $uibModal, userService, itemService) {
    $scope.timelineTitle = 'Star Wars Novel Timelines';
    $scope.viewType = 'timeline';
    $scope.timelineType = 'canon';  //default selection is canon
    
    $scope.isAdmin = userService.getAdmin();
    $scope.releaseAdmin = function() {
        $location.path('/admin/clear');
    };
    
    //timeline items list
    $scope.timelineItems = [];
    $scope.otherTimelineItems = [];
    $scope.tempItems = [];
    
    //access to itemService status
    //disabled if the service is busy or if all items have been retrieved from server
    $scope.itemServiceDisable = function() {
        return itemService.disable();
    };
    
    //when the timeline radio button changes switch the timeline items
    $scope.$watch('timelineType', function(timelineType) {
        $scope.tempItems = $scope.otherTimelineItems;
        $scope.otherTimelineItems = $scope.timelineItems;
        $scope.timelineItems = $scope.tempItems;
        
        itemService.switchTimeline(timelineType).then(function(newList){
            if (newList.length > 0)
                $scope.timelineItems = newList;
        });
    });
    
    //get more items for the timeline
    //used by infinite-scroll
    $scope.getItems = function() {
        itemService.getItems().then(function(newList){
            $scope.timelineItems = $scope.timelineItems.concat(newList);
        });
    };
    
    //display a modal with the book info
    $scope.viewItem = function(item) {
        console.log(item);
        var modalInstance = $uibModal.open({
            templateUrl: 'app/components/viewItemModal/viewItemModal.html',
            controller: 'viewItemModalController',
            resolve: {
                item: item
            }
        });        
    };
    
    //add an item to the timeline - DOES NOT WORK NOW
    $scope.addItem = function(index, where) {
        //calculate new place for the item
        var newPlace,
            nextPlace;
    
        if (where === 'below' && index === ($scope.timelineItems.length - 1))
            nextPlace = parseFloat($scope.timelineItems[index].place) + 100;
        else if (where === 'below')
            nextPlace = parseFloat($scope.timelineItems[index+1].place);
        else if (where === 'above' && index === 0)
            nextPlace = 0;
        else
            nextPlace = parseFloat($scope.timelineItems[index-1].place);
        
        newPlace = (parseFloat($scope.timelineItems[index].place) + nextPlace) / 2;
        
        var modalInstance = $uibModal.open({
            templateUrl: 'app/components/addItemModal/addItemModal.html',
            controller: 'addItemModalController'
        });
      
        modalInstance.result.then(function (newItem) {
            console.log("type: "+ newItem.newtype);
            console.log("canon: "+ newItem.newcanon);
            console.log("title: "+ newItem.newtitle);
            console.log("subtitle: "+ newItem.newsubtitle);
            console.log("body: "+ newItem.newbody);
            console.log("googleid: "+ newItem.newgoogleid);
            newItem.newplace = newPlace;
            
            //send new item to itemService
            itemService.addItem(newItem).then(function(result) {
                //then add the newItem to the timelineItems in the right place
                $scope.timelineItems.splice(index+1, 0, result.constructedItem);
                console.log($scope.timelineItems);
                    //then if dropNext remove last item in list
                    if (result.dropLast)
                        $scope.timelineItems.pop();
            });
            
        });
    };
});