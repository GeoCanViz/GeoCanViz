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
			'knockout',
			'gcviz-func',
			'gcviz-gissymbol',
			'gcviz-gisgeo',
			'gcviz-gismap',
			'esri/layers/GraphicsLayer',
			'esri/toolbars/draw',
			'esri/symbols/SimpleLineSymbol',
			'esri/geometry/ScreenPoint',
			'esri/geometry/Point',
			'esri/geometry/Polygon',
			'esri/geometry/Polyline',
			'esri/graphic',
			'dojo/on'
	], function($viz, ko, gcvizFunc, gissymb, gisgeo, gisMap, esriGraphLayer, esriTools, esriLine, esriScreenPt, esriPt, esriPoly, esriPolyline, esriGraph, dojoOn) {
		var initialize,
			importGraphics,
			exportGraphics,
			createGraphic,
			drawBox,
			drawWCAGBox,
			callbackCG,
			addUndoStack,
			privateMap,
			gissymbols;

		initialize = function(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea) {

			// there is a problem with the define. the gcviz-gissymbol is not able to be set. The weird thing
			// is if I replace gisgeo with gissymbol in the define, gisgeo will be set as gissymbol but I can't
			// have access to gisgeo anymore. With the require, we set the reference to gissymbol (hard way)
			require(['gcviz-gissymbol'], function(gissymb) {
				gissymbols = gissymb;
			});

			// data model				
			var graphic = function(mymap, isGraphics, undo, redo, lblDist, lblArea) {
				var _self = this,
					symbLayer,
					lengthWCAG, areaWCAG,
					measureLength, measureArea, measureAreaCallback, measureLabelCallback, measureText,
					mouseMeasureLength, nextMeasureLength, showNextMeasureLength,
					addBackgroundText, addToMap,
					setColor,
					toolbar,
					gText, gColor, gKey, gUnit, gBackColor, gColorName,
					stackUndo = undo,
					stackRedo = redo,
					map = mymap,
					wkid = map.vWkid,
					txtDist = lblDist,
					txtArea = lblArea,
					black = [0,0,0,255],
					red = [229,0,51,255],
					green = [0,140,0,255],
					blue = [0,77,255,255],
					yellow = [255,217,51,255],
					white = [255,255,255,255],
					polyFill = [205,197,197,100],
					isWCAG = false;

				_self.init = function() {
					// add the graphic layers to the map
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

					toolbar.setLineSymbol(gissymbols.getSymbLine(gColor, 2));
					toolbar.activate(esriTools.FREEHAND_POLYLINE);
				};

				_self.drawLineWCAG = function(points, color) {
					// set global then call the tool
					setColor(color);

					// project point then call addToMap
					gisgeo.projectCoords(points, 4326, map.spatialReference.wkid, addToMap);
				};

				_self.drawText = function(text, color) {
					// set global then call the tool
					gText = text;
					setColor(color);

					toolbar.activate(esriTools.POINT);
				};

				_self.drawTextWCAG = function(point, text, color) {
					// set global then call the tool
					gText = text;
					setColor(color);

					// project point then call addToMap
					gisgeo.projectCoords([[point[0], point[1]]], 4326, map.spatialReference.wkid, addToMap);
				};

				_self.drawExtent = function() {
					toolbar.setFillSymbol(gissymbols.getSymbErase());
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

					// clear graphics (symbol layer and global graphic layer where we have dynamic measure)
					// and set isGraphics
					symbLayer.clear();
					map.graphics.clear();
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

					// focus map
					gcvizFunc.focusMap(mymap, false);
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
					if (typeof mouseMeasureLength !== 'undefined') {
						mouseMeasureLength.remove();
					}
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

					// check if there is graphics. Check if the only one is a point at x:0;y:0
					// this point is created by the API sometimes
					if (symbLayer.graphics.length === 0) {
						isGraphics(false);
					} else if (symbLayer.graphics.length === 1 && symbLayer.graphics[0]._extent.xmax === 0) {
						isGraphics(false);
					} else {
						isGraphics(true);
					}
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

					// check if there is graphics. Check if the only one is a point at x:0;y:0
					// this point is created by the API sometimes
					if (symbLayer.graphics.length === 0) {
						isGraphics(false);
					} else if (symbLayer.graphics.length === 1 && symbLayer.graphics[0]._extent.xmax === 0) {
						isGraphics(false);
					} else {
						isGraphics(true);
					}
				};

				_self.measureWCAG = function(points, key, type, unit, color) {
					// set global then call the tool
					gKey = key;
					gUnit = unit;
					setColor(color);
					isWCAG = true;

					if (type === 0) {
						// project point then call lengthWCAG
						gisgeo.projectCoords(points, 4326, map.spatialReference.wkid, lengthWCAG);
					} else {
						// project point then call areaWCAG
						gisgeo.projectCoords(points, 4326, map.spatialReference.wkid, areaWCAG);
					}
				};

				lengthWCAG = function(array) {
					var arrayKo,
						points = [],
						i = 0,
						len = array.length - 1;

					// add every part of the line
					while (i < len) {
						points[0] = array[i];
						points[1] = array[i + 1];
						i += 1;

						gisgeo.measureLength(points, gUnit, measureLength, true);
						points = [];
					}

					// add the sum length after a timeout because path have to be created before we call the
					// sum length. Need to convert to a ko array.
					arrayKo = ko.observableArray(array.reverse());
					setTimeout(function() {
						_self.addMeasureSumLength(arrayKo, gKey, gUnit, true);
					}, 2000);
				};

				areaWCAG = function(array) {
					var arrayKo;

					// add the area then sum area after a timeout because path have to be created before we call the
					// sum length. Need to convert to a ko array.
					arrayKo = ko.observableArray(array.reverse());
					measureArea(arrayKo);
					setTimeout(function() {
						_self.addMeasureSumArea(arrayKo(), gKey, gUnit, true);
					}, 2000);
				};

				_self.addMeasure = function(array, key, type, unit, color, drawMap, point) {
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
								gisgeo.measureLength(array(), unit, measureLength, drawMap);
							}
						} else if (type === 1) {
							measureArea(array);
						}
					}
				};

				_self.removeMouseMove = function() {
					// remove mouse move event
					mouseMeasureLength.remove();
				};

				_self.addMeasureSumLength = function(array, key, unit, drawMap) {
					var pt, text, offx, offy,
						dist = 0,
						len = array().length,
						last = array()[len - 1],
						secLast = array()[len - 2],
						angle = (Math.atan2((last.y - secLast.y), (last.x - secLast.x)) * (180 / Math.PI)),
						off = Math.round(angle/90);

					if (drawMap) {
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
					}

					// add to stack
					addUndoStack(gKey);
					isGraphics(true);

					// remove mouse move event and clear the dump graphics
					if (!isWCAG) {
						mouseMeasureLength.remove();
					} else {
						isWCAG = false;
					}
					mymap.graphics.clear();
				};

				_self.addMeasureSumArea = function(array, key, unit, drawMap) {
					var item, polyJson, poly,
						polyArr = [],
						len = array.length,
						lastPoly = len - 1;

					// set global then call the tool
					gKey = key;

					// create poly geom and add the closing point
					while (len--) {
						item = array[len];
						polyArr.push([item.x, item.y]);
					}

					item = array[lastPoly];
					polyArr.push([item.x, item.y]);

					polyJson = { 'rings': [polyArr],
									'spatialReference': { 'wkid': wkid } };
					poly = new esriPoly(polyJson);

					// area and length from geosprocessing
					gisgeo.measureArea(poly, unit, measureAreaCallback, array, drawMap);

					// set is WCAG false before finishing
					isWCAG = false;
				};

				measureAreaCallback = function(poly, areas, unit, array, drawMap) {
					var item,
						info = {},
						len = array.length - 1;

					info.area = Math.floor(areas.areas[0] * 100) / 100;
					info.length = Math.floor(areas.lengths[0] * 100) / 100;
					info.unit = unit;

					// put info on the item so it can be retrieve in the view model
					item = array[len];
					item.area = info.area;
					item.length = info.length;

					// add to stack
					addUndoStack(gKey);
					isGraphics(true);

					// get label coordinnate from geoprocessing
					if (drawMap) {
						gisgeo.labelPoints(poly, info, measureLabelCallback);
					}
				};

				measureLabelCallback = function(points, info) {
					// add text
					var pt = points[0],
						text = { 'geometry': {
								'x': pt.x, 'y': pt.y,
								'spatialReference': { 'wkid': wkid } } };
					text.text = txtArea + info.area + ' ' + info.unit + '2';
					measureText(text, 0, 0, 0);
				};

				measureLength = function(array, unit, drawMap) {
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
						graphic.symbol = gissymbols.getSymbLine(gColor, 1);
						graphic.key = gKey;
						symbLayer.add(graphic);

						// add text
						if (drawMap) {
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
					}

					// add the point symbol
					graphic = new esriGraph(array[len - 1]);
					graphic.symbol = gissymbols.getSymbPoint(gColor, 4, polyFill, 2);
					graphic.key = gKey;
					symbLayer.add(graphic);

					mymap.graphics.clear();
				};

				// show the measure line before the user select the second point
				nextMeasureLength = function(geometry, unit) {
					var sr = map.spatialReference,
						graphics = symbLayer.graphics,
						len = graphics.length,
						first = graphics[len - 1].geometry,
						line = { 'geometry': {
										'paths': [[[first.x, first.y], [geometry.x, geometry.y]]],
										'spatialReference': { 'wkid': wkid } } };

						mymap.graphics.clear();
						graphic = new esriGraph(line);
						graphic.symbol = gissymbols.getSymbLine(gColor, 1);
						mymap.graphics.add(graphic);

						gisgeo.measureLength([new esriPt(first.x, first.y, sr), new esriPt(geometry.x, geometry.y, sr)], unit, showNextMeasureLength);
				};

				showNextMeasureLength = function(array, unit) {
					// add text
					var symbol, graphic,
						pt = array[1],
						distance = pt.distance;

					if (distance > 0) {
						graphic = new esriGraph(pt, symbol);
						graphic.symbol = gissymbols.getSymbText(gColor, pt.distance + ' ' + unit, 10, 0, 0, -20, 'normal', 'center');

						// add background then text
						addBackgroundText(graphic, gBackColor, 'center', 12, 0, -2, -21, mymap.graphics);
						mymap.graphics.add(graphic);
					}
				};

				measureArea = function(array) {
					var item, poly, polyArr = [],
						len = array().length,
						lenPoly = len,
						lastPoly = len - 1;

					// add the point symbol
					graphic = new esriGraph(array()[len - 1]);
					graphic.symbol = gissymbols.getSymbPoint(gColor, 4, polyFill, 2);
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
						graphic.symbol = gissymbols.getSymbPoly(gColor, polyFill, 1);
						graphic.key = gKey;
						symbLayer.add(graphic);
					}
				};

				measureText = function(pt, angle, offX, offY) {
					var graphic, symbol;

					graphic = new esriGraph(pt, symbol);
					graphic.symbol = gissymbols.getSymbText(gColor, pt.text, 10, angle, offX, offY, 'normal', 'center');
					graphic.key = gKey;

					// add background then text
					addBackgroundText(graphic, gBackColor, 'center', 12, angle, offX, offY - 2, symbLayer);
					symbLayer.add(graphic);
					isGraphics(true);
				};

				addBackgroundText = function(item, backColor, align, size, angle, offX, offY, graphLayer) {
					var graphic, point, textWidth, len,
						text = '',
						symbol = item.symbol,
						geom = item.geometry;

					// create the geometry array
					point = { 'geometry': {
									'x': geom.x, 'y': geom.y,
									'spatialReference': { 'wkid': wkid } } };

					// get text width from canvas because symbol.getWidth give same result between I and M
					// we need this to calculate background length
					textWidth = gcvizFunc.getTextWidth(symbol.text, symbol.font);
					len = Math.ceil(textWidth / 8);
					if (len < 5) {
						len += 1;
					}

					// there is no background color for text symbol. To solve this, we create
					// text symbol (with a block) to mimic a text background. If we use line or
					// polygon, we have problem when user zooms in or out because the geometry
					// does not follow the text because it is scale dependent.
					while (len--) {
						text += '\u2588';
					}

					graphic = new esriGraph(point);
					graphic.symbol = gissymbols.getSymbText(backColor, text, size, angle, offX, offY, 'bold', align);
					graphic.key = gKey;
					graphLayer.add(graphic);
				},

				addToMap = function(geometries) {
					var graphic, geometry, geomType,
						symbol = new esriLine();

					// if wcag mode enable, the geometries will be an array
					if (geometries.length === undefined) {
						geometry = geometries;
					} else if (geometries.length === 1) {
						geometry = geometries[0];
					} else {
						geometry = new esriPolyline(geometries[0].spatialReference);
						geometry.addPath(geometries);
					}

					geomType = geometry.type;
					gKey = gcvizFunc.getUUID();

					if (geomType === 'extent') {
						_self.eraseSelect(geometry);
					} else {
						if (geomType === 'polyline') {
							symbol = gissymbols.getSymbLine(gColor, 2);
							graphic = new esriGraph(geometry, symbol);

							// focus the map. We need to specify this because when you use the keyboard to
							// activate ta tool, the focus sometimes doesnt go to the map.
							gcvizFunc.focusMap(mymap, false);
						} else if (geomType === 'point') {
							symbol = gissymbols.getSymbText(gColor, gText, 10, 0, 0, 0, 'normal', 'left');
							graphic = new esriGraph(geometry, symbol);
							addBackgroundText(graphic, gBackColor, 'left', 12, 0, -4, -1, symbLayer);

							// deactivate toolbar
							_self.deactivate();

							// reopen the dialog box and reactivate text tool
							setTimeout(function() {
								gcvizFunc.getElemValueVM(map.vIdName, ['draw', 'isTextDialogOpen'], 'js')(true);
							}, 1000);
							setTimeout(function() {
								toolbar.activate(esriTools.POINT);
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
					} else if (color === 'green') {
						gColor = green;
						gBackColor = white;
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

				_self.init();
			};

			return new graphic(mymap, isGraphics, stackUndo, stackRedo, lblDist, lblArea);
		};

		importGraphics = function(map, graphics, isGraphics) {
			var item,
				graphic,
				extents = [],
				key = gcvizFunc.getUUID(),
				layer = map.getLayer('gcviz-symbol'),
				len = graphics.length;

			// enable delete
			if (len > 0) {
				isGraphics(true);
			}

			while (len--) {
				item = graphics[len];
				graphic = new esriGraph(item);
				extents.push(graphic);
				graphic.key = key;
				layer.add(graphic);
			}

			// get the extent then zoom
			gisMap.zoomGraphics(map, extents);

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

		createGraphic = function(map, type, geom, att, sr, key) {
			var geometry;

			// create geometry type
			if (type === 'point') {
				geometry = new esriPt({ 'x': geom.x, 'y': geom.y, 'spatialReference': sr });
			} else if (type === 'polyline') {
				geometry = new esriPolyline({ 'paths': geom.paths, 'spatialReference': sr });
			} else if (type === 'polygon') {
				geometry = new esriPoly({ 'rings': geom.polygon, 'spatialReference': sr });
			}

			// set map for callback function
			privateMap = map;

			// set attributes then project geometry then addToMap
			att.key = key;
			geometry.attributes = { },
			geometry.attributes.attributes = att;
			gisgeo.projectGeoms([geometry], map.spatialReference.wkid, callbackCG);
		};

		callbackCG = function(data) {
			var symb, graphic,
				elem = data[0],
				geometry = elem.geometry,
				type = geometry.type,
				layer = privateMap.getLayer('gcviz-symbol');

			// from geometry type, select symbol
			if (type === 'point') {
				symb = gissymbols.getSymbPoint([205,197,197,180], 20, [229,0,51,255], 2);
			} else if (type === 'polyline') {
				symb = gissymbols.getSymbLine([229,0,51,255], 2);
			} else if (type === 'polygon') {
				symb = gissymbols.getSymbPoly([229,0,51,255], [205,197,197,100], 2);
			}

			// generate graphic and asign symbol
			graphic = new esriGraph(geometry);
			graphic.symbol = symb;

			// add the key to be able to find back the graphic
			graphic.key = elem.attributes.key;

			// add attributes
			graphic.attributes = elem.attributes;
			
			// add graphic
			layer.add(graphic);

			// reset private map
			privateMap = '';
		};

		drawBox = function(map, densify, success) {
			// create esri toolbar
			var clickEvt,
				tool = new esriTools(map, { showTooltips: false });

			// there is a problem with the define. the gcviz-gissymbol is not able to be set. The weird thing
			// is if I replace gisgeo with gissymbol in the define, gisgeo will be set as gissymbol but I can't
			// have access to gisgeo anymore. With the require, we set the reference to gissymbol (hard way)
			require(['gcviz-gissymbol'], function(gissymb) {
				dojoOn(tool, 'DrawEnd', gcvizFunc.closureFunc(function(tool, geometry) {
					var polyJson, poly, arr;

					// deactivate then call the retrun function
					tool.deactivate();

					// check if we need to densify extent
					if (!densify) {
						success(geometry);
					} else {
						// create a polygon from extent
						arr = new Array(5);
						arr[0] = [geometry.xmin, geometry.ymin];
						arr[1] = [geometry.xmin, geometry.ymax];
						arr[2] = [geometry.xmax, geometry.ymax];
						arr[3] = [geometry.xmax, geometry.ymin];
						arr[4] = [geometry.xmin, geometry.ymin];
						polyJson = { 'rings': [arr],
										'spatialReference': { 'wkid': map.vWkid } };
						poly = new esriPoly(polyJson);

						// densify extent
						gisgeo.densifyGeom(poly, 'km', success);
					}

					// remove event
					clickEvt.remove();
				}, tool));

				// if user click instead of draw
				clickEvt = map.on('click', function() {
					// deactivate then call the retrun function
					tool.deactivate();
					success();

					// remove event
					clickEvt.remove();
				});

				// set fill and activate
				tool.setFillSymbol(gissymb.getSymbErase());
				tool.activate(esriTools.EXTENT);
			});

			// return tools with clisk event to be able to deactivate from caller
			return [tool, clickEvt];
		};

		drawWCAGBox = function(xmin, ymin, xmax, ymax, inwkid, outwkid, success) {
			var polyJson, poly,
				arr =  new Array(22),
				i = 1,
				len = 10,
				delta = (xmin - xmax) / len;

			// add lower left corner and upeer left corner
			arr[0] = [-xmin, ymin];
			arr[1] = [-xmin, ymax];

			// densify coords in x for upper limit
			while (i <= len) {
				arr[i + 1] = [-xmin + (delta * i), ymax];
				i++;
			}

			// densify coords in x for lower limit
			i = 1;
			while (i <= len) {
				arr[i + 11] = [-xmax - (delta * i), ymin];
				i++;
			}

			// create a polygon from extent
			polyJson = { 'rings': [arr],
							'spatialReference': { 'wkid': inwkid } };
			poly = new esriPoly(polyJson);

			// project extent
			gisgeo.projectGeoms([poly], outwkid, success);
		};

		return {
			initialize: initialize,
			importGraphics: importGraphics,
			exportGraphics: exportGraphics,
			createGraphic: createGraphic,
			drawBox: drawBox,
			drawWCAGBox: drawWCAGBox
		};
	});
}());
