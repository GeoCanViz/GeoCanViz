/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Footer view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['knockout',
			'gcviz-i18n',
			'gcviz-gisgeo'
	], function(ko, i18n, gisGeo) {
		var initialize,
			vm;
		
		initialize = function($mapElem, mapid, config) {
			
			// data model				
			var footerViewModel = function($mapElem, mapid, config) {
				var _self = this,
					pathNorth = locationPath + 'gcviz/images/footNorthArrow.png',
					configMouse = config.mousecoords,
					configNorth = config.northarrow.inwkid;

				// images path
				_self.imgNorth = pathNorth;
				
				// the map and control
				_self.mymap = vmArray[mapid].map.map;
				_self.coords = $mapElem.find('.gcviz-foot-coords')[0];
				_self.north = $mapElem.find('.gcviz-foot-north')[0];
				_self.inwkid = config.northarrow.inwkid;
				
				// geoprocessing and projection objects
				_self.outSR = gisGeo.getOutSR(configMouse.outwkid);
				_self.gsvc = gisGeo.getGSVC(configMouse.urlgeomserv);
				
				_self.init = function() {

					return { controlsDescendantBindings: true };
				};
				
				_self.showCoordinates = function(evt, div) {
					gisGeo.getCoord(evt.mapPoint, _self.coords, _self.outSR, _self.gsvc);
				};
				
				_self.showNorthArrow = function(evt, div, inwkid) {
					gisGeo.getNorthAngle(evt.extent, _self.north, _self.inwkid, _self.gsvc);
				};
				
				_self.init();
			};
			
			vm = new footerViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
