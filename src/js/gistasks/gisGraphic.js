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
			'esri/geometry/Point',
			'esri/geometry/Polygon',
			'esri/graphic',
			'dojo/on'
	], function($viz, gcvizFunc, gisgeo, esriGraphLayer, esriTools, esriLine, esriFill, esriMarker, esriText, esriScreenPt, esriPt, esriPoly, esriGraph, dojoOn) {
		var initialize,
			importGraphics,
			exportGraphics,
			addUndoStack;

		initialize = function(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea) {

			// data model				
			var graphic = function(mymap, isGraphics, undo, redo, lblDist, lblArea) {
				var _self = this,
					symbLayer,
					measureLength, measureArea, measureAreaCallback, measureLabelCallback, measureText,
					mouseMeasureLength, nextMeasureLength, showNextMeasureLength,
					addBackgroundText, addToMap,
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
					var len, previous,
						flag = false,
						screenPt = point.screenPoint,
						geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));

					// set global then call the tool
					gKey = key;
					setColor(color);

					// check if the point is different from last one if so, add it
					len = array().length;
					if (len >= 1) {
						previous = array()[len - 1];
						if (previous.x === geometry.x && previous.y === geometry.y) {
							flag = true;
						}
					}
					
					if (!flag) {
						// push the geometry to the array (first point)
						array().push(geometry);
	
						if (type === 0) {
							if (len === 0) {
								measureLength(array());
								
								// add mouse mouve event to shop the theoric measure line
								mouseMeasureLength = mymap.on('mouse-move', gcvizFunc.debounce(function(evt) {
									var screenPt = evt.screenPoint,
										geometry = map.toMap(new esriScreenPt(screenPt.x, screenPt.y));
									nextMeasureLength(geometry, unit);
								}, 50, false));
							} else {
								gisgeo.measureLength(array(), unit, measureLength);
							}
						} else if (type === 1) {
							measureArea(array);
						}
					}
				};

				_self.addMeasureSumLength = function(array, key, unit) {
					var pt, text, offx, offy,
						dist = 0,
						len = array().length,
						last = array()[len - 1],
						secLast = array()[len - 2],
						angle = (Math.atan2((last.y - secLast.y), (last.x - secLast.x)) * (180 / Math.PI)),
						off = Math.round(angle/90);
					
					// set global then call the tool
					gKey = key;

					// calculate values
					while (len--) {
						pt = array()[len];

						if (pt.hasOwnProperty('distance')) {
							dist += pt.distance;
						}
					}

					// set good offset from angle and off
					if (off === 0) {
						offx = 20;
						offy = 10;
					} else if (off === 1) {
						offx = 0;
						offy = 10;
					} else if (off === -1) {
						offx = 0;
						offy = -20;
					} else {
						offx = -20;
						offy = 10;
					}
					
					// add text
					dist = Math.floor(dist * 100) / 100;
					text = txtDist + dist + ' ' + unit;
					last.text = text;
					measureText(last, 0, offx, offy);

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
					measureText(text, 0, 0, 0);

					// add to stack
					addUndoStack(gKey);
				};

				measureLength = function(array, unit) {
					var line, pt1, pt2, text, angle, off,
						offx = 0,
						offy = -15,
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
						
						// calculate angle
						angle = (Math.atan2((pt1.y - pt2.y), (pt1.x - pt2.x)) * (180 / Math.PI));
						if (angle > 90 || angle < -90) {
							angle -= 180;
						}
						
						// change offset if vertical
						off = Math.round(Math.abs(angle)/90);
						if (off === 1) {
							offx = 15;
							offy = 0;
						} else if (off === 3) {
							offx = -15;
							offy = 0;
						}

						measureText(text, angle, offx, offy);
					}
					
					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol = getSymbPoint(gColor, 4);
					graphic.key = gKey;
					symbLayer.add(graphic);
					
					mymap.graphics.clear();
				};

				// show the measure line before the user select the second point
				nextMeasureLength = function(geometry, unit) {
					var line,
						sr = map.spatialReference,
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

						gisgeo.measureLength([new esriPt(first.x, first.y, sr), new esriPt(geometry.x, geometry.y, sr)], unit, showNextMeasureLength);
				};
				
				showNextMeasureLength = function(array, unit) {
					// add text
					var symbol, back,
						pt = array[1],
						text = { 'geometry': {
									'x': pt.x, 'y': pt.y,
									'spatialReference': { 'wkid': wkid } } },
						graphic = new esriGraph(pt, symbol);
						graphic.symbol = getSymbText(black, pt.distance + ' ' + unit, 10, 0, 0, 10, 'bold', 'center');
					
					// add background then text
					addBackgroundText(graphic, white, 'center', 11, 0, 0, 10, mymap.graphics);
					mymap.graphics.add(graphic);
					
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

				measureText = function(pt, angle, offX, offY) {
					var graphic, symbol;

					graphic = new esriGraph(pt, symbol);
					graphic.symbol = getSymbText(black, pt.text, 8, angle, offX, offY, 'normal', 'center');
					graphic.key = gKey;

					// add background then text
					addBackgroundText(graphic, white, 'center', 9, angle, offX, offY, symbLayer);
					symbLayer.add(graphic);
					isGraphics(true);
				};

				addBackgroundText = function(item, backColor, align, size, angle, offX, offY, graphLayer) {
					var graphic, point,
						text = '',
						offsetX = -1 + offX,
						offsetY = -1 + offY,
						len = item.symbol.text.length * 2,
						geom = item.geometry,
						loop = 1;

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

					while (loop <= 3) {
						graphic = new esriGraph(point);
						graphic.symbol =  getSymbText(backColor, text, size, angle, offsetX + loop, offsetY, 'bold', align);
						graphic.key = gKey;
						graphLayer.add(graphic);
						loop++;
					}
				},

				addToMap = function(geometry) {
					var graphic,
						symbol = new esriLine(),
						geomType = geometry.type;
						
					gKey = gcvizFunc.getUUID();

					if (geomType === 'extent') {
						_self.eraseSelect(geometry);
					} else {
						if (geomType === 'polyline') {
							symbol = getSymbLine(gColor, 2);
							graphic = new esriGraph(geometry, symbol);
						} else if (geomType === 'point') {
							symbol = getSymbText(gColor, gText, 8, 0, 0, 0, 'normal', 'left');
							graphic = new esriGraph(geometry, symbol);
							addBackgroundText(graphic, gBackColor, 'left', 9, 0, 0, 0, symbLayer);
							
							// deactivate toolbar
							_self.deactivate();
							
							// reopen the dialog box and reactivate text tool
							setTimeout(function() {
								gcvizFunc.getElemValueVM(map.vIdName, ['draw', 'isTextDialogOpen'], 'js')(true);
							}, 1000);
							setTimeout(function() {
								toolbar.activate(esriTools.POINT);;
							}, 1500);
						}

						// add graphic
						graphic.key = gKey;
						symbLayer.add(graphic);
						isGraphics(true);

						// add to stack
						addUndoStack(gKey);
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

				_self.init();
			};

			return new graphic(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea);
		};

		importGraphics = function(map, graphics) {
			var item,
				graphic,
				key = key = gcvizFunc.getUUID(),
				layer = map.getLayer('gcviz-symbol'),
				len = graphics.length;

			while (len--) {
				item = graphics[len];
				graphic = new esriGraph(item);
				graphic.key = key;
				layer.add(graphic);
			}
			
			// add undo stack
			addUndoStack(key);
		};

		exportGraphics = function(map) {
			var json, graphic,
				output = [],
				graphics = map.getLayer('gcviz-symbol').graphics,
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
