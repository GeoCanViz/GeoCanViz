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
			unconnectEvent,
			addLayer,
			resizeMap,
			getMap,
			zoomIn,
			zoomOut,
			linkNames = [],
			linkMain = '',
			debounce;
	
		createMap = function(id, config) {
			var extent = config.extent,
				wkid = config.sr.wkid,
				extent = new esri.geometry.Extent({'xmin': extent.xmin, 'ymin': extent.ymin, 'xmax': extent.xmax, 'ymax': extent.ymax, 'spatialReference': {'wkid': wkid}}),
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
		
		// TODO: mettre un delai dans le call du zoom si link... au lieu de mettre le delai apres...
		applyLink = function(evt) {
  
			var mapName = evt.target.vIdName,
				mapIndex = Number(evt.target.vIdIndex);
					
			if (linkMain === '' || linkMain === mapName) {
				linkMain = mapName;
	
				// loop trought maps and modify extent
				Object.keys(mapArray).forEach(function(key) {
	    			if (key !== mapName && linkNames.indexOf(key) != -1) {
	    				var mymap = mapArray[key][0];
	    				mymap.setExtent(mapArray[mapName][mapIndex].extent, mymap.spatialReference);
	    			}
				});
			}
		};
		
		connectEvent = function(map) {
			map.on('extent-change', debounce(function (evt) {
				if (evt.target.id ==='map1_0') {
					applyLink(evt);
				}
				
			}, 2000, false));
		};

		debounce = function (func, threshold, execAsap) {

			var timeout;

		    return function debounced () {
				var obj = this, 
					args = arguments;
						
				function delayed () {
					if (!execAsap) {
						func.apply(obj, args);
					}
					timeout = null; 
				};
				
				if (timeout) {
					clearTimeout(timeout);
				}
				else if (execAsap) {
					func.apply(obj, args);
				}

				timeout = setTimeout(delayed, threshold || 100); 
			};
		 };
		
		unconnectEvent = function(map) {
			
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