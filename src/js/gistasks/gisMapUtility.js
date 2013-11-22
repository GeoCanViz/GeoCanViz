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
			createInset,
			applyLink,
			connectLinkEvent,
			connectEvent,
			addLayer,
			checkRestrictExtent,
			resizeMap,
			resizeCenterMap,
			zoomMapCenter,
			getMapCenter,
			createMapMenu,
			zoomIn,
			zoomOut,
			linkNames = [],
			xminFull, xmaxFull, yminFull, ymaxFull,
			extentFull,
			wkid,
			manageScreenState;
	
		createMap = function(id, config, fullExtent) {
			var initExtent = config.extent,
				wkid = config.sr.wkid,
				initExtent = new esri.geometry.Extent({'xmin': initExtent.xmin, 'ymin': initExtent.ymin, 'xmax': initExtent.xmax, 'ymax': initExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				fullExtent = new esri.geometry.Extent({'xmin': fullExtent.xmin, 'ymin': fullExtent.ymin, 'xmax': fullExtent.xmax, 'ymax': fullExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				map;
				
			map = new esri.Map(id, {
				extent: initExtent,
				spatialReference: {'wkid': wkid},
				logo: false,
				showAttribution: false,
				isPanArrows: true,
				fitExtent:false
			});
			
			// add value to map object and set full extent variable
			map.vInitExtent = initExtent;
			map.vFullExtent = fullExtent;
			xminFull = fullExtent.xmin, xmaxFull = fullExtent.xmax, yminFull = fullExtent.ymin, ymaxFull = fullExtent.ymax,
			extentFull = fullExtent,
			map.vIdName = id.split('_')[0];
			map.vLink = false;
			map.vWkid = wkid;
			
			if (config.link) {
				linkNames.push(map.vIdName);
				connectLinkEvent(map);
			} else {
				connectEvent(map);
			}

			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
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
		
		createInset = function(id, config) {
			var extentC = config.extent,
				wkid = config.sr.wkid,
				extent = new esri.geometry.Extent({'xmin': extentC.xmin, 'ymin': extentC.ymin, 'xmax': extentC.xmax, 'ymax': extentC.ymax, 'spatialReference': {'wkid': wkid}}),
				map;
				
			map = new esri.Map(id, {
				extent: extent,
				spatialReference: {'wkid': wkid},
				logo: false,
				showAttribution: false,
				isPanArrows: true,
				fitExtent:false
			});
			
			// add value to map object
			map.vWkid = wkid;
			
			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
				map.resize();
							
				if (config.type === 'static') {
					map.disableMapNavigation();
				}
			});

			return map;
		};
		
		applyLink = function(mapName) {
			// loop trought maps and modify extent
			Object.keys(mapArray).forEach(function(key) {
			if (key !== mapName && linkNames.indexOf(key) !== -1) {
					var mymap = mapArray[key];
					mymap.setExtent(mapArray[mapName].extent, mymap.spatialReference);
				}
			});
		};
		
		connectLinkEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target,
					id = target.id;

				if (id === document.activeElement.id || target.vLink) {
					// check if the extent is outside full extent
					checkRestrictExtent(target, evt.extent);
					
					// apply link
					applyLink(id.split('_')[0]);
					evt.target.vLink = false;
				}
			}, 1000, false));
			
			map.on('mouse-out', func.debounce(function(evt) {
				var id = evt.target.id.split('_')[0],
					mymap = mapArray[id];

				// check if the extent is outside full extent
				checkRestrictExtent(mymap, mymap.extent);
					
				// apply link (apply a time out because if not, the link is made before the extent changed)
				setTimeout(function() { applyLink(id); }, 1000);
			}, 1000, false));
		};
		
		connectEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target;

				// check if the extent is outside full extent
				checkRestrictExtent(target, evt.extent);
			}, 1000, false));
		};
		
		addLayer = function(map, type, url) {
			if (type === 'tiled') {
				map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(url));
			} else if (type === 'dynamic') {
				map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(url));
			}
		};

		checkRestrictExtent = function(mymap, extent) {
			var outBoundXmin = false, outBoundXmax = false, outBoundYmin = false, outBoundYmax = false,
				xminOri = parseInt(extent.xmin, 10), xmaxOri = parseInt(extent.xmax, 10), yminOri = parseInt(extent.ymin, 10), ymaxOri = parseInt(extent.ymax, 10),
				xmin = xminOri, xmax = xmaxOri, ymin = yminOri, ymax = ymaxOri;
			
			if (xminOri < xminFull) {
				xmin = xminFull;
				xmax = xminFull + (xmaxOri - xminOri);
				outBoundXmin = true;
			}
			if (xmaxOri > xmaxFull) {
				xmax = xmaxFull;
				xmin = xmaxFull - (xmaxOri - xminOri);
				outBoundXmax = true;
			}
			if (yminOri < yminFull) {
				ymin = yminFull;
				ymax = yminFull + (ymaxOri - yminOri);
				outBoundYmin = true;
			}
			if (ymaxOri > ymaxFull) {
				ymax = ymaxFull;
				ymin = ymaxFull - (ymaxOri - yminOri);
				outBoundYmax = true;
			}

			// if xmin and xmax or ymin and ymax are out of bounds, it should be a zoom out so put full screen
			// if only one one (or two) of the boundaries moves, set the extent define previously
			if ((outBoundXmin && outBoundXmax) || (outBoundYmin && outBoundYmax)) {
				mymap.setExtent(extentFull);
			} else if (outBoundXmin || outBoundXmax || outBoundYmin || outBoundYmax) {
				mymap.setExtent(new esri.geometry.Extent({'xmin': xmin, 'ymin': ymin, 'xmax': xmax, 'ymax': ymax, 'spatialReference': {'wkid': mymap.vWkid}}));
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
			setTimeout(function() { zoomMapCenter(map, point); }, interval);
		};
		
		zoomMapCenter = function(map, point) {
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

		manageScreenState = function(map) {
			var extent = map.extent;
			
			resizeMap(map);
			setTimeout(function() {
				map.setExtent(extent);
			}, 1000);
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
			zoomMapCenter: zoomMapCenter,
			getMapCenter: getMapCenter,
			manageScreenState: manageScreenState,
			createMapMenu: createMapMenu
		};
	});
}());