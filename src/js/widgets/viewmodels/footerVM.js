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
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gisgeo',
			'gcviz-gisnav'
	], function($viz, ko, i18n, gcvizFunc, gisGeo, gisNav) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var footerViewModel = function($mapElem, mapid, config) {
				var _self = this, coordEvt,
					pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.png',
					configMouse = config.mousecoords,
					configNorth = config.northarrow,
					scalebar = config.scalebar,
					inwkid = configNorth.inwkid,
					outwkid = configMouse.outwkid,
					$section = $viz('#section' + mapid),
					heightData = 659; // height of datatable when open

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// images path
				_self.imgLogoPNG = pathGCVizPNG;

				// tooltip, text strings
				_self.tpFormat = i18n.getDict('%footer-tpformat');
				_self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');
				_self.urlLogoAlt = i18n.getDict('%footer-tpgithub');
				_self.lblWest = i18n.getDict('%west');
				_self.lblPosition = i18n.getDict('%position');
				_self.tpDatagrid = i18n.getDict('%footer-tpdatagrid');
				_self.tpArrow = i18n.getDict('%footer-tpNorth');

				// coords and arrow
				_self.coords1 = ko.observable('');
				_self.coords2 = ko.observable('');
				_self.dualCoords = ko.observable(0);
				_self.rotateArrow = ko.observable('');

				// enable button table (will be set true by datagridVM when
				// datatable is ready)
				_self.isTableReady = ko.observable(false);

				// to notify datagridVM open datagrid button has been pushed
				_self.isOpenDG = ko.observable(false);

				_self.init = function() {
					var mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

					if (configMouse.enable) {
						coordEvt = mymap.on('mouse-move', function(evt) {
							_self.showCoordinates(evt);
						});
						
						$viz('#map2').on('gcviz-ready', function() {
							// subscribe to the open add data event. When data is added we need to stop the
							// show coordinate event because it corrupts the projection and creates errors
							gcvizFunc.subscribeTo(mapid, 'data', 'isAddData', function(val) {
								if (val) {
									coordEvt.remove();
								} else {
									coordEvt = mymap.on('mouse-move', function(evt) {
										_self.showCoordinates(evt);
									});
								}
							});
						});
					}

					if (configNorth.enable) {
						// set init state
						gisGeo.getNorthAngle(mymap.extent, inwkid, _self.updateArrow);

						mymap.on('pan-end', function(evt) {
							_self.showNorthArrow(evt);
						});

						mymap.on('zoom-end', function(evt) {
							_self.showNorthArrow(evt);
						});
					}

					// See if user wanted a scalebar. If so, initialize it here
					if (scalebar.enable) {
						gisNav.setScaleBar(mymap, scalebar);
					}

					return { controlsDescendantBindings: true };
				};

				_self.showCoordinates = function(evt) {
					gisGeo.projectPoints([evt.mapPoint], outwkid, _self.updateCoordinates);
				};

				_self.updateCoordinates = function(projectedPoints) {
					var strPointX, strPointY, dms,
						strPointX2 = '',
						strPointY2 = '',
						point = projectedPoints[0],
						x = point.x,
						y = point.y;

					// if lat/long, set dd and dms
					if (outwkid === 4326) {
						_self.dualCoords(1);

						// dms
						dms = gcvizFunc.convertDdToDms(x, y, 0);
						strPointY = dms.y.join(' ');
						strPointX = dms.x.join(' ');

						// dd
						if (x < 0) {
							strPointX2 = (-1 * x.toFixed(3)).toString() + ' ' + _self.lblWest;
						} else {
							strPointX2 = x.toFixed(3).toString() + ' E';
						}

						if (y < 0) {
							strPointY2 = (-1 * y.toFixed(3)).toString() + ' S';
						} else {
							strPointY2 = y.toFixed(3).toString() + ' N';
						}

						_self.coords2(strPointY2 + ' | ' + strPointX2);
					} else {
						strPointX = 'X= ' + x.toFixed(3).toString();
						strPointY = 'Y= ' + y.toFixed(3).toString();
					}

					_self.coords1(_self.lblPosition + strPointY + ' | ' + strPointX);
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
					bearing = Math.atan2(y, x) * 180 / Math.PI;
					bearing = ((bearing + 360) % 360).toFixed(1) - 90; //Converting -ve to +ve (0-360)

					_self.rotateArrow('rotate(' + bearing + 'deg)');
				};

				_self.datagridClick = function() {
					var $datagrid = $viz('#gcviz-datagrid' + mapid),
						heightSect = parseInt($section.css('height'), 10);

					// refresh accordion and set the section height. If we dont set the height when datatable is
					// open, there is overlap in Safari.
					if ($datagrid.accordion('option', 'active') === 0) {
						$datagrid.accordion({ active: false }).click();
						gcvizFunc.setStyle($section[0], { 'height': (heightSect - heightData) + 'px' });
						_self.isOpenDG(false);
					} else {
						$datagrid.accordion({ active: 0 }).click();
						gcvizFunc.setStyle($section[0], { 'height': (heightSect + heightData) + 'px' });
						_self.isOpenDG(true);
					}
					return false;
				};

				_self.goGitHub = function(data, event) {
					if (event.keyCode === 13) {
						window.open(_self.urlLogo, '_blank');
					}
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
