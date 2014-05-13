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
			'gcviz-gismap',
			'gcviz-gisgeo'
	], function($viz, ko, gisM, gisGeo) {
		var initialize,
			vm;

		initialize = function($mapElem) {

			// data model				
			var mapViewModel = function($mapElem) {
				var _self = this,
					mapframe = $mapElem.mapframe,
					mapid = mapframe.id,
					config = mapframe.map,
					map;

				_self.init = function() {
					var layers = config.layers,
						lenLayers = layers.length,
						base = config.bases[0],
						$map = $viz('#' + mapid + '_holder'),
						$root,
						$container;

					// set proxy for esri request (https://github.com/Esri/resource-proxy)
					gisM.setProxy(config.urlproxy);

					// set the geometry server url
					gisGeo.setGeomServ(config.urlgeomserv);

					// keep reference for map holder
					_self.mapholder = $map;

					// create map	
					map = gisM.createMap(mapid + '_holder', config);

					// add basemap
					gisM.addLayer(map, base);

					// add layers
					layers = layers.reverse();
					while (lenLayers--) {
						var layer = layers[lenLayers];
						gisM.addLayer(map, layer);
					}

					// set class and remove cursor for container
					$root = $viz('#' + mapid + '_holder_root');
					$container = $viz('#' + mapid + '_holder_container');
					$map.addClass('gcviz-map');
					$root.addClass('gcviz-root');
					$container.addClass('gcviz-container');

					_self.focus($map);

					// keep map reference in the viewmodel to be accessible from other view model
					_self.map = map;

					return { controlsDescendantBindings: true };
				};

				_self.enterMouse = function() {
					_self.mapholder.focus();
				};

				_self.leaveMouse = function() {
					_self.mapholder.blur();
				};

				_self.focus = function() {
					// focus (events (focusin focusout))
					_self.mapfocus = ko.observable();
					_self.mapfocus.focused = ko.observable();
					_self.mapfocus.focused.subscribe(function(isFocus) {
						if (isFocus) {
							_self.mapholder.focus();
							_self.mapfocus(true);
						} else {
							_self.mapholder.blur();
							_self.mapfocus(false);
						}
					});
				};

				_self.applyKey = function(key, shift) {
					var map = _self.map,
						prevent = false;

					if (_self.mapfocus) {
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
						}  else if ((key === 189 && shift) || (key === 173 && shift)) {
							gisM.zoomOut(map);
							prevent = true;

						// firefox trigger internal api zoom even if shift is not press. Grab this key and prevent default.
						} else if (key === 61) {
							prevent = true;
						}
					}
					return prevent;
				};

				_self.init();
			};

			vm = new mapViewModel($mapElem);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
