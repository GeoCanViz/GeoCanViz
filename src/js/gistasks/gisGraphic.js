/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS graphic functions
 */
(function () {
	'use strict';
	define(['jquery-private',
			'esri/toolbars/draw',
			'esri/symbols/Font',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/TextSymbol',
			'esri/graphic',
			'dojo/colors',
			'dojo/on'
	], function($viz, esriTools, esriFont, esriLine, esriText, esriGraph, dojoColors, dojoOn) {
		var initialize;

		initialize = function(mymap) {

			// data model				
			var graphic = function(mymap) {
				var _self = this,
					addToMap,
					toolbar,
					text,
					map = mymap,
					font  = new esriFont();

				_self.init = function() {
					toolbar = new esriTools(map, { showTooltips: false });
					dojoOn(toolbar, 'DrawEnd', addToMap);

					// set font
					font.setSize('10pt');
					font.setWeight(esriFont.WEIGHT_BOLD);
				};

				_self.drawLine = function() {
					toolbar.activate(esriTools.FREEHAND_POLYLINE);
				};

				_self.drawText = function(mytext) {
					text = mytext;
					toolbar.activate(esriTools.POINT);
				};

				_self.erase = function() {
					map.graphics.clear();
				};

				addToMap = function(geometry) {
					var symbol,
						graphic,
						$cursor = $viz('#' + map.vIdName + '_holder_container');

					toolbar.deactivate();

					if (geometry.type === 'polyline') {
						symbol = new esriLine(esriLine.STYLE_SOLID, new dojoColors('#FF0000'), 3);
						$cursor.removeClass('gcviz-draw-cursor');
					} else if (geometry.type === 'point') {
						symbol = new esriText(text);
						symbol.setFont(font);
						symbol.setOffset(0, 0);
						symbol.setHorizontalAlignment('left');
						symbol.setVerticalAlignment('baseline');
						text = '';
						$cursor.removeClass('gcviz-text-cursor');
					}

					graphic = new esriGraph(geometry, symbol);
					map.graphics.add(graphic);
				};

				_self.init();
			};

			return new graphic(mymap);
		};

		return {
			initialize: initialize
		};
	});
}());
