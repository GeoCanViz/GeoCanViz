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
			'gcviz-gisdata',
			'gcviz-gisgraphic',
			'gcviz-gisdatagrid',
			'gcviz-vm-tbnav',
			'gcviz-vm-header'
	], function($viz, ko, i18n, gcvizFunc, gisMap, gisGeo, gisNav, gisData, gisGraphic, gisDG, tbnavVM, headerVM) {
		var initialize,
			disableZoomExtent,
			setScaleBar,
			setOverviewMap,
			resize,
			resizeCenter,
			zoomLocation,
			getExtent,
			getScale,
			setScale,
			getSR,
			getHeight,
			getCenter,
			focus,
			addGraphic,
			addLayerCSV,
			addLayerFeature,
			addLayerKML,
			removeLayer,
			registerEvent,
			registerEventOne,
			hideInfoWindow,
			showInfoWindow,
			manageScreenState,
			vm = [];

		initialize = function($mapElem, mapid, side) {

			// data model				
			var mapViewModel = function($mapElem, mapid, side) {
				var _self = this,
					map, menuState,
					mapframe = $mapElem.mapframe,
					config = mapframe.map,
					extentCall = false,
					extentBtnClick = '';

				// text
				_self.tpZoomFull = i18n.getDict('%map-tpzoomfull');
				_self.tpZoom = i18n.getDict('%map-tpzoom');
				_self.close = i18n.getDict('%close');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// map focus observable
				_self.mapfocus = ko.observable();

				// set zoom extent button to be able to enable/disable
				_self.zmExtent = $viz('#map-zmextent-' + mapid);

				// previous / nest extent
				_self.previous = i18n.getDict('%datagrid-previous');
				_self.next = i18n.getDict('%datagrid-next');
				_self.isEnablePrevious = ko.observable(false);
				_self.isEnableNext = ko.observable(false);
				_self.extentPos = ko.observable(-1);
				_self.extentArray = ko.observableArray([]);

				_self.init = function() {
					var layer, base, panel, idmap,
						extent, extentVal, extentInit,
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
					gisMap.setProxy(config.urlproxy);

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

					// check if extent is specify in the extent, if so modify config
					// param look like this: extent=-535147.9538835107,12432.88706458224,-104177.95416573394,161860.56747549836
					idmap = gcvizFunc.getURLParameter(window.location.toString(), 'id');
					extent = gcvizFunc.getURLParameter(window.location.toString(), 'extent');

					if (extent !== null && idmap === mapid) {
						extentVal = extent.split(',');
						extentInit = config.extentinit;
						extentInit.xmin = parseFloat(extentVal[0], 10);
						extentInit.ymin = parseFloat(extentVal[1], 10);
						extentInit.xmax = parseFloat(extentVal[2], 10);
						extentInit.ymax = parseFloat(extentVal[3], 10);
					}

					// create map	
					map = gisMap.createMap(mapid + '_holder', config, side);

					// add extent change event
					gisMap.extentMapEvent(map, _self.changeExtent);

					// add basemap
					bases = bases.reverse();
					while (lenBases--) {
						base = bases[lenBases];
						gisMap.addLayer(map, base);
					}

					// add layers
					layers = layers.reverse();
					while (lenLayers--) {
						layer = layers[lenLayers];
						gisMap.addLayer(map, layer);
					}

					// add the graphic layer
					gisMap.addGraphicLayer(map, 'gcviz-symbol');

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

					// KEEP!!! set a wcag close button for map info window (we need this for the popup with find a location)
					map.on('load', function() {
						var btn;

						panel = $viz('.esriPopupWrapper').find('.titlePane');
						panel.prepend('<button class="gcviz-wcag-close ui-button ui-state-default ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="close">' +
											'<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>' +
											'<span class="ui-button-text">close</span>' +
										'</button>');
						btn = panel.find('.gcviz-wcag-close');
						btn.on('click', function() {
							gisMap.hideInfoWindow(_self.map, 'location');
						});
					});

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
						gisMap.zoomIn(_self.map);
					}

					// open menu if it was open
					if (menuState !== false) {
						$menu.accordion('option', 'active', 0);
					}
				};

				_self.changeExtent = function(value) {
					var pos, len, array;

					// check if the extent was fired by the click next or previous
					if (!extentCall) {
						// increment pos
						_self.extentPos(_self.extentPos() + 1);
						pos = _self.extentPos();

						if (pos < _self.extentArray().length) {
							// case a new extent is added inside the array because the user made previous
							// we keep all the remaining extent (position to the end... in other words all the back).

							// if it comes from a previous, reverse the array
							if (extentBtnClick === 'p') {
								array = _self.extentArray.slice(pos - 1);
								_self.extentArray(array.reverse());
							} else {
								array =_self.extentArray().reverse;
								array = _self.extentArray.slice(0, pos);
								_self.extentArray(array);
							}
							extentBtnClick = '';

							// add the new extent at the end
							_self.extentArray.push(value);

							// set position to the end of the array and disable next
							_self.extentPos(array.length - 1);
							_self.isEnableNext(false);
						} else {
							// case where we add a new extent at the end of the array
							_self.extentArray.push(value);
						}

						// keep only 15 extents
						len = _self.extentArray().length;
						if (len > 15) {
							// remove first element (fifo array) and set pos to the last item
							_self.extentArray.shift();
							_self.extentPos(14);
						}

						// enable previous if there is at least 2 items
						if (len > 1) {
							_self.isEnablePrevious(true);
						}
					}

					// set extent fired by click to false
					extentCall = false;
				};

				_self.clickPreviousExtent = function() {
					// debounce the click to the same debounce then extent change event
					gcvizFunc.debounceClick(function() {
						var  pos;

						// set fired to true and decrement the position
						extentCall = true;
						extentBtnClick = 'p';
						_self.extentPos(_self.extentPos() - 1);
						pos = _self.extentPos();

						// enable / disable the previous button
						if (pos <= 0) {
							_self.isEnablePrevious(false);
						} else {
							_self.isEnablePrevious(true);
						}

						// enable / disable the next button
						if (_self.extentArray().length >= pos + 1) {
							_self.isEnableNext(true);
						} else {
							_self.isEnableNext(false);
						}

						// zoom to extent
						gisMap.zoomExtent(map, _self.extentArray()[pos], true);
					}, 500);
				};

				_self.clickNextExtent = function() {
					// debounce the click to the same debounce then extent change event
					gcvizFunc.debounceClick(function() {
						var pos,
							len = _self.extentArray().length;

						// set fired to true and increment the position
						extentCall = true;
						extentBtnClick = 'n';
						_self.extentPos(_self.extentPos() + 1);
						pos = _self.extentPos();

						// enable / disable the next button
						if (pos >= 14 || len <= pos + 1) {
							_self.isEnableNext(false);
						} else {
							_self.isEnableNext(true);
						}

						// enable / disable the previous button
						if (len >= pos + 1) {
							_self.isEnablePrevious(true);
						} else {
							_self.isEnablePrevious(false);
						}

						// zoom to extent
						gisMap.zoomExtent(map, _self.extentArray()[pos], true);
					}, 500);

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
							gisMap.panLeft(map);
							prevent = true;
						} else if (key === 38) {
							gisMap.panDown(map);
							prevent = true;
						} else if (key === 39) {
							gisMap.panRight(map);
							prevent = true;
						} else if (key === 40) {
							gisMap.panUp(map);
							prevent = true;

						// chrome/safari is different then firefox. Need to check for both.
						} else if ((key === 187 && shift) || (key === 61 && shift)) {
							gisMap.zoomIn(map);
							prevent = true;
						} else if ((key === 189 && shift) || (key === 173 && shift)) {
							gisMap.zoomOut(map);
							prevent = true;

						// firefox trigger internal api zoom even if shift is not press. Grab this key and prevent default.
						} else if (key === 61) {
							prevent = true;
						// open tools if esc is press
						} else if (key === 27) {
// TODO
							// // check if draw is active. If so apply event
							// if (typeof gcvizFunc.getElemValueVM(mapid, ['draw'], 'js') !== 'undefined') {
								// if (gcvizFunc.getElemValueVM(mapid, ['draw', 'activeTool'], 'ko') !== '') {
									// gcvizFunc.getElemValueVM(mapid, ['draw', 'endDraw'], 'js')();
									// flag = true;
								// }
							// }

							// check if position is active. If so apply event
							flag = tbnavVM.endGetCoordinates(mapid);

							// if not tools acitve, just toggle the menu
							if (!flag) {
								headerVM.toggleMenu(mapid);
							}
						}
					}

					return prevent;
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new mapViewModel($mapElem, mapid, side);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		setScaleBar = function(mapid, scalebar) {
			gisNav.setScaleBar(vm[mapid].map, scalebar);
		};

		setOverviewMap = function(mapid, overview) {
			return gisNav.setOverview(vm[mapid].map, overview);
		};

		resize = function(mapid) {
			vm[mapid].map.resize();
		};

		resizeCenter = function(mapid, center) {
			gisMap.resizeCenterMap(vm[mapid].map, center);
		};

		zoomLocation = function(mapid, minx, miny, maxx, maxy, outSR) {
			gisGeo.zoomLocation(minx, miny, maxx, maxy, vm[mapid].map, outSR);
		};

		getExtent = function(mapid) {
			return gisMap.getMapExtent(vm[mapid].map);
		};

		getScale = function(mapid) {
			return vm[mapid].map.getScale();
		};

		setScale = function(mapid, scale) {
			return gisMap.zoomScale(vm[mapid].map, scale);
		};

		getSR = function(mapid) {
			return vm[mapid].map.vWkid;
		};
		
		getHeight = function(mapid) {
			return vm[mapid].map.height;
		};

		getCenter = function(mapid) {
			return gisMap.getMapCenter(vm[mapid].map);
		};

		registerEvent = function(mapid, evt, funct, time) {
			var rtnEvent,
				map = vm[mapid].map;

			if (typeof time !== 'undefined') {
				rtnEvent = map.on(evt, gcvizFunc.debounce(function(evt) {
					funct(evt);
				}, time, false));
			} else {
				rtnEvent = map.on(evt, function(evt) {
					funct(evt);
				});
			}

			return rtnEvent;
		};

		focus = function(mapid, scroll) {
			var element = document.getElementById(mapid + '_holder');

			element.focus();
			if (scroll) {
				element.scrollIntoView();
			}
		};

		addGraphic = function(mapid, type, geom, info, sr, id) {
			gisGraphic.createGraphic(vm[mapid].map, type, geom, info, sr, id);
		};

		addLayerCSV = function(mapid, funct, result, id, fileName) {
			gisData.addCSV(vm[mapid].map, result, id, fileName).done(funct);
		};

		addLayerFeature = function(mapid, funct, url, id, config) {
			gisData.addFeatLayer(vm[mapid].map, url, id, config).done(funct);
		};

		addLayerKML = function(mapid, funct, url, id, name, config) {
			gisData.addKML(vm[mapid].map, url, id, name, config).done(funct);
		};

		removeLayer = function(mapid, id) {
			var map = vm[mapid].map;
			map.removeLayer(map.getLayer(id));
		};

		registerEventOne = function(mapid, evt, funct) {
			var rtnEvent;

			rtnEvent = vm[mapid].map.on(evt, function(evt) {
				funct(evt);
				rtnEvent.remove();
			});
		};

		hideInfoWindow = function(mapid, id) {
			gisMap.hideInfoWindow(vm[mapid].map, id);
		};

		showInfoWindow = function(mapid, id, title, anchor, offx, offy) {
			gisMap.showInfoWindow(vm[mapid].map, id, title, anchor, offx, offy);
		};

		manageScreenState = function(mapid, interval, fullscreen) {
			gisMap.manageScreenState(vm[mapid].map, interval, fullscreen);
		};

		disableZoomExtent = function(mapid, val) {
			var viewModel = vm[mapid];

			if (val) {
				viewModel.zmExtent.addClass('gcviz-disable');
			} else {
				viewModel.zmExtent.removeClass('gcviz-disable');
			}
		};

		return {
			initialize: initialize,
			setScaleBar: setScaleBar,
			setOverviewMap: setOverviewMap,
			resizeMap: resize,
			resizeCenterMap: resizeCenter,
			zoomLocation: zoomLocation,
			getExtentMap: getExtent,
			getScaleMap: getScale,
			setScaleMap: setScale,
			getSR: getSR,
			getHeightMap: getHeight,
			getCenterMap: getCenter,
			focusMap: focus,
			addGraphic: addGraphic,
			addLayerCSV: addLayerCSV,
			addLayerFeature: addLayerFeature,
			addLayerKML: addLayerKML,
			removeLayer: removeLayer,
			registerEvent: registerEvent,
			registerEventOne: registerEventOne,
			hideInfoWindow: hideInfoWindow,
			showInfoWindow: showInfoWindow,
			manageScreenState: manageScreenState,
			disableZoomExtent: disableZoomExtent
		};
	});
}).call(this);
