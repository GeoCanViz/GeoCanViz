/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS symbols library
 */
(function () {
	'use strict';
	define(['esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/TextSymbol'
	], function(esriLine, esriFill, esriMarker, esriText) {
		var getSymbLine,
			getSymbPoly,
			getSymbPoint,
			getSymbText,
			getSymbErase;

		getSymbLine = function(color, width, outline) {
			return new esriLine({
						'type': 'esriSLS',
						'style': 'esriSLSSolid',
						'color': color,
						'width': width,
						'outline': outline
					});
		};

		getSymbPoly = function(color, fill, width) {
			return new esriFill({
						'type': 'esriSFS',
						'style': 'esriSFSSolid',
						'color': fill,
						'outline':
						{
							'type': 'esriSLS',
							'style': 'esriSLSSolid',
							'color': color,
							'width': width
						}
					});
		};

		getSymbPoint = function(color, size, outline, width) {
			return new esriMarker({
							'type': 'esriSMS',
							'style': 'esriSMSCircle',
							'color': color,
							'size': size,
							'angle': 0,
							'xoffset': 0,
							'yoffset': 0,
							'outline':
							{
								'type': 'esriSLS',
								'style': 'esriSLSSolid',
								'color': outline,
								'width': width
							}
					});
		};

		getSymbText = function(color, text, size, angle, xOff, yOff, weight, align) {
			return new esriText({
							'type': 'esriTS',
							'color': color,
							'verticalAlignment': 'baseline',
							'horizontalAlignment': align,
							'rightToLeft': false,
							'angle': angle,
							'xoffset': xOff,
							'yoffset': yOff,
							'text': text,
							'font': {
								'family': 'Arial',
								'size': size,
								'style': 'normal',
								'weight': weight,
								'decoration': 'none'
							}
						});
		};

		getSymbErase = function() {
			return new esriFill({
						'type': 'esriSFS',
						'style': 'esriSFSSolid',
						'color': [205,197,197,125],
						'outline':
						{
							'type': 'esriSLS',
							'style': 'esriSLSSolid',
							'color': [229,79,6,255],
							'width': 2
						}
					});
		};

		return {
			getSymbLine: getSymbLine,
			getSymbPoly: getSymbPoly,
			getSymbPoint: getSymbPoint,
			getSymbText: getSymbText,
			getSymbErase: getSymbErase
		};
	});
}());
