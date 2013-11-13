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
	define(['gcviz-func',
			'dijit/Menu',
			'dijit/MenuItem',
			'dijit/PopupMenuItem'], function(func, menu, menuItem, menupopup) {
	
		var createMap,
			applyLink,
			connectEvent,
			addLayer,
			resizeMap,
			getMapCenter,
			getMap,
			createMapMenu,
			zoomIn,
			zoomOut,
			linkNames = [];
	
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

			// resize the map on load to ensure everything is set corretcly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function(e) {
				map.resize();
							
				// enable navigation
				map.enableScrollWheelZoom();
				map.enableKeyboardNavigation();
				map.isZoomSlider = false;
							
				// add context menu
				//gisM.createMapMenu(mymap);
			});

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
			map.on('extent-change', func.debounce(function (evt) {
				if (evt.target.id === document.activeElement.id) {
					applyLink(evt.target.vIdName, Number(evt.target.vIdIndex));
				}
			}, 1000, false));
			
			map.on('mouse-out', func.debounce(function (evt) {
				var info = evt.target.id.split('_');
				applyLink(info[0], Number(info[1]));
			}, 1000, false));
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
		
		getMapCenter = function(id) {
			var maps = getMap(id),
				map,
				extent,
				point,
				len = maps.length;
				
			while (len--) {
				map = maps[len];
				extent = map.extent;
				point = new esri.geometry.Point((extent.xmin + extent.xmax) / 2, (extent.ymin + extent.ymax) / 2, map.spatialReference);
			}
			
			return point;
		};
			
		getMap = function(id) {
			return mapArray[id];
		};
		
		// USE JQUERY.UI-contextmenu INSTEAD OF DOJO!!!
		createMapMenu = function(map) {
			// Creates right-click context menu for map
			var ctxMenuMap = new menu({
				targetNodeIds: ['gcviz-header'],
				// onOpen: function(box) {
              		// // Lets calculate the map coordinates where user right clicked.
              		// //currentLocation = getMapPointFromMenuPosition(box);          
				// }
			});

			ctxMenuMap.addChild(new menuItem({ 
				label: "Add Point",
				onClick: function(evt) {
              		alert('click');
				}
			}));

			ctxMenuMap.startup();
			//ctxMenuMap.bindDomNode(map.container);
        };
        
		zoomIn = function() {
		};
			
		zoomOut = function() {
		};
			
		return {
			createMap: createMap,
			addLayer: addLayer,
			resizeMap: resizeMap,
			getMapCenter: getMapCenter,
			createMapMenu: createMapMenu
		};
	});
}());