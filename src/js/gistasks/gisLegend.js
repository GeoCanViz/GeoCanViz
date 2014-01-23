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
            'esri/request',
			'esri/renderers/Renderer',
			'dojo/dom-construct',
			'esri/symbols/jsonUtils',
			'dojox/gfx', 
			'dojo/dom',
            'dojo/dom-style'
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
			
		esri.config.defaults.io.proxyUrl = '../../proxy.ashx';
		esri.config.defaults.io.alwaysUseProxy = false;

		setLayerVisibility = function(mymap, selectedLayer, visState) {
			var layer = mymap.getLayer(selectedLayer);
			layer.setVisibility(visState);
		};
		
		getFeatureLayerSymbol = function(layer,mapID) {
            var mySurface,descriptors,shape, aFields, ren;
            var ren = layer.renderer;

               if(ren.infos)
                { //unique renderer, class break renderer
                       var legs = ren.infos;
                if (ren.defaultSymbol && legs.length > 0 && legs[0].label != '[all other values]') {
                 // add to front of array
                legs.unshift({
                  label: '[all other values]',
                  symbol: ren.defaultSymbol
                });
               }
              
              //fields symbology is based on
              aFields = ren.attributeField + (ren.normalizationField ? '/' + ren.normalizationField : '');
              aFields += (ren.attributeField2 ? '/' + ren.attributeField2 : '') + (ren.attributeField3 ? '/' + ren.attributeField3 : '');
              var anode = domConstruct.create('div', {id:"featureLayerSymbol" + layer.id, 'class':'gcviz-legendUnqiueFieldHolderDiv'});
              anode.innerHTML = aFields;
                

              //need a spot in div for each renderer
              domConstruct.place(anode, dom.byId("featureLayerSymbol" + layer.id));
              domConstruct.place(dojo.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
              var nodeList = [];
             
               $.each(legs, function( key, value ) {  
                  var nodeImage = domConstruct.create('div', {'class': 'gcviz-legendSymbolUniqueValueDiv'});
                  var nodeLabel = domConstruct.create('span', {'class': 'gcviz-LegendUniqueValueSpan'});
                  var descriptors = jsonUtils.getShapeDescriptors(value.symbol);
                  
                  mySurface = createSVGSurface(value, nodeImage);
                  shape = mySurface.createShape(descriptors.defaultShape);
              
                  createSymbols(descriptors, shape, value);
                  nodeLabel.innerHTML = value.label;
                 
                  domConstruct.place(nodeImage, dom.byId("featureLayerSymbol" + layer.id));
                  domConstruct.place(nodeLabel, dom.byId("featureLayerSymbol" + layer.id));
                  domConstruct.place(dojo.create("br"), dom.byId("featureLayerSymbol" + layer.id) );
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


        createSVGSurface = function(renderer, domid) {
            var mySurface;
            var symWidth = renderer.symbol.width;
            var symHeight = renderer.symbol.height;
            if (symWidth && symHeight) {
                mySurface = gfx.createSurface(dom.byId(domid), symWidth, symHeight);
            } else {
                mySurface = gfx.createSurface(dom.byId(domid), 30, 30);   
            }
            return mySurface; 
        };

        createSymbols = function(descript, shp, renderer) {
            var descFill = descript.fill;
            var descStroke = descript.stroke;
            var symWidth = renderer.symbol.width;
            var symHeight = renderer.symbol.height;
            
            if (descFill) {
                shp.setFill(descFill);
            }
            if (descStroke) {
                shp.setStroke(descStroke);
            }
            if (symWidth && symHeight) { //wont work for simple fill, no width or height
                shp.applyTransform({
                    dx: symWidth / 2,
                    dy: symHeight / 2
            });
            } else {
                shp.applyTransform({
                    dx: 15,
                    dy: 15
                });
            }
        };

        getLegend = function(serviceDetails, version) { 
            var serviceUrl = serviceDetails.items,
                legendUrl;

            if (version >= 10.01) {
                legendUrl = serviceUrl + '/legend';
            } else {
                legendUrl = 'http://www.arcgis.com/sharing/tools/legend' + '?soapUrl' + encodeURI(serviceUrl);
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