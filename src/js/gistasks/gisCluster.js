/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS request functions
 */
(function () {
	'use strict';
	define(['jquery-private',
			'cluster',
			'gcviz-gisgeo',
			'esri/request',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/renderers/ClassBreaksRenderer',
			'esri/renderers/jsonUtils',
			'esri/geometry/Point',
			'esri/SpatialReference'
	], function($viz, cluster, gisGeo, esriRequest, esriMarker, esriRender, esriJsonUtil, esriPoint, esriSR) {
		var setCluster,
			startCluster,
			createCluster,
			params = {};

		startCluster = function(map, layerInfo) {
			var urlIn = layerInfo.url,
				url = urlIn.substring(0, urlIn.indexOf('MapServer/')) + 'MapServer/layers';

			esriRequest({
				url: url,
				content: { f: 'json' },
				handleAs: 'json',
				callbackParamName: 'callback',
				load: function(response) {
					setCluster(map, layerInfo, response.layers[0].drawingInfo.renderer);
				},
				error: function(err) { console.log('renderer info error: ' + err); }
			});
		};

		setCluster = function(map, layerInfo, rendererInfo) {
			var url;

			// set dirty as date to avoid bug with request. If we do the same sequest twice it throws error.
			// this is solve in ArcGIS server SP2.
			// TODO get fields from layerInfo, all fields is too much for parsing
			url = layerInfo.url + '0/query?where=OBJECTID+>+0&outFields=AGE&dirty=' + (new Date()).getTime();

			esriRequest({
				url: url,
				content: { f: 'json' },
				handleAs: 'json',
				callbackParamName: 'callback',
				load: function(response) {
					var feat, geom, point,
						inputInfo = [],
						mapSr = map.spatialReference.wkid,
						dataSr = response.spatialReference.wkid,
						features = response.features,
						len = features.length;

					while (len--) {
						feat = features[len];
						geom = feat.geometry;
						point = new esriPoint(geom.x, geom.y, new esriSR({ 'wkid': dataSr }));
						point.attributes = feat.attributes,
						inputInfo.push (point);
					}

					// set params to use in create cluster. We do this because createCluster
					// can be call as a callback after the reprojection
					params = { map: map,
						renderJSON: rendererInfo,
						layerInfo: layerInfo
					};

					// check if we need to reproject geometries
					if (mapSr !== dataSr) {
						gisGeo.projectPoints(inputInfo, mapSr, createCluster);
					} else {
						createCluster(inputInfo);
					}
				},
				error: function(err) { console.log('cluster info error: ' + err); }
			});
		};

		createCluster = function(data) {
			var clusterLayer,
				map = params.map,
				layerInfo = params.layerInfo,
				clusterInfo = layerInfo.cluster,
				renderer = esriJsonUtil.fromJson(params.renderJSON);

			if (clusterInfo.symbol === 1) {
				renderer = null;
			}

			clusterLayer = new cluster({
				'data': data,
				'renderer': renderer,
				'distance': clusterInfo.distance,
				'id': layerInfo.id,
				'label': clusterInfo.label,
				'maxSizeProp': clusterInfo.maxSizeProp,
				'maxDataProp': clusterInfo.maxDataProp,
				'spatialReference': map.spatialReference
			});

			map.addLayer(clusterLayer);
			params = {};
			
			// reorder layer to make sure graphic one is on top
			map.reorderLayer(map.getLayer('gcviz-symbol'), 1000);
		};

		return {
			startCluster: startCluster
		};
	});
}());
