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
	define(['jquery-private',
			'kineticpanning',
			'gcviz-func',
			'dijit/Menu',
			'dijit/MenuItem',
			'dijit/PopupMenuItem',
			'gcviz-gislegend',
			'gcviz-giscluster',
			'esri/config',
			'esri/map',
			'esri/layers/FeatureLayer',
			'esri/layers/ArcGISTiledMapServiceLayer',
			'esri/layers/ArcGISDynamicMapServiceLayer',
			'esri/layers/ArcGISImageServiceLayer',
			'esri/layers/WebTiledLayer',
			'esri/layers/WMSLayer',
			'esri/layers/WMSLayerInfo',
			'esri/layers/ImageParameters',
			'esri/geometry/Extent',
			'esri/geometry/Point',
			'esri/IdentityManager'
	], function($viz, kpan, func, menu, menuItem, menupopup, gisLegend, gisCluster, esriConfig, esriMap, esriFL, esriTiled, esriDyna, esriImage, webTiled, wms, wmsInfo, esriDynaLD, esriExt, esriPoint) {
		var mapArray = {},
			setProxy,
			createMap,
			createInset,
			applyLink,
			setPanScaleLink,
			connectLinkEvent,
			connectEvent,
			extentMapEvent,
			addLayer,
			setScaleInfo,
			resizeMap,
			resizeCenterMap,
			zoomPoint,
			zoomFeature,
			zoomGraphics,
			zoomExtent,
			getMapCenter,
			createMapMenu,
			zoomIn,
			zoomOut,
			panLeft,
			panUp,
			panRight,
			panDown,
			showInfoWindow,
			hideInfoWindow,
			getKeyExtent,
			getOverviewLayer,
			linkNames = [],
			manageScreenState,
			linkInset,
			insetArray = {},
			isFullscreen,
			linkCount,
			noLink = false;

		setProxy = function(url) {
			// set proxy for esri request (https://github.com/Esri/resource-proxy)
			// proxy needs to be in the same domain
			esriConfig.defaults.io.proxyUrl = url;
			esriConfig.defaults.io.alwaysUseProxy = false;
		};

		createMap = function(id, config, side) {
			var lod, mapUpdate,
				iExtent = config.extentinit,
				fExtent = config.extentmax,
				wkid = config.sr.wkid,
				initExtent = new esriExt({ 'xmin': iExtent.xmin, 'ymin': iExtent.ymin,
										'xmax': iExtent.xmax, 'ymax': iExtent.ymax,
										'spatialReference': { 'wkid': wkid } }),
				fullExtent = new esriExt({ 'xmin': fExtent.xmin, 'ymin': fExtent.ymin,
										'xmax': fExtent.xmax, 'ymax': fExtent.ymax,
										'spatialReference': { 'wkid': wkid } }),
				initLods = config.lods.values.reverse(),
				lenLods = initLods.length,
				lods = [],
				options,
				map,
				mapid = id.split('_')[0],
				panning;

			// generate level of details
			while (lenLods--) {
				lod = initLods[lenLods];
				if (lod.check) {
					lods.push(lod);
				}
			}

			// set options
			if (lods.length) {
				options = {
					extent: initExtent,
					spatialReference: { 'wkid': wkid },
					logo: false,
					showAttribution: false,
					lods: lods,
					wrapAround180: true,
					smartNavigation: false
				};

				if (config.zoombar.bar) {
					options.slider = true;
					options.sliderPosition = side === 1 ? 'top-left' : 'top-right';
					options.sliderStyle = 'large';
				}
			} else {
				options = {
					extent: initExtent,
					spatialReference: { 'wkid': wkid },
					logo: false,
					showAttribution: false,
					wrapAround180: true,
					smartNavigation: false
				};
			}

			map = new esriMap(id, options);
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
			map.vSideMenu = side;

			// resize the map on load to ensure everything is set correctly.
			// if we dont do this, every maps after the first one are not set properly
			map.on('load', function() {
				map.resize();

				// enable navigation (do not enable keyboard navigation,
				// this is made with custom events)
				map.enableScrollWheelZoom();
				map.disableDoubleClickZoom();

				// disable keyboard navigation. We overwrite the keyboard navigation in mapVM
				map.disableKeyboardNavigation();

				// because IE will tab svg tag we need to set them focusable = false
				$viz('.gcviz-section').find('svg').attr('tabindex', -1).attr('focusable', false);

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

			// remove loading image when map has updated
			mapUpdate = map.on('update-end', function() {
				func.destroyProgressBar();
				mapUpdate.remove();
			});

			return map;
		};

		createInset = function(id, config, masterId) {
			var extentC = config.extent,
				wkid = config.sr.wkid,
				extent = new esriExt({ 'xmin': extentC.xmin, 'ymin': extentC.ymin,
									'xmax': extentC.xmax, 'ymax': extentC.ymax,
									'spatialReference': { 'wkid': wkid } }),
				map,
				panning;

			map = new esriMap(id, {
				extent: extent,
				spatialReference: { 'wkid': wkid },
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

			// resize the map on load to ensure everything is set correctly.
			// if we dont do this, every maps after the first one are not set properly
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
							map.vDeltaX = (Math.abs(map.extent.xmax) -
										Math.abs(map.extent.xmin)) / 2;
							map.vDeltaY = (Math.abs(map.extent.ymax) -
										Math.abs(map.extent.ymin)) / 2;
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
				insetMap;

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
				extent = new esriExt({ 'xmin': mapCenter.x - insetMap.vDeltaX, 'ymin': mapCenter.y - insetMap.vDeltaY,
									'xmax': mapCenter.x + insetMap.vDeltaX, 'ymax': mapCenter.y + insetMap.vDeltaY,
									'spatialReference': { 'wkid': map.spatialReference.wkid } });

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

		extentMapEvent = function(map, funct) {
			map.on('extent-change', func.debounce(function() {
				funct(map.extent);
			}, 500, false));
		};

		addLayer = function(map, layerInfo) {
			var layer, layerDef,
				options,
				resourceInfo,
				type = layerInfo.type;

			if (type === 1) {
				// TODO add WMTS functions
			} else if (type === 2) {
				layer = new esriTiled(layerInfo.url, { 'id': layerInfo.id });
			} else if (type === 3) {
				options = layerInfo.options;
				resourceInfo = {
					extent: map.extent,
					layerInfos: options.layerinfos
				};

				layer = new wms(layerInfo.url, {
					resourceInfo: resourceInfo,
					visibleLayers: options.visiblelayers,
					'id': layerInfo.id
				});
			} else if (type === 4) {
				// create empty definition query to use for tables
				layerDef = new esriDynaLD();
				layerDef.layerDefinitions = [''];

				layer = new esriDyna(layerInfo.url, { 'id': layerInfo.id, 'imageParameters': layerDef });
			} else if (type === 5) {
				layer = new esriFL(layerInfo.url, {
					mode: esriFL.MODE_ONDEMAND,
					outFields: ['*'],
					id: layerInfo.id
				});
			} else if (type === 6) {
				// cluster layer
				gisCluster.startCluster(map, layerInfo);
			}

			// cluster layer is added in gisCluster class
			if (type !== 6) {
				map.addLayer(layer);

				// set scale info
				setScaleInfo(map, layerInfo, type);
			}
		};

		setScaleInfo = function(map, layerInfo, type) {
			var $leg, layerScale, mapScale,
				scale = layerInfo.scale,
				min = scale.min,
				max = scale.max;

			// set scale (we need to pass the map because the scale is not properly set at this stage)
			layerScale = map.getLayer(layerInfo.id);
			mapScale = map.getScale();

			// if not WMS, use the on load event to setup. If WMS, use another because the load event is not fired.
			if (type !== 3) {
				layerScale.myMap = map;
				layerScale.on('load', function() {
					var $leg,
						min = scale.min,
						max = scale.max,
						mapScale = layerScale.myMap.getScale();
	
					// set scales
					layerScale.minScale = min;
					layerScale.maxScale = max;
	
					// remove mymap
					delete layerScale.myMap;
	
					// set scale class. We need to do this because the event
					// scale-visibility havent been fired.
					if (min !== 0 || max !== 0) {
						if (min < mapScale && mapScale > max) {
							$leg = $viz('#' + layerInfo.id);
							$leg.addClass('gcviz-leg-dis');
						}
					}
				});
			} else {
				// set scales
				layerScale.minScale = min;
				layerScale.maxScale = max;
				
				// set scale class. We need to do this because the event
				// scale-visibility havent been fired. We put a timeout because
				// we cant use the load event
				if (min !== 0 || max !== 0) {
					if (min < mapScale && mapScale > max) {
						setTimeout(function() {
							$leg = $viz('#' + layerInfo.id);
							$leg.addClass('gcviz-leg-dis');
						}, 2000);
					}
				}
			}
			
			// set event to know when layer is outside scale
			layerScale.on('scale-visibility-change', function() {
				var $leg = $viz('#' + layerInfo.id);

				if (layerScale.visibleAtMapScale) {
					$leg.removeClass('gcviz-leg-dis');
				} else {
					$leg.addClass('gcviz-leg-dis');
				}
			});
		};

		getOverviewLayer = function(configoverviewtype, configoverviewurl) {
			var bLayer;
			if (configoverviewtype === 1) { // WMTS service
				bLayer = new webTiled(configoverviewurl);
			} else if (configoverviewtype === 2) { // tiled service
				bLayer = new esriTiled(configoverviewurl);
			} else if (configoverviewtype === 4) { // dynamic service
				bLayer = new esriDyna(configoverviewurl);
			} else if (configoverviewtype === 7) { // image service
				bLayer = new esriImage(configoverviewurl);
			} else if (configoverviewtype === 8) { // Virtual Earth service
				// bLayer = new esriImage(configoverviewurl);
			// } else if (configoverviewtype === 9) { // Open Street Map service
				// bLayer = new esriImage(configoverviewurl);
			}
			return bLayer;
		};

		resizeMap = function(map) {
			map.resize();
			map.reposition();
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

		zoomFeature = function(map, feature) {
			var pt, lods, len,
				geom = feature.geometry,
				type = geom.type,
				factor = 0.25;

			if (type === 'point') {
				// if lods is define, use level
				lods = map._params.lods,
				len = lods.length;
				if (len > 0) {
					factor = lods[len - 5].level;
					map.setLevel(factor);
				} else {
					map.setZoom(factor);
				}

				// there is a bug with the API with centerAtZoom. It only work the first few times.
				// to avoid this, we use centerAt then zoom to the geometry.
				pt = new esriPoint(geom.x, geom.y, map.vWkid);
				map.centerAt(pt);
			} else {
				map.setExtent(geom.getExtent().expand(2));
			}
		};

		zoomGraphics = function(map, graphics) {
			// get the extent then zoom
			var extent = esri.graphicsExtent(graphics); // can't load AMD
			map.setExtent(extent.expand(1.75));
		};

		zoomExtent = function(map, extent, json) {
			var mapExtent;

			if (json) {
				mapExtent = new esriExt(extent);
			}

			map.setExtent(mapExtent);
		};

		getMapCenter = function(map) {
			var extent,
				point;

			extent = map.extent;
			point = new esriPoint((extent.xmin + extent.xmax) / 2,
								(extent.ymin + extent.ymax) / 2, map.vWkid);

			return point;
		};

		manageScreenState = function(map, interval, fullscreen) {
			// get extent before the resize then resize
			var extent = map.extent;
			isFullscreen = fullscreen;

			// set no link to true to avoid link inset on extent-change
			// after the resize if fullscreen
			if (fullscreen) {
				noLink = true;
			}
			resizeMap(map);

			// wait for the resize to finish then set extent 
			// (cant use resize event because it is trigger before it is finish)
			setTimeout(function() {
				map.setExtent(extent);
			}, interval);
		};

		// USE JQUERY.UI-contextmenu INSTEAD OF DOJO!!!
		createMapMenu = function() {
			// Creates right-click context menu for map
			var ctxMenuMap = new menu({
				targetNodeIds: ['gcviz-header']
				// onOpen: function(box) {
				// // Lets calculate the map coordinates where user right clicked.
				// //currentLocation = getMapPointFromMenuPosition(box);
				// }
			});

			ctxMenuMap.addChild(new menuItem({
				label: 'Add Point',
				onClick: function() {
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
				factorPan = 3,
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

			extent = new esriExt({ 'xmin': xmin, 'ymin': ymin,
								'xmax': xmax, 'ymax': ymax,
								'spatialReference': { 'wkid': map.spatialReference.wkid } });

			return extent;
		};

		// we use this function to show a popup when the user zoom to a location
		showInfoWindow = function(map, title, content, geom, offX, offY) {
			// check if we need to set the anchor to left (see where is the menu)
			var layer, graphics, graphic, len, point, screenPnt,
				btn = $viz('.esriPopupWrapper').find('.gcviz-wcag-close'),
				anchor = (map.vSideMenu !== 1) ? 'upperright' : 'upperleft';

			// if no geom value get the point where to put the window as the map center
			// If there is a string get the point from the graphic with this key.
			//if the geom is a geometry, use it directly
			if (typeof geom === 'undefined') {
				point = getMapCenter(map);
			} else if (typeof geom === 'string') {
				// grab graphic from key
				layer = map.getLayer('gcviz-symbol');
				graphics = layer.graphics;
				len = graphics.length;

				while (len--) {
					graphic = graphics[len];
					if (graphic.key === geom) {
						point = graphic.geometry;
					}
				}
			} else {
				point = geom;
			}

			map.infoWindow.setTitle(title);
			map.infoWindow.setContent('<span>' + content + '</span>');
			map.infoWindow.anchor = anchor;

			// move a little the window
			screenPnt = map.toScreen(point);
			screenPnt.x = (anchor === 'upperright') ? screenPnt.x + offX : screenPnt.x - offX;
			screenPnt.y += offY;
			map.infoWindow.show(screenPnt);

			// set focus on close button
			btn.focus();
		};

		hideInfoWindow = function(map, key) {
			var layer, graphics, graphic, len;

			// if there is a key, remove graphics with those values
			if (typeof key !== 'undefined') {
				layer = map.getLayer('gcviz-symbol');
				graphics = layer.graphics;
				len = graphics.length;

				while (len--) {
					graphic = graphics[len];

					if (key === graphic.key) {
						layer.remove(graphic);
					}
				}
			}

			// hide window
			map.infoWindow.hide();

			// focus the map
			func.focusMap(map, false);
		};

		return {
			setProxy: setProxy,
			createMap: createMap,
			createInset: createInset,
			addLayer: addLayer,
			setScaleInfo: setScaleInfo,
			extentMapEvent: extentMapEvent,
			resizeMap: resizeMap,
			resizeCenterMap: resizeCenterMap,
			zoomPoint: zoomPoint,
			zoomFeature: zoomFeature,
			zoomGraphics: zoomGraphics,
			zoomExtent: zoomExtent,
			getOverviewLayer: getOverviewLayer,
			getMapCenter: getMapCenter,
			manageScreenState: manageScreenState,
			createMapMenu: createMapMenu,
			zoomIn: zoomIn,
			zoomOut: zoomOut,
			panLeft: panLeft,
			panUp: panUp,
			panRight: panRight,
			panDown: panDown,
			showInfoWindow: showInfoWindow,
			hideInfoWindow: hideInfoWindow
		};
	});
}());
