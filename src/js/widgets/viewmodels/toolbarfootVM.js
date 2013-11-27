/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar foot view model widget
 */
/* global mapArray: false, locationPath: false */
(function() {
	'use strict';
	define([
		'knockout',
		'gcviz-i18n',
		'gcviz-gisgeo'
	], function(ko, i18n, gisGeo) {
		var initialize,
			vm;
		
		initialize = function($mapElem, mapid, config) {
			
			// data model				
			var toolbarfootViewModel = function($mapElem, mapid, config) {
				var _self = this,
					pathNorth = locationPath + 'gcviz/images/footNorthArrow.png';

				// images path
				_self.imgNorth = pathNorth;
				
				_self.init = function() {
					var mymap = mapArray[mapid];

					if (config.mousecoords) {
						mymap.on('mouse-move', function(evt) {
							_self.showCoordinates(evt, 'mousecoord_' + mapid);
						});
					}
							
					if (config.northarrow) {
						mymap.on('pan-end', function(evt) {
							_self.showNorthArrow(evt, 'north_' + mapid);
						});
							
						mymap.on('zoom-end', function(evt) {
							_self.showNorthArrow(evt, 'north_' + mapid);
						});
					}

					return { controlsDescendantBindings: true };
				};
				
				_self.showCoordinates = function(evt, div) {
					gisGeo.getCoord(evt.mapPoint, div, config.mousecoords);
				};
				
				_self.showNorthArrow = function(evt, div) {
					gisGeo.getNorthAngle(evt.extent, div, config.northarrow);
				};
				
				_self.init();
			};
			vm = new toolbarfootViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
