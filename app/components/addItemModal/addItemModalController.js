var app = angular.module('theSeries');

app.controller('addItemModalController', function($scope, $uibModalInstance, googleService) {
    $scope.types = ['book', 'era', 'movie'];
    $scope.selectedNewType = 'book';
    $scope.canons = ['canon', 'legends', 'both'];
    $scope.selectedNewCanon = 'canon';
    $scope.newTitle = '';
    $scope.newSubtitle = '';
    $scope.newBody = '';
    $scope.newImage = '';
    
    $scope.searchTitle = '';
    $scope.searchResults = [];
    $scope.googleid = '';
    
    $scope.search = function() {
        if ( $scope.searchTitle !== '')
        {
            googleService.searchVolumeByTitle($scope.searchTitle).then(function(results) {
                $scope.searchResults = results;
            });
        }
    };
    
    $scope.selectResult = function(index) {
        for (var i =0; i < $scope.searchResults.length; i++)
        {
            $scope.searchResults[i].selected = false;
        }
        
        $scope.searchResults[index].selected = true;
        $scope.googleid = $scope.searchResults[index].id;
    };
    
    $scope.add = function() {
        if (($scope.selectedNewType === 'book' && $scope.googleid !== '') || $scope.selectedNewType !== 'book')
            $uibModalInstance.close({'newtype':$scope.selectedNewType, 'newcanon':$scope.selectedNewCanon, 'newtitle':$scope.newTitle, 'newsubtitle': $scope.newSubtitle, 'newbody': $scope.newBody, 'newgoogleid': $scope.googleid});
    };
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});