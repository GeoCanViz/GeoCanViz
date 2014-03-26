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

		var getClusterInfo,
			getRenderer,
			createCluster,
			getClusterFormat;

		getClusterInfo = function(map, layer) {
			// set dirty as date to avoid bug with request. If we do the same sequest twice it throws error.
			// this is solve in ArcGIS server SP2.
			var url = layer.url + '0/query?where=OBJECTID+>+0&outFields=AGE&dirty=' + (new Date()).getTime();
			
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
					
					getRenderer(map, inputInfo);
				},
				error: function() {}
			});
		};

		getRenderer = function(map, inputInfo) {
			esriRequest({
				url: 'http://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCC/Geochronology/MapServer/layers',
				content: { f: 'json' },
				handleAs: 'json',
				callbackParamName: 'callback',
				load: function(response, io) {
					createCluster(map, response.layers[0].drawingInfo.renderer, inputInfo);
				},
				error: function() {}
			});
		};
		
		createCluster = function(map, renderJSON, data) {
			var clusterLayer,
				len = data.length,
				renderer = esriJsonUtil.fromJson(renderJSON);;
					
			// https://github.com/odoe/esri-clusterfeaturelayer
			// https://developers.arcgis.com/javascript/jssamples/layers_point_clustering.html
			clusterLayer = new cluster({
				'url': 'http://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCC/Geochronology/MapServer/0',
				'data': data,
				'distance': 100,
				'id': 'clusters',
				'returnLimit': len,
				'labelColor': '#000',
				'resolution': map.extent.getWidth() / map.width,
				'singleColor': '#888',
				'useDefaultSymbol': true, 
				'spatialReference': 3978,
				'zoomOnClick': false,
				'maxSingles': len,
				'singleRenderer': renderer,
				'outFields': ['AGE']
			});
		            
		            var defaultSym = new esriMarker().setSize(4);
            		var renderer = new esriRender(defaultSym, "clusterCount");

					var small = new esri.symbol.SimpleMarkerSymbol('circle', 20,
                        new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SOLID, new dojo.Color([255,191,0,0.25]), 100),
                        new dojo.Color([255,191,0,0.75]));
                    
                    var medium = new esri.symbol.SimpleMarkerSymbol('circle', 30,
                        new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SOLID, new dojo.Color([148,0,211,0.25]), 15),
                        new dojo.Color([148,0,211,0.75]));
                        
                    var large = new esri.symbol.SimpleMarkerSymbol('circle', 50,
                        new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SOLID, new dojo.Color([255,0,0,0.25]), 15),
                        new dojo.Color([255,0,0,0.75]));
                        
		            renderer.addBreak(2, 100, small);
		            renderer.addBreak(100, 2000, medium);
		            renderer.addBreak(2000, len, large);
            		clusterLayer.setRenderer(renderer);
            		
		            map.addLayer(clusterLayer);
		};
		
		getClusterFormat = function(url, success) {
			var query = new esriQuery(),
				queryTask = new esriQueryTask(url);
				
			// set query params
			query.returnGeometry = true;
			query.where = 'OBJECTID>0';
			query.outFields = ['*'];

			queryTask.on('complete', function(response) {
				var feat, geom,
						inputInfo = [],
						features = response.featureSet.features,
						len = features.length;
					
					while (len--) {
						feat = features[len];
						geom = feat.geometry;
						inputInfo.push ({ attributes: feat.attributes, x: geom.x, y: geom.y });
					}
				
				success(inputInfo);
			});
			queryTask.execute(query);
		};
		
		return {
			getClusterInfo: getClusterInfo,
			getClusterFormat: getClusterFormat
		};
	});
}());
