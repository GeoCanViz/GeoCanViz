/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS graphic functions
 */
/* global esri: false, dojo: false */
(function () {
	'use strict';
	define(['jquery',
			'esri/toolbars/draw',
			'esri/symbols/Font',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/TextSymbol',
			'esri/graphic'], function($) {
		var initialize;
			
		initialize = function(mymap) {
	
			// data model				
			var graphic = function(mymap) {
				var _self = this,
					addToMap,
					toolbar,
					text,
					map = mymap,
					font  = new esri.symbol.Font();
				
				_self.init = function() {
					toolbar = new esri.toolbars.Draw(map, {showTooltips: false});
					dojo.connect(toolbar, 'onDrawEnd', addToMap);
					
					// set font
					font.setSize('10pt');
					font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
				};
				
				_self.drawLine = function() {
					toolbar.activate(esri.toolbars.Draw.FREEHAND_POLYLINE);
				};
				
				_self.drawText = function(mytext) {
					text = mytext;
					toolbar.activate(esri.toolbars.Draw.POINT);
				};
				
				_self.erase = function() {
					map.graphics.clear();
				};
				
				addToMap = function(geometry) {
					var symbol,
						graphic,
						$cursor = $('#' + map.vIdName + '_holder_container');
						
					toolbar.deactivate();
					
					if (geometry.type === 'polyline') {
						symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color('#FF0000'), 3);
						$cursor.removeClass('gcviz-draw-cursor');
					} else if (geometry.type === 'point') {
						symbol = new esri.symbol.TextSymbol(text);
						symbol.setFont(font);
						symbol.setOffset(0, 0);
						text = '';
						$cursor.removeClass('gcviz-text-cursor');
					}
 
					graphic = new esri.Graphic(geometry, symbol);
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