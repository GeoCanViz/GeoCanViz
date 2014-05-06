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
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/TextSymbol',
			'esri/geometry/ScreenPoint',
			'esri/geometry/Polygon',
			'esri/graphic',
			'dojo/on'
	], function($viz, gisgeo, esriTools, esriLine, esriFill, esriMarker, esriText, esriScreenPt, esriPoly, esriGraph, dojoOn) {
		var initialize,
			importGraphics,
			exportGraphics;

		initialize = function(mymap, isGraphics, lblDist, lblArea) {

			// data model				
			var graphic = function(mymap, isGraphics, lblDist, lblArea) {
				var _self = this,
					measureLength, measureArea, measureAreaCallback, measureLabelCallback, measureText,
					addBackgroundText, addToMap,
					setColor,
					getSymbLine, getSymbPoly, getSymbPoint, getSymbText,
					toolbar,
					gText, gColor, gKey, gBackColor,
					undoCount,
					undoStack = [],
					map = mymap,
					wkid = mymap.vWkid,
					txtDist = lblDist,
					txtArea = lblArea,
					black = [0,0,0,255],
					red = [255,0,0,255],
					green = [0,255,0,255],
					blue = [0,0,255,255],
					yellow = [255,255,0,255],
					white = [255,255,255,255],
					polyFill = [205,197,197,100];
							
				_self.init = function() {
					toolbar = new esriTools(map, { showTooltips: false });
					dojoOn(toolbar, 'DrawEnd', addToMap);
				};

				_self.drawLine = function(key, color) {
					// set global then call the tool
					gKey = key;
					setColor(color);

					toolbar.setLineSymbol(getSymbLine(gColor, 2));
					toolbar.activate(esriTools.FREEHAND_POLYLINE);
				};

				_self.drawText = function(text, key, color) {
					// set global then call the tool
					gText = text;
					gKey = key;
					setColor(color);
					
					toolbar.activate(esriTools.POINT);
				};

				_self.drawExtent = function(undo) {
					undoCount = undo;
					toolbar.activate(esriTools.EXTENT);
				};
				
				_self.erase = function() {
					var stackGraph = [],
						mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						len = mapGraph.graphics.length;
						
					// add to undo stack
					while (len--) {
						stackGraph.push(graphics[len]);
					}
					undoStack.push(stackGraph);
					
					// clear graphics and set isGraphics
					map.graphics.clear();
					isGraphics(false);
				};

				_self.eraseSelect = function(geometry) {
					var graphic, key, lenKey,
						flagDel = false,
						keys = [],
						stackGraph = [],
						mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						lenGraph = mapGraph.graphics.length,
						$cursor = $viz('#' + map.vIdName + '_holder_container');;
					
					// get key from geometries that intersect the extent
					while (lenGraph--) {
						graphic = graphics[lenGraph];
						if (geometry.intersects(graphic.geometry)) {
							keys.push(graphic.key);
						}
					}
					
					// loop trought the keys and delete the graphic
					lenKey = keys.length;
					while (lenKey--) {
						lenGraph = graphics.length;
						while (lenGraph --) {
							graphic = graphics[lenGraph];
							
							if (keys[lenKey] === graphic.key) {
								mapGraph.remove(graphic);
								stackGraph.push(graphic);
								flagDel = true;
							}
						}
					}
					
					// add to undo stack, set default cursor and
					// increment undo
					undoStack.push(stackGraph);
					$cursor.removeClass('gcviz-draw-cursor');
					if (flagDel) {
						undoCount(undoCount() + 1);
					}
					
					if (mapGraph.graphics.length === 0) {
						isGraphics(false);
					} else if (mapGraph.graphics[0]._extent.xmax === 0) {
						isGraphics(false);
					}
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
				
				_self.eraseUndo = function() {
					var graphics = undoStack.pop(),
						len = graphics.length;
					
					while (len--) {
						map.graphics.add(graphics[len]);
					}
					
					isGraphics(true);
				};
				
				_self.addMeasure = function(array, key, type, unit, color, point) {
					var graphic,
						len,
						screenPt = point.screenPoint,
						geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));
					
					// set global then call the tool
					gKey = key;
					setColor(color);
					
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
				
				_self.addMeasureSumLength = function(array, key, unit) {
					var pt, text,
						dist = 0,
						len = array().length,
						last = array()[len - 1];
					
					// set global then call the tool
					gKey = key;
					
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
				
				_self.addMeasureSumArea = function(array, key, unit) {
					var item, polyJson, poly,
						polyArr = [],
						len = array().length,
						lastPoly = len - 1;
				
					// set global then call the tool
					gKey = key;
					
					// create poly geom and add the closing point
					while (len--) {
						item = array()[len];
						polyArr.push([item.x, item.y]);
					}
						
					item = array()[lastPoly];
					polyArr.push([item.x, item.y]);
							
					polyJson = { 'rings': [polyArr],
									'spatialReference': { 'wkid': wkid } };
					poly = new esriPoly(polyJson);
					
					// area and length from geosprocessing
					gisgeo.measureArea(poly, unit, measureAreaCallback);
				};
				
				measureAreaCallback = function(poly, areas, unit) {
					var info = {};
					
					info.area = Math.floor(areas.areas[0] * 100) / 100;
					info.length = Math.floor(areas.lengths[0] * 100) / 100;
					info.unit = unit;
					
					// get label coordinnate from geoprocessing
					gisgeo.labelPoints(poly, info, measureLabelCallback);
				};
				
				measureLabelCallback = function(points, info) {
					// add text
					var pt = points[0],
						text = { 'geometry': { 
								'x': pt.x, 'y': pt.y,
								'spatialReference': { 'wkid': wkid } } };
					text.text = txtArea + info.area + ' ' + info.unit + '2';
					measureText(text);
				};
				
				measureLength = function(array, unit) {
					var line, pt1, pt2, text,
						len = array.length,
						mapGraph = map.graphics;
					
					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol =  getSymbPoint(gColor);
					graphic.key = gKey;
					mapGraph.add(graphic);
						
					// draw a line between points
					if (len > 1) {
						pt1 = array[len - 1];
						pt2 = array[len - 2];
						line = { 'geometry': { 
										'paths': [[[pt1.x, pt1.y], [pt2.x, pt2.y]]],
										'spatialReference': { 'wkid': wkid } } };

						graphic = new esriGraph(line);
						graphic.symbol =  getSymbLine(gColor, 1);
						graphic.key = gKey;
						mapGraph.add(graphic);
						
						// add text
						text = { 'geometry': { 
									'x': (pt1.x + pt2.x) / 2, 'y': (pt1.y + pt2.y) / 2,
									'spatialReference': { 'wkid': wkid } } };
						text.text = pt1.distance + ' ' + unit;
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
					graphic.symbol =  getSymbPoint(gColor);
					graphic.key = gKey;
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
						
						// remove previous area graphic
						if (len > 2) {
							mapGraph.remove(mapGraph.graphics[mapGraph.graphics.length - 2]);
						}
						
						graphic = new esriGraph(poly);
						graphic.symbol =  getSymbPoly(gColor, polyFill, 1);
						graphic.key = gKey;
						mapGraph.add(graphic);
					}
				};
				
				measureText = function(pt) {
					var graphic, symbol;

					graphic = new esriGraph(pt, symbol);
					graphic.symbol = getSymbText(black, white, pt.text);
					graphic.key = gKey;
					
					// add background then text
					addBackgroundText(graphic, white);
					map.graphics.add(graphic);
					isGraphics(true);
				};
				
				addBackgroundText = function(graphic, backColor) {
					var graphic, poly,
						symb = graphic.symbol,
						geom = graphic.geometry,
						polyArr = [],
						xVal = geom.x,
						yVal = geom.y,
						width = symb.getWidth(),
						height = symb.getHeight(),
						tr = map.toMap(new esriScreenPt(0, 0)),
						bl = map.toMap(new esriScreenPt(width, height)),
						deltaX = (bl.x - tr.x) / 2,
						deltaY = (tr.y - bl.y);
					
					// create the geometry array
					polyArr.push([xVal - deltaX, yVal + deltaY]);
					polyArr.push([xVal + deltaX, yVal + deltaY]);
					polyArr.push([xVal + deltaX, yVal]);
					polyArr.push([xVal - deltaX, yVal]);
					polyArr.push([xVal - deltaX, yVal + deltaY]);
					
					poly = { 'geometry': { 
									'rings': [polyArr],
									'spatialReference': { 'wkid': wkid } } };
					
					graphic = new esriGraph(poly);
					graphic.symbol =  getSymbPoly(backColor, backColor, 1);
					graphic.key = gKey;
					map.graphics.add(graphic);
				},
				
				addToMap = function(geometry) {
					var graphic,
						symbol = new esriLine(),
						geomType = geometry.type,
						$cursor = $viz('#' + map.vIdName + '_holder_container');

					toolbar.deactivate();

					if (geomType === 'extent') {
						_self.eraseSelect(geometry);
					} else {
						if (geomType === 'polyline') {
							symbol = getSymbLine(gColor, 2);
							graphic = new esriGraph(geometry, symbol);
							$cursor.removeClass('gcviz-draw-cursor');
						} else if (geomType === 'point') {
							symbol = getSymbText(gColor, gBackColor, gText);
							graphic = new esriGraph(geometry, symbol);
							addBackgroundText(graphic, gBackColor);
							$cursor.removeClass('gcviz-text-cursor');
						}
					
						graphic.key = gKey;
						map.graphics.add(graphic);
						isGraphics(true);
					}
					
				};

				setColor = function(color) {
					if (color === 'red') {
						gColor = red;
						gBackColor = white;
					} else if  (color === 'green') {
						gColor = green;
						gBackColor = black;
					} else if (color === 'blue') {
						gColor = blue;
						gBackColor = white;
					} else if (color === 'yellow') {
						gColor = yellow;
						gBackColor = black;
					} else if (color === 'white') {
						gColor = white;
						gBackColor = black;
					} else {
						gColor = black;
						gBackColor = white;
					}
				};
				
				getSymbLine = function(color, width) {
					return new esriLine({
									'type': 'esriSLS',
									'style': 'esriSLSSolid',
									'color': color,
									'width': width
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
				
				getSymbPoint = function(color) {
					return new esriMarker({
										'type': 'esriSMS',
										'style': 'esriSMSCircle',
										'color': color,
										'size': 4,
										'angle': 0,
										'xoffset': 0,
										'yoffset': 0
								});
				};
				
				getSymbText = function(color, bgcolor, text) {
					return new esriText({
										'type': 'esriTS',
										'color': color,
										'verticalAlignment': 'baseline',
										'horizontalAlignment': 'center',
										'rightToLeft': false,
										'angle': 0,
										'xoffset': 0,
										'yoffset': 0,
										'text': text,
										'font': {
											'family': 'Arial',
											'size': 8,
											'style': 'normal',
											'weight': 'bold',
											'decoration': 'none'
										}
									});	
				};
				
				_self.init();
			};

			return new graphic(mymap, isGraphics, lblDist, lblArea);
		};
		
		importGraphics = function(map, graphics) {
			var item,
				graphic,
				len = graphics.length;
			
			while (len--) {
				item = graphics[len];
				graphic = new esriGraph(item);
				graphic.key = item.key;
				map.graphics.add(graphic);
			}
		};
		
		exportGraphics = function(map) {
			var json, graphic,
				output = [],
				graphics = map.graphics.graphics,
				len = graphics.length;
			
			while (len--) {
				graphic = graphics[len];
				json = graphic.toJson();
				json.key = graphic.key;
				output.push(json);
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
