/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS Legend functions
 */
(function () {
	'use strict';
	define(['esri/request',
			'esri/renderers/Renderer'
	], function(Request, Renderer) {
		var setLayerVisibility,
			getLegend,
			getLegendResultsSucceeded,
			getLegendResultsFailed,
			getFeatureLayerSymbol,
			changeServiceVisibility,
			setLayerOpacity;
			
		esri.config.defaults.io.proxyUrl = "../../proxy.ashx";
		esri.config.defaults.io.alwaysUseProxy = false;

		setLayerVisibility = function(mymap, selectedLayer, visState) {
			var layer = mymap.getLayer(selectedLayer);
			console.log(layer);
			layer.setVisibility(visState);
		};
		
		getFeatureLayerSymbol = function(layer) {
			/**	var r = layer.renderer;
    			console.log(r.infos);
    		}**/   		
		};

		getLegend = function(serviceDetails, version) { 
         	var serviceUrl = serviceDetails.service,
         		legendUrl;

         	if (version >= 10.01) {
         		legendUrl = serviceUrl +'/legend';
         	} else {
         		legendUrl= 'http://www.arcgis.com/sharing/tools/legend' + '?soapUrl' + escape(serviceUrl);
         	}
         	
         	console.log(legendUrl);
         	
            var request = Request({
  				'url': legendUrl,
  				'content': { 
  					f: 'json'
  				},
  				'handleAs': 'json'
        	});
        	
        	request.then(getLegendResultsSucceeded, getLegendResultsFailed);
         };
        
        getLegendResultsSucceeded = function(response, io) {
           	console.log(response);
		 };
        
         getLegendResultsFailed = function(error, io) {
			console.log('fail');
		 };
	
		return {
			setLayerVisibility: setLayerVisibility,
			getFeatureLayerSymbol:getFeatureLayerSymbol,
			changeServiceVisibility: changeServiceVisibility
		};
	});
}());