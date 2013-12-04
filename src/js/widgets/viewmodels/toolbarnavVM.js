/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery',
			'knockout',
			'gcviz-i18n',
			'gcviz-gisnavigation'
	], function($, ko, i18n, gisNavigation) {
		var initialize;
		
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
			ko.applyBindings(new toolbarnavViewModel($mapElem, mapid), $mapElem[0]); // This makes Knockout get to work
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
