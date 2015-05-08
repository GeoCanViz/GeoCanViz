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
			'esri/renderers/jsonUtils',
			'dojox/gfx'
	], function($viz, Request, Renderer, domConstruct, esriJsonUtilS, esriJsonUtilR, gfx) {
		var getFeatureLayerSymbol,
			createSymbols,
			createSVGSurface;

		getFeatureLayerSymbol = function(renderer, node, layerid) {
			var mySurface,
				descriptors,
				shape,
				aFields,
				anode,
				nodeImage,
				nodeLabel,
				nodeOutter,
				jsonRen = JSON.parse(renderer),
				ren = esriJsonUtilR.fromJson(jsonRen),
				renDefSym = ren.defaultSymbol,
				renInfo = ren.infos,
				renSym = ren.symbol,
				normField = ren.normalizationField,
				field1 = ren.attributeField,
				field2 = ren.attributeField2,
				field3 = ren.attributeField3,
				symbolLocation = node;

			if (renInfo) {
				// unique renderer, class break renderer
				var legs = renInfo;
				if (renDefSym && legs.length > 0 && legs[0].label !== '[all other values]') {
					// add to front of array
					legs.unshift({
						label: '[all other values]',
						symbol: renDefSym
					});
				}

				// fields symbology is based on
				aFields = field1 + (normField ? '/' + normField : '');
				aFields += (field2 ? '/' + field2 : '') + (field3 ? '/' + field3 : '');
				anode = '<div id="featureLayerSymbol' + layerid +
						'" class="gcviz-leg-uniqueFieldHolder">';
				anode += aFields + '</div>';

				// need a spot in div for each renderer
				// for now we dont want the field use to symbolize
				//domConstruct.place(anode, node);
				//domConstruct.place(domConstruct.create('br'), symbolLocation);

				$viz.each(legs, function(key, value) {
					nodeOutter = domConstruct.create('div', { 'class': 'gcviz-leg-outholder' });
					nodeImage = domConstruct.create('div', { 'class': 'gcviz-leg-uniqueSymbolHolder' });
					nodeLabel = domConstruct.create('div', { 'class': 'gcviz-leg-uniqueSpan' });
					descriptors = esriJsonUtilS.getShapeDescriptors(value.symbol);
					mySurface = createSVGSurface(value, nodeImage);
					shape = mySurface.createShape(descriptors.defaultShape);
					createSymbols(descriptors, shape, value);
					nodeLabel.innerHTML = value.label;
					domConstruct.place(nodeImage, nodeOutter);
					domConstruct.place(nodeLabel, nodeOutter);
					domConstruct.place(nodeOutter, symbolLocation);
					domConstruct.place(domConstruct.create('br'), symbolLocation);
				});
			} else {
				// picture marker, simple marker
				if (renSym) {
					descriptors = esriJsonUtilS.getShapeDescriptors(renSym);
					mySurface = createSVGSurface(ren, node);
					shape = mySurface.createShape(descriptors.defaultShape);
					createSymbols(descriptors, shape, ren);
				}
			}
		};

		createSVGSurface = function(renderer, node) {
			var mySurface,
				symWidth = renderer.symbol.width,
				symHeight = renderer.symbol.height;

			if (symWidth && symHeight) {
				mySurface = gfx.createSurface(node, symWidth, symHeight);
			} else {
				mySurface = gfx.createSurface(node, 30, 30);
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
			if (symWidth && symHeight) { // wont work for simple fill, no width or height
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

		return {
			getFeatureLayerSymbol: getFeatureLayerSymbol,
		};
	});
}());
