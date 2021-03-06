'use strict';

angular.module('SliderModule')
	.directive('slider',['$timeout','$rootScope', function ($timeout, $rootScope) {
	  return {
	    restrict: 'E',
		controller: "SliderController",
	    link: function (scope, elem, attrs) {
    		$('#layerslider').layerSlider({
				skinsPath : 'libraries/layerslider/skins/',
				skin : 'fullwidthdark',
				thumbnailNavigation : 'enabled',
				imgPreload : true,
				showCircleTimer : true,
				showBarTimer : false,
	    		touchNav : true,
				navStartStop : true,
				navButtons : true,
				animateFirstLayer : true,
				responsive : true,
				responsiveUnder : 1226,
				sublayerContainer: 1226
			});
	    },
		templateUrl:'modules/slider/views/index.html'
	  }
	}
	]);