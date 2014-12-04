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
			'gcviz-gisnav'
	], function($viz, ko, i18n, gcvizFunc, gisM, gisGeo, gisNav) {
		var initialize,
			vm;

		initialize = function($mapElem, side) {

			// data model				
			var mapViewModel = function($mapElem, side) {
				var _self = this,
					mapframe = $mapElem.mapframe,
					mapid = mapframe.id,
					config = mapframe.map,
					map;

				// text
				_self.tpZoomFull = i18n.getDict('%map-tpzoomfull');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// map focus observable
				_self.mapfocus = ko.observable();

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

					// set a wcag close button for map info window
					map.on('load', function() {
						var btn;

						panel = $viz('.esriPopupWrapper').find('.titlePane');
						panel.prepend('<button class="gcviz-wcag-close ui-button ui-state-default ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="close">' +
											'<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>' +
											'<span class="ui-button-text">close</span>' +
										'</button>');
						btn = panel.find('.gcviz-wcag-close');
						btn.on('click', function() {
							gisM.hideInfoWindow(_self.map, 'location');
						});
					});

					return { controlsDescendantBindings: true };
				};

				_self.extentClick = function() {
					gisNav.zoomFullExtent(map);
				};

				_self.enterMouse = function() {
					_self.mapholder.focus();
				};

				_self.leaveMouse = function() {
					_self.mapholder.blur();
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
							gisM.panUp(map);
							prevent = true;
						} else if (key === 39) {
							gisM.panRight(map);
							prevent = true;
						} else if (key === 40) {
							gisM.panDown(map);
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

		return {
			initialize: initialize
		};
	});
}).call(this);
