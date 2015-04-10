/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Map view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gismap',
			'gcviz-gisgeo',
			'gcviz-gisnav',
			'gcviz-gisgraphic',
			'gcviz-gisdatagrid'
	], function($viz, ko, i18n, gcvizFunc, gisM, gisGeo, gisNav, gisGraphic, gisDG) {
		var initialize,
			disableZoomExtent,
			$zmExtent,
			vm;

		initialize = function($mapElem, side) {

			// data model				
			var mapViewModel = function($mapElem, side) {
				var _self = this,
					map, menuState,
					mapframe = $mapElem.mapframe,
					mapid = mapframe.id,
					config = mapframe.map;

				// text
				_self.tpZoomFull = i18n.getDict('%map-tpzoomfull');
				_self.tpZoom = i18n.getDict('%map-tpzoom');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// map focus observable
				_self.mapfocus = ko.observable();

				// set zoom extent button to be able to enable/disable
				$zmExtent = $viz('#map-zmextent-' + mapid);

				// previous / nest extent
				_self.previous = i18n.getDict('%datagrid-previous');
				_self.next = i18n.getDict('%datagrid-next');
				_self.isEnablePrevious = ko.observable(false);
				_self.isEnableNext = ko.observable(false);
				_self.extentPos = ko.observable(0);
				_self.extentArray = ko.observableArray([]);

				_self.init = function() {
					var layer, base, panel,
						layers = config.layers,
						bases = config.bases,
						lenLayers = layers.length,
						lenBases = bases.length,
						$map = $viz('#' + mapid + '_holder'),
						$root,
						$container;

					// add loading image
					gcvizFunc.setProgressBar(i18n.getDict('%mp-load'));

					// set proxy for esri request (https://github.com/Esri/resource-proxy)
					gisM.setProxy(config.urlproxy);

					// set the geometry server url
					gisGeo.setGeomServ(config.urlgeomserv);

					// keep reference for map holder
					_self.mapholder = $map;

					// set focus and blur event to set observable
					ko.utils.registerEventHandler(_self.mapholder, 'focus', function() {
						_self.mapfocus(true);
					});
					ko.utils.registerEventHandler(_self.mapholder, 'blur', function() {
						_self.mapfocus(false);
					});

					// create map	
					map = gisM.createMap(mapid + '_holder', config, side);

					// add extent change event
					gisM.extentMapEvent(map, _self.changeExtent);
					// add basemap
					bases = bases.reverse();
					while (lenBases--) {
						base = bases[lenBases];
						gisM.addLayer(map, base);
					}

					// add layers
					layers = layers.reverse();
					while (lenLayers--) {
						layer = layers[lenLayers];
						gisM.addLayer(map, layer);
					}

					// set class and remove cursor for container
					$root = $viz('#' + mapid + '_holder_root');
					$container = $viz('#' + mapid + '_holder_container');
					$map.addClass('gcviz-map');
					$root.addClass('gcviz-root');
					$container.addClass('gcviz-container');

					// focus the map to let cluster be able to link to it
					// TODO: do we dot it only if there is cluster then cluster will remove focus. Is it right to focus on aomething on load? _self.mapholder.focus();

					// keep map reference in the viewmodel to be accessible from other view model
					_self.map = map;

					return { controlsDescendantBindings: true };
				};

				_self.extentClick = function() {
					gisNav.zoomFullExtent(map);
				};

				_self.zoomClick = function() {
					// set cursor (remove default cursor first and all other cursors)
					var $container = $viz('#' + mapid + '_holder_layers'),
						$menu = $viz('#gcviz-menu' + mapid);

					// set draw box cursor
					$container.css('cursor', 'zoom-in');

					// get active menu and close it if open
					menuState = $menu.accordion('option', 'active');
					if (menuState !== false) {
						$menu.accordion('option', 'active', false);
					}

					// remove popup click event if it is there to avoid conflict then
					// call graphic class to draw on map.
					gisDG.removeEvtPop();
					gisGraphic.drawBox(_self.map, false, _self.zoomExtent);				
				};

				_self.zoomExtent = function(geometry) {
					var $container = $viz('#' + mapid + '_holder_layers'),
						$menu = $viz('#gcviz-menu' + mapid);

					// remove draw box cursor
					$container.css('cursor', '');

					// pup back popup click event and apply zoom
					// if geometry is empty a click was made instead of draw
					// do a zoom in.
					gisDG.addEvtPop();
					if (typeof geometry !== 'undefined') {
						_self.map.setExtent(geometry);
					} else {
						gisM.zoomIn(_self.map);
					}

					// open menu if it was open
					if (menuState !== false) {
						$menu.accordion('option', 'active', 0);
					}
				};

				_self.changeExtent = function(value) {
					_self.extentArray.push(value);
					_self.extentPos(_self.extentPos() + 1);

					// keep only 5 extent
					if (_self.extentArray().length > 5) {
						_self.extentArray.shift();
					}

					if (_self.extentArray().length > 0) {
						_self.isEnablePrevious(true);
					}
				};

				_self.clickPreviousExtent = function() {
					_self.extentPos(_self.extentPos() - 1);
					
					if (_self.extentPos() <= 0) {
						_self.extentPos(0);
						_self.isEnablePrevious(false);
					} else {
						_self.isEnablePrevious(true);
					};

					if (_self.extentArray().length > _self.extentPos()) {
						_self.isEnableNext(true);
					} else {
						_self.isEnableNext(false);
					}
				};

				_self.clickNextExtent = function() {
					_self.extentPos(_self.extentPos() + 1);

					if (_self.extentPos() >= 5) {
						_self.extentPos(5);
						_self.isEnableNext(false);
					} else {
						_self.isEnableNext(true);
					};

					if (_self.extentArray().length < _self.extentPos()) {
						_self.isEnablePrevious(true);
					} else {
						_self.isEnablePrevious(false);
					}
				};

				// click mouse set focus to map.
				_self.clickMouse = function() {
					_self.mapholder.focus();
				};

				_self.applyKey = function(key, shift) {
					var map = _self.map,
						prevent = false,
						flag = false;

					if (_self.mapfocus()) {
						if (key === 37) {
							gisM.panLeft(map);
							prevent = true;
						} else if (key === 38) {
							gisM.panDown(map);
							prevent = true;
						} else if (key === 39) {
							gisM.panRight(map);
							prevent = true;
						} else if (key === 40) {
							gisM.panUp(map);
							prevent = true;

						// chrome/safari is different then firefox. Need to check for both.
						} else if ((key === 187 && shift) || (key === 61 && shift)) {
							gisM.zoomIn(map);
							prevent = true;
						} else if ((key === 189 && shift) || (key === 173 && shift)) {
							gisM.zoomOut(map);
							prevent = true;

						// firefox trigger internal api zoom even if shift is not press. Grab this key and prevent default.
						} else if (key === 61) {
							prevent = true;
						// open tools if esc is press
						} else if (key === 27) {

							// check if draw is active. If so apply event
							if (typeof gcvizFunc.getElemValueVM(mapid, ['draw'], 'js') !== 'undefined') {
								if (gcvizFunc.getElemValueVM(mapid, ['draw', 'activeTool'], 'ko') !== '') {
									gcvizFunc.getElemValueVM(mapid, ['draw', 'endDraw'], 'js')();
									flag = true;
								}
							}
							// check if position is active. If so apply event
							if (typeof gcvizFunc.getElemValueVM(mapid, ['nav'], 'js') !== 'undefined') {
								if (gcvizFunc.getElemValueVM(mapid, ['nav', 'activeTool'], 'ko') === 'position') {
									gcvizFunc.getElemValueVM(mapid, ['nav', 'endPosition'], 'js')();
									flag = true;
								}
							}

							// if not tools acitve, just toggle the menu
							if (!flag) {
								gcvizFunc.getElemValueVM(mapid, ['header', 'toolsClick'], 'js')();
							}
						}
					}

					return prevent;
				};

				_self.init();
			};

			vm = new mapViewModel($mapElem, side);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		disableZoomExtent = function(val) {
			if (val) {
				$zmExtent.addClass('gcviz-disable');
			} else {
				$zmExtent.removeClass('gcviz-disable');
			}
		};

		return {
			initialize: initialize,
			disableZoomExtent: disableZoomExtent
		};
	});
}).call(this);
