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
			'gcviz-func',
			'gcviz-gisgeo',
			'esri/layers/GraphicsLayer',
			'esri/toolbars/draw',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/TextSymbol',
			'esri/geometry/ScreenPoint',
			'esri/geometry/Polygon',
			'esri/graphic',
			'dojo/on'
	], function($viz, gcvizFunc, gisgeo, esriGraphLayer, esriTools, esriLine, esriFill, esriMarker, esriText, esriScreenPt, esriPoly, esriGraph, dojoOn) {
		var initialize,
			importGraphics,
			exportGraphics;

		initialize = function(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea) {

			// data model				
			var graphic = function(mymap, isGraphics, undo, redo, lblDist, lblArea) {
				var _self = this,
					symbLayer,
					measureLength, measureArea, measureAreaCallback, measureLabelCallback, measureText, mouseMeasureLength, nextMeasureLength,
					addBackgroundText, addToMap,
					addUndoStack,
					setColor,
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
					// add the graphic layers tot he map
					mymap.addLayer(new esriGraphLayer({ id: 'gcviz-symbol' }));
					symbLayer = map.getLayer('gcviz-symbol');
					
					// create esri toolbar
					toolbar = new esriTools(map, { showTooltips: false });
					dojoOn(toolbar, 'DrawEnd', addToMap);
				};

				_self.deactivate = function() {
					toolbar.deactivate();
				};
				
				_self.drawLine = function(color) {
					// set global then call the tool
					setColor(color);

					toolbar.setLineSymbol(getSymbLine(gColor, 2));
					toolbar.activate(esriTools.FREEHAND_POLYLINE);
				};

				_self.drawText = function(text, color) {
					// set global then call the tool
					gText = text;
					setColor(color);

					toolbar.activate(esriTools.POINT);
				};

				_self.drawExtent = function() {
					toolbar.activate(esriTools.EXTENT);
				};

				_self.erase = function() {
					var grp = [],
						graphics = symbLayer.graphics,
						len = symbLayer.graphics.length;

					// add to undo stack
					while (len--) {
						grp.push(graphics[len]);
					}

					if (grp.length > 0) {
						stackUndo.push({ task: 'delete', geom: grp });
					}

					// clear graphics and set isGraphics
					symbLayer.clear();
					isGraphics(false);
				};

				_self.eraseSelect = function(geometry) {
					var graphic, lenKey,
						keys = [],
						grp = [],
						graphics = symbLayer.graphics,
						lenGraph = symbLayer.graphics.length;

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
								symbLayer.remove(graphic);
								grp.push(graphic);
							}
						}
					}

					// add to undo stack
					if (grp.length > 0) {
						stackUndo.push({ task: 'delete', geom: grp });
					}

					// check if there is graphics. Check if the only one is a point at x:0;y:0
					// this point is created by the API sometimes
					if (symbLayer.graphics.length === 0) {
						isGraphics(false);
					} else if (symbLayer.graphics.length === 1 && symbLayer.graphics[0]._extent.xmax === 0) {
						isGraphics(false);
					}
				};

				_self.eraseUnfinish = function() {
					var graphics = symbLayer.graphics,
						len = graphics.length,
						key = graphics[len - 1].key,
						lastKey = key;

					while (len-- && key === lastKey) {
						symbLayer.remove(graphics[len]);
						
						if (len > 0) {
							lastKey = graphics[len - 1].key;
						}
					}
					
					// remove mouse move event and clear the dump graphics
					mouseMeasureLength.remove();
					mymap.graphics.clear();
				};

				_self.undo = function() {
					var graphics = stackUndo.pop(),
						geoms = graphics.geom,
						len = geoms.length;

					if (graphics.task === 'delete') {
						while (len--) {
							symbLayer.add(geoms[len]);
						}
					} else {
						while (len--) {
							symbLayer.remove(geoms[len]);
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
							symbLayer.remove(geoms[len]);
						}
					} else {
						while (len--) {
							symbLayer.add(geoms[len]);
						}
					}

					// add undo
					stackUndo.push(graphics);

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
							
							// add mouse mouve event to shop the theoric measure line
							mouseMeasureLength = mymap.on('mouse-move', gcvizFunc.debounce(function(evt) {
								var screenPt = evt.screenPoint,
									geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));
								nextMeasureLength(geometry, unit);
							}, 100, false));
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
					
					// remove mouse move event and clear the dump graphics
					mouseMeasureLength.remove();
					mymap.graphics.clear();
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
						len = array.length;

					// draw a line between points
					if (len > 1) {
						pt1 = array[len - 1];
						pt2 = array[len - 2];
						line = { 'geometry': {
										'paths': [[[pt1.x, pt1.y], [pt2.x, pt2.y]]],
										'spatialReference': { 'wkid': wkid } } };

						// add line
						graphic = new esriGraph(line);
						graphic.symbol =  getSymbLine(gColor, 1);
						graphic.key = gKey;
						symbLayer.add(graphic);

						// add text
						text = { 'geometry': {
									'x': (pt1.x + pt2.x) / 2, 'y': (pt1.y + pt2.y) / 2,
									'spatialReference': { 'wkid': wkid } } };
						text.text = pt1.distance + ' ' + unit;
						measureText(text);
					}
					
					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol =  getSymbPoint(gColor, 4);
					graphic.key = gKey;
					symbLayer.add(graphic);
				};

				// show the measure line before the user select the second point
				nextMeasureLength = function(geometry, unit) {
					var line,
						graphics = symbLayer.graphics,
						len = graphics.length,
						first = graphics[len - 1].geometry,
						line = { 'geometry': {
										'paths': [[[first.x, first.y], [geometry.x, geometry.y]]],
										'spatialReference': { 'wkid': wkid } } };

						mymap.graphics.clear();
						graphic = new esriGraph(line);
						graphic.symbol =  getSymbLine(gColor, 1);
						mymap.graphics.add(graphic);
						
						var pt1 = { 'type': 'point',
									'x': first.x, 'y': first.y,
									'spatialReference': { 'wkid': wkid } };
						var pt2 = { 'type': 'point',
									'x': geometry.x, 'y': geometry.y,
									'spatialReference': { 'wkid': wkid } };
						gisgeo.measureLength([pt1, pt2], unit, measureLength);
				};
				
				measureArea = function(array) {
					var item, poly, polyArr = [],
						len = array().length,
						lenPoly = len,
						lastPoly = len - 1;

					// add the point symbol
					graphic = new esriGraph(array()[len - 1]);
					graphic.symbol =  getSymbPoint(gColor, 4);
					graphic.key = gKey;
					symbLayer.add(graphic);

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
							symbLayer.remove(symbLayer.graphics[symbLayer.graphics.length - 2]);
						}

						graphic = new esriGraph(poly);
						graphic.symbol =  getSymbPoly(gColor, polyFill, 1);
						graphic.key = gKey;
						symbLayer.add(graphic);
					}
				};

				measureText = function(pt) {
					var graphic, symbol;

					graphic = new esriGraph(pt, symbol);
					graphic.symbol = getSymbText(black, pt.text, 8, 0, 0, 'normal', 'center');
					graphic.key = gKey;

					// add background then text
					addBackgroundText(graphic, white, 'center');
					symbLayer.add(graphic);
					isGraphics(true);
				};

				addBackgroundText = function(item, backColor, align) {
					var graphic, point,
						text = '',
						offset = -1,
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

					while (offset <= 1) {
						graphic = new esriGraph(point);
						graphic.symbol =  getSymbText(backColor, text, 9, offset, -1, 'bold', align);
						graphic.key = gKey;
						symbLayer.add(graphic);
						offset++;
					}
				},

				addToMap = function(geometry) {
					var graphic,
						symbol = new esriLine(),
						geomType = geometry.type,
						key = gcvizFunc.getUUID();

					if (geomType === 'extent') {
						_self.eraseSelect(geometry);
					} else {
						if (geomType === 'polyline') {
							symbol = getSymbLine(gColor, 2);
							graphic = new esriGraph(geometry, symbol);
						} else if (geomType === 'point') {
							symbol = getSymbText(gColor, gText, 8, 0, 0, 'normal', 'left');
							graphic = new esriGraph(geometry, symbol);
							addBackgroundText(graphic, gBackColor, 'left');
							
							// reopen the dialog box.
							setTimeout(function() {
								gcvizFunc.getElemValueVM(map.vIdName, ['draw', 'isTextDialogOpen'], 'js')(true);
							}, 1500);
						}

						// add graphic
						graphic.key = key;
						symbLayer.add(graphic);
						isGraphics(true);

						// add to stack
						addUndoStack(key);
					}
				};

				addUndoStack = function(key) {
					var graphic,
						grp = [],
						graphics = symbLayer.graphics,
						len = symbLayer.graphics.length;

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

				getSymbText = function(color, text, size, xOff, yOff, weight, align) {
					return new esriText({
										'type': 'esriTS',
										'color': color,
										'verticalAlignment': 'baseline',
										'horizontalAlignment': align,
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
