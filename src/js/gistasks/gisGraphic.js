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
	define([], function() {
		var initialize;
			
		initialize = function(mymap) {
	
			// data model				
			var graphic = function(mymap) {
				var _self = this,
					addToMap,
					toolbar,
					text,
					map = mymap;
				
				_self.init = function() {
					toolbar = new esri.toolbars.Draw(map, { showTooltips: false });
					dojo.connect(toolbar, 'onDrawEnd', addToMap);
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
						graphic;
						
					toolbar.deactivate();
					
					if (geometry.type === 'polyline') {
						symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color('#FF0000'), 3);
					} else if (geometry.type === 'point') {
						symbol = new esri.symbol.TextSymbol(text);
						symbol.setOffset(0, 0);
						text = '';
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