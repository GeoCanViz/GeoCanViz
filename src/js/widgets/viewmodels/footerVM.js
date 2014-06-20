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
                    pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.png',
					configMouse = config.mousecoords,
					inwkid = config.northarrow.inwkid,
					outwkid = configMouse.outwkid;

				// images path
                _self.imgLogoPNG = pathGCVizPNG;

                // text
                _self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');
                _self.urlLogoAlt = i18n.getDict('%footer-tpgithub');
                _self.lblWest = i18n.getDict('%west');

				// coords and arrow
				_self.coords = ko.observable('');
				_self.rotateArrow = ko.observable('');

				_self.init = function() {
					var mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

					if (config.mousecoords) {
						mymap.on('mouse-move', function(evt) {
							_self.showCoordinates(evt);
						});
					}

					if (config.northarrow) {
						// set init state
						gisGeo.getNorthAngle(mymap.extent, inwkid, _self.updateArrow);

						mymap.on('pan-end', function(evt) {
                            _self.showNorthArrow(evt);
						});

						mymap.on('zoom-end', function(evt) {
                            _self.showNorthArrow(evt);
						});
					}

					return { controlsDescendantBindings: true };
				};

				_self.showCoordinates = function(evt) {
					gisGeo.projectPoints([evt.mapPoint], outwkid, _self.updateCoordinates);
				};

				_self.updateCoordinates = function(projectedPoints) {
					var strPointX, strPointY,
						point = projectedPoints[0];

					if (point.x < 0) {
						strPointX = (-1 * point.x.toFixed(3)).toString() + _self.lblWest;
					} else {
						strPointX = point.x.toFixed(3).toString() + 'E';
					}

					if (point.y < 0) {
						strPointY = (-1 * point.y.toFixed(3)).toString() + 'S';
					} else {
						strPointY = point.y.toFixed(3).toString() + 'N';
					}

					_self.coords(' Lat: ' + strPointY + ' Long: ' + strPointX);
				};

				_self.showNorthArrow = function(evt) {
					gisGeo.getNorthAngle(evt.extent, inwkid, _self.updateArrow);
				};

				_self.updateArrow = function(projectedPoints) {
					var dLon, lat1, lat2,
						x, y, pointB,
						bearing,
						pointA = { x: -100, y: 90 };

					pointB = projectedPoints[0];
					dLon = (pointB.x - pointA.x) * Math.PI / 180;
					lat1 = pointA.y * Math.PI / 180;
					lat2 = pointB.y * Math.PI / 180;
					y = Math.sin(dLon) * Math.cos(lat2);
					x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
					bearing = Math.atan2(y, x)  * 180 / Math.PI;
					bearing = ((bearing + 360) % 360).toFixed(1) - 90; //Converting -ve to +ve (0-360)

					_self.rotateArrow('rotate(' + bearing + 'deg)');
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
