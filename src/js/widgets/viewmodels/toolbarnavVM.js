/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation view model widget
 */
/* global mapArray: false, locatioPath: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'gcviz-i18n',
		'gcviz-gisnavigation'
	], function($, ko, i18n, gisNavigation) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
					pathExtent = locationPath + '/dist/images/navFullExtent.png',
					mymap = mapArray[mapid][0];

				// images path
				_self.imgExtent = ko.observable(pathExtent);
				
				_self.errorHandler = function(error) {
					console.log('error toolbar annotation view model: ', error);
				};
		
				_self.init = function() {
					return { controlsDescendantBindings: true };
				};
				
				_self.extentClick = function() {
					gisNavigation.zoomFullExtent(mymap);
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
