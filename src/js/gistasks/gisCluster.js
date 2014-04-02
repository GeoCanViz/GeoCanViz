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
			'esri/tasks/QueryTask',
			'esri/tasks/query',
			'dojo/request',
			'esri/request',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/renderers/ClassBreaksRenderer',
			'esri/renderers/jsonUtils'
			], function($aut, cluster, esriQueryTask, esriQuery, dojoRequest, esriRequest, esriMarker, esriRender, esriJsonUtil) {

		var setCluster,
			startCluster,
			createCluster;

		startCluster = function(map, layerInfo) {
			var urlIn = layerInfo.url,
				url = urlIn.substring(0, urlIn.indexOf('MapServer/')) + 'MapServer/layers';
			
			esriRequest({
				url: url,
				content: { f: 'json' },
				handleAs: 'json',
				callbackParamName: 'callback',
				load: function(response, io) {
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
				load: function(response, io) {
					var feat, geom,
						inputInfo = [],
						features = response.features,
						len = features.length;
					
					while (len--) {
						feat = features[len];
						geom = feat.geometry;
						inputInfo.push ({ attributes: feat.attributes, x: geom.x, y: geom.y });
					}
					
					createCluster(map, response.spatialReference.wkid, rendererInfo, layerInfo, inputInfo);
				},
				error: function(err) { console.log('cluster info error: ' + err); }
			});
		};
		
		createCluster = function(map, sr, renderJSON, layerInfo, data) {
			var clusterLayer,
				clusterInfo = layerInfo.cluster,
				len = data.length,
				renderer = esriJsonUtil.fromJson(renderJSON);
			
			if (clusterInfo.symbol === 1) {
				renderer = null;
			}
			
			clusterLayer = new cluster({
				'data': data,
				'renderer': renderer,
				'distance': clusterInfo.distance,
				'id': layerInfo.id,
				'label': clusterInfo.label,
				'spatialReference': sr,
			});

			map.addLayer(clusterLayer);
		};

		return {
			startCluster: startCluster
		};
	});
}());
