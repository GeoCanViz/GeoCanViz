/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS Legend functions
 */
/* global esri: false */
(function () {
	'use strict';
	define(['jquery-private',
            "esri/request",
			"esri/renderers/Renderer",
			"dojo/dom-construct",
			"esri/symbols/jsonUtils",
			"dojox/gfx", 
			"dojo/dom",
            "dojo/dom-style"
			], function($viz, Request, Renderer, domConstruct, jsonUtils, gfx, dom, domStyle) {
		var setLayerVisibility,
			getLegend,
			getLegendResultsSucceeded,
			getLegendResultsFailed,
			getFeatureLayerSymbol,
			changeServiceVisibility,
            createSymbols,
            createSVGSurface,
			setLayerOpacity;
			
		esri.config.defaults.io.proxyUrl = "../../proxy.ashx";
		esri.config.defaults.io.alwaysUseProxy = false;

		setLayerVisibility = function(mymap, selectedLayer, visState) {

			var layer = mymap.getLayer(selectedLayer);
			layer.setVisibility(visState);
		};
		
		getFeatureLayerSymbol = function(layer) {
			var mySurface,descriptors,shape, aFields, ren;
			ren = layer.renderer;

            if(ren.infos)
            { //unique renderer, class break renderer
                    var legs = ren.infos;
                if (ren.defaultSymbol && legs.length > 0 && legs[0].label !== '[all other values]') {
                     // add to front of array
                    legs.unshift({
                      label: '[all other values]',
                      symbol: ren.defaultSymbol
                    });
                }
              
              //fields symbology is based on
              aFields = ren.attributeField + (ren.normalizationField ? '/' + ren.normalizationField : '');
              aFields += (ren.attributeField2 ? '/' + ren.attributeField2 : '') + (ren.attributeField3 ? '/' + ren.attributeField3 : '');
              //var anode = domConstruct.create('div', {id:"featureLayerSymbol" + layer.id, class:'legendUnqiueFieldHolderDiv'});
              //anode.innerHTML = aFields;
              
              var anode = '<div id="featureLayerSymbol'+layer.id+'" class="legendUnqiueFieldHolderDiv">';
              anode += aFields;
              anode += '</div>';
             

              //need a spot in div for each renderer
              domConstruct.place(anode, dom.byId("featureLayerSymbol" + layer.id));
              //domConstruct.place(dojo.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
              domConstruct.place(dom.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
              var nodeList = [];
             
               $viz.each(legs, function( key, value ) {
                  var nodeImage = domConstruct.create('div', {'class': 'legendSymbolDiv'});
                  var nodeLabel = domConstruct.create('span', {'class': 'LegendUniqueValueSpan'});
                  var descriptors = jsonUtils.getShapeDescriptors(value.symbol);
                  
                  mySurface = createSVGSurface(value, nodeImage);
                  shape = mySurface.createShape(descriptors.defaultShape);
              
                  createSymbols(descriptors, shape, value);
                  nodeLabel.innerHTML = value.label;
                 
                  domConstruct.place(nodeImage, dom.byId("featureLayerSymbol" + layer.id));
                  domConstruct.place(nodeLabel, dom.byId("featureLayerSymbol" + layer.id));
                  //domConstruct.place(dojo.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
                  domConstruct.place(dom.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
               });
             
            }
            else
            {
                //picture marker, simple marker
                if (ren.symbol){

                 descriptors = jsonUtils.getShapeDescriptors(ren.symbol);
                 mySurface = createSVGSurface(ren, "featureLayerSymbol" + layer.id );
                 shape = mySurface.createShape(descriptors.defaultShape);
                 createSymbols(descriptors, shape, ren);

                }
            }
		};

        createSVGSurface = function (renderer, domid){
           
            var mySurface;
           
            if(renderer.symbol.width && renderer.symbol.height) {
                mySurface = gfx.createSurface(dom.byId(domid),  renderer.symbol.width, renderer.symbol.height);
            } else {
                mySurface = gfx.createSurface(dom.byId(domid),  30, 30);   
            }
           return mySurface; 
    
       };

        createSymbols = function(descript, shp, renderer){
                  
          if (descript.fill) {
            shp.setFill(descript.fill);
          }
          if (descript.stroke) {
            shp.setStroke(descript.stroke);
          }
          if(renderer.symbol.width && renderer.symbol.height){ //wont work for simple fill, no width or height
            shp.applyTransform({
               dx: renderer.symbol.width /2,
               dy: renderer.symbol.height /2
            });
          }
          else
          {
            shp.applyTransform({
              dx: 15,
              dy: 15
            });
          }
                  
        };

        getLegend = function(serviceDetails, version) { 
            var serviceUrl = serviceDetails.service,
                legendUrl;

            if (version >= 10.01) {
                legendUrl = serviceUrl +'/legend';
            } else {
                //legendUrl= 'http://www.arcgis.com/sharing/tools/legend' + '?soapUrl' + escape(serviceUrl);
                legendUrl= 'http://www.arcgis.com/sharing/tools/legend' + '?soapUrl' + encodeURI(serviceUrl);
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