/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Footer view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gisgeo'
	], function(ko, i18n, gcvizFunc, gisGeo) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var footerViewModel = function($mapElem, mapid, config) {
				var _self = this,
					pathNorth = locationPath + 'gcviz/images/footNorthArrowGrey.png',
                    pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.png',
					configMouse = config.mousecoords,
					configNorth = config.northarrow.inwkid;

				// images path
				_self.imgNorth = pathNorth;
                _self.imgLogoPNG = pathGCVizPNG;
                _self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');
                _self.urlLogoAlt = i18n.getDict('%footer-tpgithub');
                _self.lblWest = i18n.getDict('%west');

				// Tooltips
				_self.tpNorth = i18n.getDict('%footer-tpNorth');

				// projection objects
				_self.outSR = gisGeo.getOutSR(configMouse.outwkid);

				_self.init = function() {
					var mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

					if (config.mousecoords) {
						mymap.on('mouse-move', function(evt) {
							_self.showCoordinates(evt, 'mousecoord_' + mapid);
						});
					}

					if (config.northarrow) {
						mymap.on('pan-end', function(evt) {
                            _self.showNorthArrow(evt, 'imgarrow_' + mapid, configNorth);
						});

						mymap.on('zoom-end', function(evt) {
                            _self.showNorthArrow(evt, 'imgarrow_' + mapid, configNorth);
						});
					}

					return { controlsDescendantBindings: true };
				};

				_self.showCoordinates = function(evt, div) {
					gisGeo.getCoord(evt.mapPoint, div, _self.outSR, _self.lblWest);
				};

				_self.showNorthArrow = function(evt, div, inwkid) {
					gisGeo.getNorthAngle(evt.extent, div, inwkid);
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
