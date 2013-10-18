/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS map functions
 */
/* global esri: false, mapArray: false */
(function () {
	'use strict';
	define([], function() {
	
		var createMap,
			applyLink,
			connectEvent,
			addLayer,
			resizeMap,
			getMap,
			zoomIn,
			zoomOut,
			linkNames = [],
			debounce;
	
		createMap = function(id, config) {
			var extentC = config.extent,
				wkid = config.sr.wkid,
				extent = new esri.geometry.Extent({'xmin': extentC.xmin, 'ymin': extentC.ymin, 'xmax': extentC.xmax, 'ymax': extentC.ymax, 'spatialReference': {'wkid': wkid}}),
				map, mapInfo;
				
			map = new esri.Map(id, {
				extent: extent,
				spatialReference: {'wkid': wkid},
				logo: false,
				showAttribution: false,
				isPanArrows: true,
				fitExtent:false
			});
			
			// add value to map object
			map.vInitExtent = extent;
			mapInfo = id.split('_');
			map.vIdName = mapInfo[0];
			map.vIdIndex = Number(mapInfo[1]);
			
			if (config.link) {
				linkNames.push(map.vIdName);
				connectEvent(map);
			}
			
			return map;
		};
		
		applyLink = function(mapName, mapIndex) {
  
			// loop trought maps and modify extent
			Object.keys(mapArray).forEach(function(key) {
				if (key !== mapName && linkNames.indexOf(key) !== -1) {
					var mymap = mapArray[key][0];
					mymap.setExtent(mapArray[mapName][mapIndex].extent, mymap.spatialReference);
				}
			});
		};
		
		connectEvent = function(map) {
			map.on('extent-change', debounce(function (evt) {
				if (evt.target.id === document.activeElement.id) {
					applyLink(evt.target.vIdName, Number(evt.target.vIdIndex));
				}
			}, 1000, false));
			
			map.on('mouse-out',debounce(function (evt) {
				var info = evt.target.id.split('_');
				applyLink(info[0], Number(info[1]));
			}, 1000, false));
		};

		debounce = function(func, threshold, execAsap) {

			var timeout;

			return function debounced () {
				var obj = this, 
					args = arguments;
						
				function delayed () {
					if (!execAsap) {
						func.apply(obj, args);
					}
					timeout = null; 
				}
				
				if (timeout) {
					clearTimeout(timeout);
				}
				else if (execAsap) {
					func.apply(obj, args);
				}

				timeout = setTimeout(delayed, threshold || 100); 
			};
		};
		
		addLayer = function(map, type, url) {
			if (type === 'tiled') {
				map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(url));
			} else if (type === 'dynamic') {
				map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(url));
			}
		};
			
		resizeMap = function(id) {
			var maps = getMap(id),
				map,
				len = maps.length;
				
			while (len--) {
				map = maps[len];
				map.resize();
				map.setExtent(map.getLayer(map.layerIds[0]).initialExtent, true);
			}
		};
			
		getMap = function(id) {
			return mapArray[id];
		};
			
		zoomIn = function() {
		};
			
		zoomOut = function() {
		};
			
		return {
			createMap: createMap,
			addLayer: addLayer,
			resizeMap: resizeMap
		};
	});
}());