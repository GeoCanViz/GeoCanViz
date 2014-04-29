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
			'gcviz-gisgeo',
			'esri/toolbars/draw',
			'esri/symbols/Font',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/TextSymbol',
			'esri/geometry/ScreenPoint',
			'esri/geometry/Polygon',
			'esri/graphic',
			'dojo/on'
	], function($viz, gisgeo, esriTools, esriFont, esriLine, esriFill, esriMarker, esriText, esriScreenPt, esriPoly, esriGraph, dojoOn) {
		var initialize,
			importGraphics,
			exportGraphics;

		initialize = function(mymap, lblDist, lblArea) {

			// data model				
			var graphic = function(mymap, lblDist, lblArea) {
				var _self = this,
					measureLength,
					measureArea,
					measureAreaCallback,
					measureText,
					addToMap,
					setColor,
					toolbar,
					text,
					color,
					key,
					map = mymap,
					wkid = mymap.vWkid,
					txtDist = lblDist,
					txtArea = lblArea,
					red = [239,13,13,255],
					blue = [17,69,238,255],
					green = [13,156,32,255],
					black = [0,0,0,255],
					font  = new esriFont();

				// symbology for draw tool
				_self.drawSymb = new esriLine({
									'type': 'esriSLS',
									'style': 'esriSLSSolid',
									'color': [239,13,13,255],
									'width': 2
								});
				
				
				_self.textSymb = new esriText({
									'type': 'esriTS',
									'color': [78,78,78,255],
									'backgroundColor': null,
									'borderLineColor': null,
									'verticalAlignment': 'bottom',
									'horizontalAlignment': 'left',
									'rightToLeft': false,
									'angle': 0,
									'xoffset': 0,
									'yoffset': 0,
									'font': {
										'family': 'Arial',
										'size': 8,
										'style': 'normal',
										'weight': 'bold',
										'decoration': 'none'
									}
								});
									
				// symbology for measure tool
				_self.measLineSymb = new esriLine({
									'type': 'esriSLS',
									'style': 'esriSLSSolid',
									'color': [239,13,13,255],
									'width': 1
								});

				_self.measFillSymb = new esriFill({
									'type': 'esriSFS',
									'style': 'esriSFSSolid',
									'color': [205,197,197,50]
								});
				
   				_self.measPointSymb = new esriMarker({
										'type': 'esriSMS',
										'style': 'esriSMSCircle',
										'color': [205,197,197,100],
										'size': 5,
										'angle': 0,
										'xoffset': 0,
										'yoffset': 0,
										'outline': 
										{
											'color': [239,13,13,200],
											'width': 1
										}
								});
				
				_self.measTextSymb = new esriText({
										'type': 'esriTS',
										'color': [78,78,78,255],
										'backgroundColor': null,
										'borderLineColor': null,
										'verticalAlignment': 'baseline',
										'horizontalAlignment': 'left',
										'rightToLeft': false,
										'angle': 0,
										'xoffset': 0,
										'yoffset': 0,
										'font': {
											'family': 'Arial',
											'size': 8,
											'style': 'normal',
											'weight': 'bold',
											'decoration': 'none'
										}
									});
							
				_self.init = function() {
					toolbar = new esriTools(map, { showTooltips: false });
					dojoOn(toolbar, 'DrawEnd', addToMap);
				};

				_self.drawLine = function(inKey, inColor) {
					var symbol = _self.drawSymb;
					symbol.color.setColor(setColor(inColor));
					toolbar.setLineSymbol(symbol);
					
					// set global then call the tool
					color = inColor;
					key = inKey;
					toolbar.activate(esriTools.FREEHAND_POLYLINE);
				};

				_self.drawText = function(mytext, inKey, inColor) {
					// set global then call the tool
					text = mytext;
					color = inColor;
					key = inKey;
					toolbar.activate(esriTools.POINT);
				};

				_self.erase = function() {
					map.graphics.clear();
				};

				_self.eraseUnfinish = function() {
					var mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						len = mapGraph.graphics.length,
						key = graphics[len - 1].key,
						lastKey = key;
					
					while (len-- && key === lastKey) {
						mapGraph.remove(graphics[len]);
						lastKey = graphics[len - 1].key;
					}
				};
				
				_self.addMeasure = function(array, inKey, type, unit, inColor, point) {
					var graphic,
						len,
						screenPt = point.screenPoint,
						geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));
					
					// set global then call the tool
					color = inColor;
					key = inKey;
					
					// push the geometry to the array
					array().push(geometry);
					len = array().length;
					
					if (type === 0) {
						if (len === 1) {
							measureLength(array());
						} else {
							gisgeo.measureLength(array(), unit, measureLength);
						}
					} else if (type === 1) {
						measureArea(array, unit);
					}
				};
				
				_self.addMeasureSumLength = function(array, inKey, unit) {
					var pt, text,
						dist = 0,
						len = array().length,
						last = array()[len - 1];
					
					// set global then call the tool
					key = inKey;
					
					// calculate values
					while (len--) {
						pt = array()[len];
						
						if (pt.hasOwnProperty('distance')) {
							dist += pt.distance;
						}
					}
					
					// add text
					dist = Math.floor(dist * 100) / 100;
					text = txtDist + dist + ' ' + unit;
					last.text = text;
					measureText(last);
				};
				
				_self.addMeasureSumArea = function(array, inKey, unit) {
					var item, polyJson, poly,
						polyArr = [],
						len = array().length,
						lastPoly = len - 1;
				
					// set global then call the tool
					key = inKey;
					
					// create poly geom and add the closing point
					while (len--) {
						item = array()[len];
						polyArr.push([item.x, item.y]);
					}
						
					item = array()[lastPoly];
					polyArr.push([item.x, item.y]);
							
					polyJson = { 
								'rings': [polyArr],
								'spatialReference': { 'wkid': wkid } };
					poly = new esriPoly(polyJson);
					gisgeo.measureArea(poly, unit, measureAreaCallback);
				};
				
				measureAreaCallback = function(polys, areas, unit) {
					var last, poly,
						area, length, text,
						len = polys.length - 1;
					
					area = Math.floor(areas.areas[0] * 100) / 100;
					length = Math.floor(areas.lengths[0] * 100) / 100;
					poly = polys[len];
					last = poly[poly.length - 1];

					// add text
					text = { 'geometry': { 
								'x': last[0], 'y': last[1],
								'spatialReference': { 'wkid': wkid } } };
					text.text = txtArea + ' ' + area + unit;
					measureText(text);
				};
				
				measureLength = function(array) {
					var line, pt1, pt2, text,
						len = array.length,
						mapGraph = map.graphics;
					
					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol =  _self.measPointSymb;
					graphic.symbol.outline.color.setColor(setColor(color));
					graphic.key = key;
					mapGraph.add(graphic);
						
					// draw a line between points
					if (len > 1) {
						pt1 = array[len - 1];
						pt2 = array[len - 2];
						line = { 'geometry': { 
										'paths': [[[pt1.x, pt1.y], [pt2.x, pt2.y]]],
										'spatialReference': { 'wkid': wkid } } };

						graphic = new esriGraph(line);
						graphic.symbol =  _self.measLineSymb;
						graphic.symbol.color.setColor(setColor(color));
						graphic.key = key;
						mapGraph.add(graphic);
						
						// add text
						text = { 'geometry': { 
									'x': (pt1.x + pt2.x) / 2, 'y': (pt1.y + pt2.y) / 2,
									'spatialReference': { 'wkid': wkid } } };
						text.text = pt1.distance;
						measureText(text);
					}
				};
				
				measureArea = function(array, unit) {
					var item, poly, polyArr = [],
						len = array().length,
						lenPoly = len,
						lastPoly = len - 1,
						mapGraph = map.graphics;
					
					// add the point symbol
					graphic = new esriGraph(array()[len - 1]);
					graphic.symbol =  _self.measPointSymb;
					graphic.symbol.outline.color.setColor(setColor(color));
					graphic.key = key;
					mapGraph.add(graphic);
					
					// create poly geom and add the closing point
					if (len > 1) {
						while (lenPoly--) {
							item = array()[lenPoly];
							polyArr.push([item.x, item.y]);
						}
						
						item = array()[lastPoly];
						polyArr.push([item.x, item.y]);
							
						poly = { 'geometry': { 
									'rings': [polyArr],
									'spatialReference': { 'wkid': wkid } } };
						
						if (len > 2) {
							mapGraph.remove(mapGraph.graphics[mapGraph.graphics.length - 2]);
						}
						
						graphic = new esriGraph(poly);
						_self.measFillSymb.outline = _self.measLineSymb;
						graphic.symbol =  _self.measFillSymb;
						graphic.symbol.outline.color.setColor(setColor(color));
						graphic.key = key;
						mapGraph.add(graphic);
					}
				};
				
				measureText = function(pt) {
					var graphic;
					
					graphic = new esriGraph(pt);
					_self.measTextSymb.setText(pt.text);
					graphic.symbol = _self.measTextSymb;
					graphic.key = key;
					map.graphics.add(graphic);
				};
				
				addToMap = function(geometry) {
					var symbol = new esriLine(),
						graphic,
						$cursor = $viz('#' + map.vIdName + '_holder_container');

					toolbar.deactivate();

					if (geometry.type === 'polyline') {
						symbol = _self.drawSymb;
						symbol.color.setColor(setColor(color));
						$cursor.removeClass('gcviz-draw-cursor');
					} else if (geometry.type === 'point') {
						 _self.textSymb.setText(text);
						symbol = _self.textSymb;
						symbol.color.setColor(setColor(color));
						$cursor.removeClass('gcviz-text-cursor');
					}

					graphic = new esriGraph(geometry, symbol);
					graphic.key = key;
					map.graphics.add(graphic);
				};

				setColor = function(color) {
					var selColor;
					
					if (color === 'blue') {
						selColor = blue;
					} else if  (color === 'red') {
						selColor = red;
					} else if (color === 'green') {
						selColor = green;
					} else {
						selColor = black;
					}
					
					return selColor;
				};
				
				_self.init();
			};

			return new graphic(mymap, lblDist, lblArea);
		};
		
		importGraphics = function(map, graphics) {
			var item,
				graphic,
				len = graphics.length;
			
			while (len--) {
				item = graphics[len];
				graphic = new esriGraph(item);
				map.graphics.add(graphic);
			}
		};
		
		exportGraphics = function(map) {
			var output = [],
				graphics = map.graphics.graphics,
				len = graphics.length;
			
			while (len--) {
				output.push(graphics[len].toJson());
			}
			
			return JSON.stringify(output);
		};
		
		return {
			initialize: initialize,
			importGraphics: importGraphics,
			exportGraphics: exportGraphics
		};
	});
}());
