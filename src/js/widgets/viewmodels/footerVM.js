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
                    pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.svg',
					configMouse = config.mousecoords,
					configNorth = config.northarrow.inwkid;

				// images path
				_self.imgNorth = pathNorth;
                _self.imgLogoPNG = pathGCVizPNG;
                _self.urlLogo = 'https://github.com/GeoCanViz/GeoCanViz';
                _self.urlLogoAlt = i18n.getDict('%footGcvizTooltip');

				// geoprocessing and projection objects
				_self.outSR = gisGeo.getOutSR(configMouse.outwkid);
				_self.gsvc = gisGeo.getGSVC(config.urlgeomserv);

				_self.init = function() {
					var mymap = vmArray[mapid].map.map;

					if (config.mousecoords) {
						mymap.on('mouse-move', function(evt) {
							_self.showCoordinates(evt, 'mousecoord_' + mapid);
						});
					}

					if (config.northarrow) {
						mymap.on('pan-end', function(evt) {
							//_self.showNorthArrow(evt, 'north_' + mapid, configNorth);
                            _self.showNorthArrow(evt, 'imgarrow_' + mapid, configNorth);
						});

						mymap.on('zoom-end', function(evt) {
                            //_self.showNorthArrow(evt, 'north_' + mapid, configNorth);
                            _self.showNorthArrow(evt, 'imgarrow_' + mapid, configNorth);
						});
					}

					return { controlsDescendantBindings: true };
				};

				_self.showCoordinates = function(evt, div) {
					gisGeo.getCoord(evt.mapPoint, div, _self.outSR, _self.gsvc);
				};

				_self.showNorthArrow = function(evt, div, inwkid) {
					gisGeo.getNorthAngle(evt.extent, div, inwkid, _self.gsvc);
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
