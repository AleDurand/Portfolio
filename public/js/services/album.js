angular.module('meanApp')
.factory('Album', ['$http', function AlbumFactory($http) {
    return {
        all : function() {
            return $http({method: 'GET', url: '/api/albums'});
        },
        get : function(id) {
            return $http({method: 'GET', url: '/api/albums/' + id});
        },
        create : function(album) {
            return $http({method: 'POST', url: '/api/albums', data: album});
        },
        delete : function(id) {
            return $http({method:'DELETE', url: '/api/albums/' + id});
        }
    };
}]);