/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS map functions
 */
/* global esri: false */
(function () {
	'use strict';
	define(['kineticpanning',
			'gcviz-func',
			'dijit/Menu',
			'dijit/MenuItem',
			'dijit/PopupMenuItem',
			'gcviz-gislegend',
			'esri/map',
			'esri/layers/FeatureLayer',
			'esri/layers/ArcGISTiledMapServiceLayer',
			'esri/layers/ArcGISDynamicMapServiceLayer',
			'esri/geometry/Extent',
			'esri/geometry/Point'
			], function(kpan, func, menu, menuItem, menupopup, gisLegend) {
	
		var mapArray = {},
			createMap,
			createInset,
			applyLink,
			setFactorLink,
			setPanScaleLink,
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
			panLeft,
			panUp,
			panRight,
			panDown,
			getKeyExtent,
			linkNames = [],
			wkid,
			manageScreenState,
			linkInset,
			insetArray = {},
			isFullscreen,
			linkCount,
			noLink = false;
	
		createMap = function(id, config, fullExtent) {
			var initExtent = config.extent,
				wkid = config.sr.wkid,
				initExtent = new esri.geometry.Extent({'xmin': initExtent.xmin, 'ymin': initExtent.ymin, 'xmax': initExtent.xmax, 'ymax': initExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				fullExtent = new esri.geometry.Extent({'xmin': fullExtent.xmin, 'ymin': fullExtent.ymin, 'xmax': fullExtent.xmax, 'ymax': fullExtent.ymax, 'spatialReference': {'wkid': wkid}}),
				lod = config.lods,
				options,
				map,
				mapid = id.split('_')[0],
				panning;
			
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
			mapArray[mapid] = map;
			
			// add kinetic panning
			panning = new kpan(map);
			panning.enableMouse();
			
			// add value to map object
			map.vInitExtent = initExtent;
			map.vFullExtent = fullExtent;
			map.vIdName = mapid;
			map.vWkid = wkid;
			map.vInsetId = [];
			
			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
				map.resize();
							
				// enable navigation (do not enable keyboard navigation, this is made with custom events)
				map.enableScrollWheelZoom();
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

			//LM
			map.on('layer-add-result', function(e) { 
				
				if(e.layer.renderer) //no renderer for tiles map services
					gisLegend.getFeatureLayerSymbol(e.layer);

			});

			return map;
		};
		
		createInset = function(id, config, masterId) {
			var extentC = config.extent,
				wkid = config.sr.wkid,
				extent = new esri.geometry.Extent({'xmin': extentC.xmin, 'ymin': extentC.ymin, 'xmax': extentC.xmax, 'ymax': extentC.ymax, 'spatialReference': {'wkid': wkid}}),
				map,
				panning;
				
			map = new esri.Map(id, {
				extent: extent,
				spatialReference: {'wkid': wkid},
				logo: false,
				showAttribution: false,
				smartNavigation: false
			});
			
			// add kinetic panning
			panning = new kpan(map);
			panning.enableMouse();
			
			// add value to map object
			map.vWkid = wkid;
			map.vType = config.type;
			
			// resize the map on load to ensure everything is set correctly. if we dont do this, every maps after
			// the first one are not set properly
			map.on('load', function() {
				map.resize();
				map.disableMapNavigation();
							
				if (config.type !== 'static') {
					// add inset link to master map
					mapArray[masterId].vInsetId.push(map.id);
					insetArray[id] = map;
					
					if (config.typeinfo.pan) {
						map.enablePan();
					}
					
					if (config.type === 'panscale') {
						map.vLod = config.typeinfo.lod;
						map.setLevel(map.vLod);
						setTimeout(function() {
							map.vDeltaX = (Math.abs(map.extent.xmax) - Math.abs(map.extent.xmin)) / 2;
							map.vDeltaY = (Math.abs(map.extent.ymax) - Math.abs(map.extent.ymin)) / 2;
						}, 1000);
						
					}
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
		
		linkInset = function(map) {
			var len = map.vInsetId.length,
				insetMap,
				inset;
			
			while (len--) {
				insetMap = insetArray[map.vInsetId[len]];
				
				if (insetMap.vType === 'panscale') {
					setPanScaleLink(map, insetMap);
				} else if (insetMap.vType === 'link') {
					insetMap.setExtent(map.extent);
				}
			}
		};
		
		setPanScaleLink = function(map, insetMap) {
			var mapCenter = getMapCenter(map),
				extent = new esri.geometry.Extent({'xmin': mapCenter.x - insetMap.vDeltaX, 'ymin': mapCenter.y - insetMap.vDeltaY, 'xmax': mapCenter.x + insetMap.vDeltaX, 'ymax': mapCenter.y + insetMap.vDeltaY, 'spatialReference': {'wkid': map.spatialReference.wkid}});

				insetMap.setExtent(extent);
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
				
				// check if inset needs to be resize
				if (!noLink) { linkInset(target); }
				noLink = false;
				
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
				if (!noLink) { linkInset(target); }
				noLink = false;
			}, 1000, false));
		};
		
		addLayer = function(map, type, url, layerid) {
			if (type === 'tiled') {
				map.addLayer(new esri.layers.ArcGISTiledMapServiceLayer(url, { 'id': layerid }));
			} else if (type === 'dynamic') {
				map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(url, { 'id': layerid }));
			} else if (type === 'feature') {
				map.addLayer(new esri.layers.FeatureLayer(url, {
					mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
      				outFields: ["*"],
      				id: layerid
				}));
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
			
			// set no link to true to avoid link inset on extent-change after the resize if fullscreen
			if (fullscreen) { noLink = true; }
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
        
		zoomIn = function(map) {
			map.setExtent(getKeyExtent(map, 'in'));
		};
			
		zoomOut = function(map) {
			map.setExtent(getKeyExtent(map, 'out'));
		};
		
		panLeft = function(map) {
			map.setExtent(getKeyExtent(map, 'left'));
		};
		
		panUp = function(map) {
			map.setExtent(getKeyExtent(map, 'up'));
		};
		
		panRight = function(map) {
			map.setExtent(getKeyExtent(map, 'right'));
		};
		
		panDown = function(map) {
			map.setExtent(getKeyExtent(map, 'down'));
		};
		
		getKeyExtent = function(map, direction) {
			var extent = map.extent,
				factorPan = 2,
				factorZoom = 4,
				delta,
				xmin = extent.xmin,
				xmax = extent.xmax,
				ymin = extent.ymin,
				ymax = extent.ymax;
			
			if (direction === 'up') {
				delta = (ymax - ymin) / factorPan;
				ymin = ymin - delta;
				ymax = ymax - delta;
			} else if (direction === 'down') {
				delta = (ymax - ymin) / factorPan;
				ymin = ymin + delta;
				ymax = ymax + delta;
			} else if (direction === 'left') {
				delta = (xmax - xmin) / factorPan;
				xmin = xmin - delta;
				xmax = xmax - delta;
			} else if (direction === 'right') {
				delta = (xmax - xmin) / factorPan;
				xmin = xmin + delta;
				xmax = xmax + delta;
			} else if (direction === 'in') {
				delta = (xmax - xmin) / factorZoom;
				xmin = xmin + delta;
				xmax = xmax - delta;
				delta = (ymax - ymin) / factorZoom;
				ymin = ymin + delta;
				ymax = ymax - delta;
			} else if (direction === 'out') {
				delta = (xmax - xmin) / factorZoom;
				xmin = xmin - delta;
				xmax = xmax + delta;
				delta = (ymax - ymin) / factorZoom;
				ymin = ymin - delta;
				ymax = ymax + delta;
			}
			
			extent = new esri.geometry.Extent({'xmin': xmin, 'ymin': ymin, 'xmax': xmax, 'ymax': ymax, 'spatialReference': {'wkid': map.spatialReference.wkid}});

			return extent;
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
			createMapMenu: createMapMenu,
			zoomIn: zoomIn,
			zoomOut: zoomOut,
			panLeft: panLeft,
			panUp: panUp,
			panRight: panRight,
			panDown: panDown
		};
	});
}());