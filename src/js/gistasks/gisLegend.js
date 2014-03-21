/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS Legend functions
 */
(function () {
	'use strict';
	define(['jquery-private',
			'esri/request',
			'esri/renderers/Renderer',
			'dojo/dom-construct',
			'esri/symbols/jsonUtils',
			'dojox/gfx',
			'dojo/dom',
			'dojo/dom-class'
	], function($viz, Request, Renderer, domConstruct, jsonUtils, gfx, dom, dojoClass) {
		var setLayerVisibility,
			getFeatureLayerSymbol,
			createSymbols,
			createSVGSurface;

		setLayerVisibility = function(mymap, selectedLayer, visState) {
			var layer = mymap.getLayer(selectedLayer);
			layer.setVisibility(visState);
		};

		getFeatureLayerSymbol = function(layer) {
			var mySurface,
				descriptors,
				shape,
				aFields,
				ren = layer.renderer,
				renDefSym = ren.defaultSymbol,
				renInfo = ren.infos,
				renSym = ren.symbol,
				normField = ren.normalizationField,
				field1 = ren.attributeField,
				field2 = ren.attributeField2,
				field3 = ren.attributeField3,
				anode,
				layerid = layer.id,
				symbolLocation = dom.byId('featureLayerSymbol' + layerid),
				nodeImage,
				nodeLabel;

			if (renInfo) {
				//unique renderer, class break renderer
				var legs = renInfo;
				if (renDefSym && legs.length > 0 && legs[0].label !== '[all other values]') {
					// add to front of array
					legs.unshift({
						label: '[all other values]',
						symbol: renDefSym
					});
				}

				//fields symbology is based on
				aFields = field1 + (normField ? '/' + normField : '');
				aFields += (field2 ? '/' + field2 : '') + (field3 ? '/' + field3 : '');
				anode = '<div id="featureLayerSymbol' + layerid +
						'" class="gcviz-legendUnqiueFieldHolderDiv">';
				anode += aFields + '</div>';

				//need a spot in div for each renderer
				domConstruct.place(anode, dom.byId('featureLayerSymbol' + layerid));
				domConstruct.place(domConstruct.create('br'), symbolLocation);

				$viz.each(legs, function( key, value ) {
					nodeImage = domConstruct.create('div', { 'class': 'gcviz-legendSymbolUniqueValueDiv' });
					nodeLabel = domConstruct.create('span');
					dojoClass(nodeLabel, 'gcviz-LegendUniqueValueSpan');
					descriptors = jsonUtils.getShapeDescriptors(value.symbol);
					mySurface = createSVGSurface(value, nodeImage);
					shape = mySurface.createShape(descriptors.defaultShape);
					createSymbols(descriptors, shape, value);
					nodeLabel.innerHTML = value.label;
					domConstruct.place(nodeImage, symbolLocation);
					domConstruct.place(nodeLabel, symbolLocation);
					domConstruct.place(domConstruct.create('br'), symbolLocation);
				});
			} else {
				//picture marker, simple marker
				if (renSym) {
					descriptors = jsonUtils.getShapeDescriptors(renSym);
					mySurface = createSVGSurface(ren, 'featureLayerSymbol' + layerid);
					shape = mySurface.createShape(descriptors.defaultShape);
					createSymbols(descriptors, shape, ren);
				}
			}
		};

		createSVGSurface = function(renderer, domid) {
			var mySurface,
				symWidth = renderer.symbol.width,
				symHeight = renderer.symbol.height;

			if (symWidth && symHeight) {
				mySurface = gfx.createSurface(dom.byId(domid), symWidth, symHeight);
			} else {
				mySurface = gfx.createSurface(dom.byId(domid), 30, 30);
			}

			return mySurface;
		};

		createSymbols = function(descript, shp, renderer) {
			var descFill = descript.fill,
				descStroke = descript.stroke,
				symWidth = renderer.symbol.width,
				symHeight = renderer.symbol.height;

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

       //TODO: CODE FOR GET DYNAMIC MAP SERVER LEGEND IMAGE - MIGHT NOT BE NEEDED
		/** getLegend = function(serviceDetails, version) {
			var serviceUrl = serviceDetails.items,
				legendUrl;

			if (version >= 10.01) {
				legendUrl = serviceUrl + '/legend';
			} else {
				legendUrl = 'http://www.arcgis.com/sharing/tools/legend' + '?soapUrl' + encodeURI(serviceUrl);
			}

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
		}; **/

		return {
			setLayerVisibility: setLayerVisibility,
			getFeatureLayerSymbol: getFeatureLayerSymbol
		};
	});
}());
