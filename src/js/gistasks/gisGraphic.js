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

		initialize = function(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea) {

			// data model				
			var graphic = function(mymap, isGraphics, undo, redo, lblDist, lblArea) {
				var _self = this,
					measureLength, measureArea, measureAreaCallback, measureLabelCallback, measureText,
					addBackgroundText, addToMap,
					addUndoStack,
					setColor, removeDrawCursor,
					getSymbLine, getSymbPoly, getSymbPoint, getSymbText,
					toolbar,
					gText, gColor, gKey, gBackColor, gColorName,
					stackUndo = undo,
					stackRedo = redo,
					map = mymap,
					wkid = map.vWkid,
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

				_self.drawExtent = function() {
					toolbar.activate(esriTools.EXTENT);
				};

				_self.erase = function() {
					var grp = [],
						mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						len = mapGraph.graphics.length;

					// add to undo stack
					while (len--) {
						grp.push(graphics[len]);
					}
					
					if (grp.length > 0) {
						stackUndo.push({ task: 'delete', geom: grp });
					}
					
					// clear graphics and set isGraphics
					map.graphics.clear();
					isGraphics(false);
				};

				_self.eraseSelect = function(geometry) {
					var graphic, lenKey,
						keys = [],
						grp = [],
						mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						lenGraph = mapGraph.graphics.length,
						$cursor = $viz('#' + map.vIdName + '_holder_container');

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
								grp.push(graphic);
							}
						}
					}
					
					// add to undo stack
					if (grp.length > 0) {
						stackUndo.push({ task: 'delete', geom: grp });
					}

					// set default cursor
					$cursor.removeClass('gcviz-draw-cursor');

					// check if there is graphics. Check if the only one is a point at x:0;y:0
					// this point is created by the API sometimes
					if (mapGraph.graphics.length === 0) {
						isGraphics(false);
					} else if (mapGraph.graphics.length === 1 && mapGraph.graphics[0]._extent.xmax === 0) {
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

				_self.undo = function() {
					var graphics = stackUndo.pop(),
						geoms = graphics.geom,
						len = geoms.length;

					if (graphics.task === 'delete') {
						while (len--) {
							map.graphics.add(geoms[len]);
						}
					} else {
						while (len--) {
							map.graphics.remove(geoms[len]);
						}
					}
					
					// add redo
					stackRedo.push(graphics);

					isGraphics(true);
				};
				
				_self.redo = function() {
					var graphics = stackRedo.pop(),
						geoms = graphics.geom,
						len = geoms.length;

					if (graphics.task === 'delete') {
						while (len--) {
							map.graphics.remove(geoms[len]);
						}
					} else {
						while (len--) {
							map.graphics.add(geoms[len]);
						}
					}

					isGraphics(true);
				};

				_self.addMeasure = function(array, key, type, unit, color, point) {
					var len,
						screenPt = point.screenPoint,
						geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));

					// set global then call the tool
					gKey = key;
					setColor(color);

					// push the geometry to the array (first point)
					array().push(geometry);
					len = array().length;

					if (type === 0) {
						if (len === 1) {
							measureLength(array());
						} else {
							gisgeo.measureLength(array(), unit, measureLength);
						}
					} else if (type === 1) {
						measureArea(array);
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
					
					// add to stack
					addUndoStack(gKey);
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
					
					// add to stack
					addUndoStack(gKey);
				};

				measureLength = function(array, unit) {
					var line, pt1, pt2, text,
						len = array.length,
						mapGraph = map.graphics;

					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol =  getSymbPoint(gColor, 4);
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

				measureArea = function(array) {
					var item, poly, polyArr = [],
						len = array().length,
						lenPoly = len,
						lastPoly = len - 1,
						mapGraph = map.graphics;

					// add the point symbol
					graphic = new esriGraph(array()[len - 1]);
					graphic.symbol =  getSymbPoint(gColor, 4);
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
					graphic.symbol = getSymbText(black, pt.text, 8, 0, 0, 'normal');
					graphic.key = gKey;

					// add background then text
					addBackgroundText(graphic, white);
					map.graphics.add(graphic);
					isGraphics(true);
				};

				addBackgroundText = function(item, backColor) {
					var graphic, point,
						text = '',
						len = item.symbol.text.length * 2,
						geom = item.geometry;

					// create the geometry array
					point = { 'geometry': {
									'x': geom.x, 'y': geom.y,
									'spatialReference': { 'wkid': wkid } } };

					// there is no background color for text symbol. To solve this, we create
					// 3 text symbol with offset to mimic a text background. If we use line or
					// polygon, we have problem when user zooms in or out because the geometry
					// does not follow the text because it is scale dependent.
					while (len--) {
						text += 'l';
					}

					graphic = new esriGraph(point);
					graphic.symbol =  getSymbText(backColor, text, 9, 0, -1, 'bold');
					graphic.key = gKey;
					map.graphics.add(graphic);

					graphic = new esriGraph(point);
					graphic.symbol =  getSymbText(backColor, text, 9, -1, -1, 'bold');
					graphic.key = gKey;
					map.graphics.add(graphic);

					graphic = new esriGraph(point);
					graphic.symbol =  getSymbText(backColor, text, 9, +1, -1, 'bold');
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
							removeDrawCursor($cursor, gColorName);
						} else if (geomType === 'point') {
							symbol = getSymbText(gColor, gText, 8, 0, 0, 'normal');
							graphic = new esriGraph(geometry, symbol);
							addBackgroundText(graphic, gBackColor);
							$cursor.removeClass('gcviz-text-cursor');
						}

						// add graphic
						graphic.key = gKey;
						map.graphics.add(graphic);
						isGraphics(true);
						
						// add to stack
						addUndoStack(gKey);
					}

					// reopen panel
					vmArray[map.vIdName].header.toolsClick();
				};

				addUndoStack = function(key) {
					var graphic,
						grp = [],
						mapGraph = map.graphics,
						graphics = mapGraph.graphics,
						len = mapGraph.graphics.length;

					while (len--) {
						graphic = graphics[len];
						if (graphic.key === key) {
							grp.push(graphic);
						}
					}
					
					stackUndo.push({ task: 'add', geom: grp });
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
					
					gColorName = color;
				};
				
				removeDrawCursor = function(container, colour) {
					// Remove cursor class
					if (colour === 'black') {
						container.removeClass('gcviz-draw-cursor-black');
					}
					if (colour === 'blue') {
						container.removeClass('gcviz-draw-cursor-blue');
					}
					if (colour === 'green') {
						container.removeClass('gcviz-draw-cursor-green');
					}
					if (colour === 'red') {
						container.removeClass('gcviz-draw-cursor-red');
					}
					if (colour === 'yellow') {
						container.removeClass('gcviz-draw-cursor-yellow');
					}
					if (colour === 'white') {
						container.removeClass('gcviz-draw-cursor-white');
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

				getSymbPoint = function(color, size) {
					return new esriMarker({
										'type': 'esriSMS',
										'style': 'esriSMSCircle',
										'color': color,
										'size': size,
										'angle': 0,
										'xoffset': 0,
										'yoffset': 0
								});
				};

				getSymbText = function(color, text, size, xOff, yOff, weight) {
					return new esriText({
										'type': 'esriTS',
										'color': color,
										'verticalAlignment': 'baseline',
										'horizontalAlignment': 'left',
										'rightToLeft': false,
										'angle': 0,
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

				_self.init();
			};

			return new graphic(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea);
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
