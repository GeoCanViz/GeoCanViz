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
			'dijit/PopupMenuItem',
			'esri/layers/FeatureLayer'], function(func, menu, menuItem, menupopup) {
	
		var createMap,
			createInset,
			applyLink,
			connectLinkEvent,
			connectEvent,
			addLayer,
			checkRestrictExtent,
			resizeMap,
			resizeCenterMap,
			zoomPoint,
			getMapCenter,
			createMapMenu,
			zoomIn,
			zoomOut,
			linkNames = [],
			wkid,
			manageScreenState,
			linkInset,
			insetArray = {},
			isFullscreen,
			linkCount;
	
		createMap = function(id, config, fullExtent) {
			var initExtent = config.extent,
				wkid = config.sr.wkid,
				initExtent = new esri.geometry.Extent({'xmin': initExtent.xmin, 'ymin': initExtent.ymin, 'xmax': initExtent.xmax, 'ymax': initExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				fullExtent = new esri.geometry.Extent({'xmin': fullExtent.xmin, 'ymin': fullExtent.ymin, 'xmax': fullExtent.xmax, 'ymax': fullExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				lod = config.lods,
				options,
				map;
			
			// set options
			if (lod.length) {
				options = {
					extent: initExtent,
					spatialReference: {'wkid': wkid},
					logo: false,
					showAttribution: false,
					lods: lod,
					wrapAround180: true,
					smartNavigation: false
				};
			} else {
				options = {
					extent: initExtent,
					spatialReference: {'wkid': wkid},
					logo: false,
					showAttribution: false,
					wrapAround180: true,
					smartNavigation: false
				};
			}
			
			map = new esri.Map(id, options);
			
			// add value to map object
			map.vInitExtent = initExtent;
			map.vFullExtent = fullExtent;
			map.vIdName = id.split('_')[0];
			map.vWkid = wkid;
			map.vInsetId = [];
			
			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
				map.resize();
							
				// enable navigation
				map.enableScrollWheelZoom();
				map.enableKeyboardNavigation();
				map.isZoomSlider = false;

				// connect event map
				if (config.link) {
					linkNames.push({ 'name': map.vIdName, 'fire': false });
					connectLinkEvent(map);
				} else {
					connectEvent(map);
				}
				
				// set the link count to enable the first extent-change event
				linkCount = linkNames.length;
				
				// add context menu
				//gisM.createMapMenu(mymap);
			});

			return map;
		};
		
		createInset = function(id, config, masterId) {
			var extentC = config.extent,
				wkid = config.sr.wkid,
				extent = new esri.geometry.Extent({'xmin': extentC.xmin, 'ymin': extentC.ymin, 'xmax': extentC.xmax, 'ymax': extentC.ymax, 'spatialReference': {'wkid': wkid}}),
				map;
				
			map = new esri.Map(id, {
				extent: extent,
				spatialReference: {'wkid': wkid},
				logo: false,
				showAttribution: false,
				smartNavigation: false
			});
			
			// add value to map object
			map.vWkid = wkid;
			
			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
				map.resize();
				map.disableMapNavigation();
							
				if (config.type !== 'static') {
					// add inset link to master map
					mapArray[masterId].vInsetId.push(map.id);
					insetArray[id] = map;
				}
			});

			return map;
		};
		
		applyLink = function(mapName) {
			// loop trought maps and modify extent
			var len = linkNames.length,
				name,
				link,
				mymap;
			
			// loop trought array of link map
			while (len--) {
				link = linkNames[len];
				name = link.name;
				
				// if mapName is different from the link map name, set extent for this link map name
				if (name !== mapName)
				{
					mymap = mapArray[name];
					mymap.setExtent(mapArray[mapName].extent, mymap.spatialReference);
				}
			}
		};
		
		connectLinkEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target,
					id = target.id.split('_')[0],
					flag = false;
				
				// Check if all maps had fired event
				if (linkCount === linkNames.length) { flag = true; }
				
				// if exent-change has not been fire and not in fullscreen, do it
				if (flag && !isFullscreen) {
					// apply link
					setTimeout(function() { applyLink(id); }, 1000);
				}
				
				// decreament the counter and check if we need to reseet it
				linkCount -= 1;
				if (linkCount === 0) { 
					setTimeout(function() { linkCount = linkNames.length; }, 1000);
				}
			}, 1000, false));
		};
		
		connectEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target;
				
				// check if inset needs to be resize
				linkInset(target);
			}, 1000, false));
		};
		
		addLayer = function(map, type, url) {
			if (type === 'tiled') {
				map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(url));
			} else if (type === 'dynamic') {
				map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(url));
			} else if (type === 'feature') {
				map.addLayer(new esri.layers.FeatureLayer(url, {
					mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
      				outFields: ["*"]
				}));
			}
		};

		linkInset = function(map) {
			var len = map.vInsetId.length,
				insetMap,
				inset;
			
			while (len--) {
				insetMap = insetArray[map.vInsetId[len]];
				zoomPoint(insetMap, getMapCenter(map));
			}
		};
		
		resizeMap = function(map) {
			map.resize();
		};
		
		resizeCenterMap = function(map, options) {
			var point,
				interval;
				
			options = options || {};
			point = options.point || getMapCenter(map);
			interval = options.interval || 0;
			
			resizeMap(map);
			setTimeout(function() { zoomPoint(map, point); }, interval);
		};
		
		zoomPoint = function(map, point) {
			point = point || getMapCenter(map);
			map.centerAt(point);
		};
		
		getMapCenter = function(map) {
			var extent,
				point;
				
			extent = map.extent;
			point = new esri.geometry.Point((extent.xmin + extent.xmax) / 2, (extent.ymin + extent.ymax) / 2, map.vWkid);
			
			return point;
		};

		manageScreenState = function(map, interval, fullscreen) {
			// get extent before the resize then resize
			var extent = map.extent;
			isFullscreen = fullscreen;
			resizeMap(map);
			
			// wait for the resize to finish then set extent (cant use resize event because it is trigger before it is finish)
			setTimeout(function() { map.setExtent(extent); }, interval);
		};
		
		// USE JQUERY.UI-contextmenu INSTEAD OF DOJO!!!
		createMapMenu = function(map) {
			// Creates right-click context menu for map
			var ctxMenuMap = new menu({
				targetNodeIds: ['gcviz-header']
				// onOpen: function(box) {
				// // Lets calculate the map coordinates where user right clicked.
				// //currentLocation = getMapPointFromMenuPosition(box);          
				// }
			});

			ctxMenuMap.addChild(new menuItem({ 
				label: "Add Point",
				onClick: function() {
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
			createInset: createInset,
			addLayer: addLayer,
			resizeMap: resizeMap,
			resizeCenterMap: resizeCenterMap,
			zoomPoint: zoomPoint,
			getMapCenter: getMapCenter,
			manageScreenState: manageScreenState,
			createMapMenu: createMapMenu
		};
	});
}());