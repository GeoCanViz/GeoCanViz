/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['knockout',
			'gcviz-i18n',
			'gcviz-gisnavigation'
	], function(ko, i18n, gisNavigation) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid) {

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
					pathExtent = locationPath + 'gcviz/images/navFullExtent.png',
					mymap = vmArray[mapid].map.map,
					elem = document.getElementById(mymap.vIdName + '_holder');

				// images path
				_self.imgExtent = ko.observable(pathExtent);

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};

				_self.extentClick = function() {
					elem.focus();
					gisNavigation.zoomFullExtent(mymap);
					setTimeout(function() {
						elem.blur();
					}, 2000);
				};

				_self.init();
			};

			vm = new toolbarnavViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
