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
			zoomMapCenter,
			getMapCenter,
			createMapMenu,
			zoomIn,
			zoomOut,
			linkNames = [],
			xminFull, xmaxFull, yminFull, ymaxFull,
			extentFull,
			wkid,
			manageScreenState,
			linkInset,
			insetArray = {},
			isFullscreen = false;
	
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
			map.vWkid = wkid,
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
				isPanArrows: true,
				fitExtent:false
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
					
					// set true to fire to know map have been updated (it will not fire the extent change event)
					link.fire = true;
				}
			}
		};
		
		connectLinkEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target,
					id = target.id.split('_')[0],
					len,
					link,
					index,
					flag,
					reset;
				
				// find if the map as already fire the extent-change event
				len = linkNames.length;
				while (len--) {
					link = linkNames[len];
						
					if (link.name === id)
					{
						index = len;
						flag = link.fire;
					}
				}

				// if exent-change has not been fire, do it
				if (!flag && !isFullscreen) {
					// check if the extent is outside full extent
					checkRestrictExtent(target, evt.extent);
					
					// apply link
					linkNames[index].fire = true;
					setTimeout(function() { applyLink(id); }, 1000);
				}
				
				// if all value are true, its mean the extent-change have run trought all maps so reset values
				if (func.checkObjectValue(linkNames, 'fire', true)) {
					len = linkNames.length;
					
					while (len--) { linkNames[len].fire = false; }
				}
			}, 1000, false));
		};
		
		connectEvent = function(map) {
			map.on('extent-change', func.debounce(function(evt) {
				var target = evt.target;

				// check if the extent is outside full extent
				checkRestrictExtent(target, evt.extent);
				
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

		checkRestrictExtent = function(mymap, extent) {
			var outBoundXmin = false, outBoundXmax = false, outBoundYmin = false, outBoundYmax = false,
				xminOri = parseInt(extent.xmin, 10), xmaxOri = parseInt(extent.xmax, 10), yminOri = parseInt(extent.ymin, 10), ymaxOri = parseInt(extent.ymax, 10),
				xmin = xminOri, xmax = xmaxOri, ymin = yminOri, ymax = ymaxOri,
				outExtent = null;
			
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
				//outExtent = new esri.geometry.Extent({'xmin': xmin, 'ymin': ymin, 'xmax': xmax, 'ymax': ymax, 'spatialReference': {'wkid': mymap.vWkid}});
			}
			
			return outExtent;
		};

		linkInset = function(map) {
			var len = map.vInsetId.length,
				insetMap,
				inset;
			
			while (len--) {
				insetMap = insetArray[map.vInsetId[len]];
				zoomMapCenter(insetMap, getMapCenter(map));
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

		manageScreenState = function(map, interval, fullscreen) {
			var extent = map.extent;
			isFullscreen = fullscreen;
			
			resizeMap(map);
			setTimeout(function() {
				map.setExtent(extent);
			}, interval);
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