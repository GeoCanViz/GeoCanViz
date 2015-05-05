/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'genfile',
			'gcviz-i18n',
			'gcviz-vm-map',
			'gcviz-func',
			'gcviz-gisgraphic',
			'gcviz-gisdatagrid'
	], function($viz, ko, generateFile, i18n, mapVM, gcvizFunc, gisGraphic, gisDG) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbardrawViewModel = function($mapElem, mapid) {
				var _self = this,
					globalKey,
					clickMeasureLength, clickMeasureArea,
					dblclickMeasure,
					lblDist = i18n.getDict('%toolbardraw-dist'),
					lblSeg = i18n.getDict('%toolbardraw-seg'),
					lblArea = i18n.getDict('%toolbardraw-area'),
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					$container = $viz('#' + mapid + '_holder_layers'),
					$btnDraw = $mapElem.find('.gcviz-draw-line'),
					$btnText = $mapElem.find('.gcviz-draw-text'),
					$btnLength = $mapElem.find('.gcviz-draw-length'),
					$btnArea = $mapElem.find('.gcviz-draw-area'),
					$btnDelsel = $mapElem.find('.gcviz-draw-delsel'),
					$menu = $viz('#gcviz-menu' + mapid);

				// viewmodel mapid to be access in tooltip and wcag custom binding
				_self.mapid = mapid;

				// tooltip
				_self.tpBlack = i18n.getDict('%toolbardraw-tpcolorblack');
				_self.tpRed = i18n.getDict('%toolbardraw-tpcolorred');
				_self.tpGreen = i18n.getDict('%toolbardraw-tpcolorgreen');
				_self.tpBlue = i18n.getDict('%toolbardraw-tpcolorblue');
				_self.tpYellow = i18n.getDict('%toolbardraw-tpcoloryellow');
				_self.tpWhite = i18n.getDict('%toolbardraw-tpcolorwhite');
				_self.tpDraw = i18n.getDict('%toolbardraw-tpdraw');
				_self.tpText = i18n.getDict('%toolbardraw-tptext');
				_self.tpMeasureArea = i18n.getDict('%toolbardraw-tpmeasurearea');
				_self.tpMeasureLength = i18n.getDict('%toolbardraw-tpmeasurelength');
				_self.tpErase = i18n.getDict('%toolbardraw-tperase');
				_self.tpEraseSel = i18n.getDict('%toolbardraw-tperasesel');
				_self.tpUndo = i18n.getDict('%toolbardraw-tpundo');
				_self.tpRedo = i18n.getDict('%toolbardraw-tpredo');
				_self.tpImport = i18n.getDict('%toolbardraw-tpimport');
				_self.tpExport = i18n.getDict('%toolbardraw-tpexport');

				// buttons label
				_self.lblColor = i18n.getDict('%toolbardraw-lblselcolor');
				_self.lblMeasFull = i18n.getDict('%toolbardraw-lblmeasfull');
				_self.lblMeasLine = i18n.getDict('%toolbardraw-lblmeasline');
				_self.lblMeasArea = i18n.getDict('%toolbardraw-lblmeasarea');
				_self.lblDrawFull = i18n.getDict('%toolbardraw-lbldrawfull');
				_self.lblDrawLine = i18n.getDict('%toolbardraw-lbldrawline');
				_self.lblDrawText = i18n.getDict('%toolbardraw-lbldrawtext');
				_self.lblErase = i18n.getDict('%toolbardraw-lblerase');
				_self.lblUndoRedo = i18n.getDict('%toolbardraw-lblundoredo');
				_self.lblImpExp = i18n.getDict('%toolbardraw-lblimpexp');

				// dialog window for text
				_self.lblTextTitle = i18n.getDict('%toolbardraw-inputbox-name');
				_self.lblTextInfo = i18n.getDict('%toolbardraw-insinputbox');
				_self.isTextDialogOpen = ko.observable();
				_self.isText = ko.observable(false);
				_self.drawTextValue = ko.observable('');

				// dialog window for length
				_self.measureDisplayLabel = i18n.getDict('%toolbardraw-lbllengthdisplay');
				_self.isMeasureDialogOpen = ko.observable();
				_self.segmentMeasures = ko.observable('');
				_self.totalMeasures = ko.observable('');
				_self.isMeasureOnMap = ko.observable(false);

				// keep color setting
				_self.selectedColor = ko.observable();

				// measure array and info
				_self.measureHolder = ko.observableArray([]);
				_self.measureType = '';

				// enable buttons (undo, redo)
				_self.stackUndo = ko.observableArray([]);
				_self.stackRedo = ko.observableArray([]);
				_self.isGraphics = ko.observable(false);

				// set active tool
				_self.activeTool = ko.observable('');

				// WCAG
				_self.mapid = mapid;
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.lblWCAGadd = i18n.getDict('%wcag-addcoords');
				_self.lblWCAGAddPoint = i18n.getDict('%wcag-add');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 150 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.WCAGcoords = ko.observableArray([]);
				_self.isWCAG = ko.observable(false);
				_self.isDialogWCAG = ko.observable(false);
				_self.wcagok = false;

				_self.init = function() {
					// select black by default
					_self.selectColorClick('black');

					// graphic object
					mymap.stackU = [];
					mymap.stackR = [];
					
					_self.graphic = new gisGraphic.initialize(mymap, lblDist, lblArea);

					return { controlsDescendantBindings: true };
				};

				_self.updateStack = function() {
					_self.isGraphics(_self.graphic.getIsGraphics());
					_self.stackUndo(_self.graphic.getStackUndo());
					_self.stackRedo(_self.graphic.getStackRedo());
				};

				// end draw action on tools toolbar click
				_self.endDraw = function() {
					// set popup event
					gisDG.addEvtPop();

					// enable zoom extent button on map
					mapVM.disableZoomExtent(false);

					// remove cursor and event only if WCAG mode is not enable
					if (!_self.isWCAG()) {
						// remove cursor and set default
						_self.removeCursors();
						$container.css('cursor', 'default');

						// measure length or area
						if (_self.measureType === 'length') {
							clickMeasureLength.remove();
							dblclickMeasure.remove();
							_self.endMeasureLength();
						} else if (_self.measureType === 'area') {
							clickMeasureArea.remove();
							dblclickMeasure.remove();
							_self.endMeasureArea();
						}
					}

					_self.graphic.deactivate();
					_self.measureType = '';

					// hide measure window and reset values
					_self.dialogMeasureClose();

					// set the focus back to the right tool
					_self.setFocus();

					// update stack and state for buttons with observable
					_self.updateStack();

					// open menu
					$menu.accordion('option', 'active', 0);
				};

				// add text dialog buttons functions (ok and cancel)
				_self.dialogTextOk = function() {
					var value = _self.drawTextValue();

					if (value !== '') {
						// check if WCAG mode is enable, if so use dialog box instead!
						if (!_self.isWCAG()) {
							_self.graphic.drawText(value, _self.selectedColor());

							// set the holder empty
							_self.drawTextValue('');
						} else {
							_self.isDialogWCAG(true);
						}
						_self.isText(true);
						_self.isTextDialogOpen(false);
					} else {
						_self.dialogTextCancel();
					}
				};

				_self.dialogTextOkEnter = function() {
					_self.dialogTextOk();
				};

				_self.dialogTextCancel = function() {
					// open menu and reset cursor
					_self.isTextDialogOpen(false);
					_self.isText(false);
					_self.endDraw();
				};

				_self.dialogTextClose = function() {
					// if window is close with the close X
					if (_self.isTextDialogOpen()) {
						// open menu and reset cursor
						_self.isTextDialogOpen(false);
						_self.isText(false);
						_self.endDraw();
					}
				};

				_self.selectColorClick = function(color) {
					_self.selectedColor(color);
				};

				_self.drawClick = function() {
					_self.closeTools('draw');

					// check if WCAG mode is enable, if so use dialog box instead!
					if (!_self.isWCAG()) {
						// set cursor to selected colour (remove default cursor first)
						$container.css('cursor', '');
						_self.addDrawCursor(_self.selectedColor());
						_self.graphic.drawLine(_self.selectedColor());
					} else {
						_self.isDialogWCAG(true);
						_self.enableOkWCAG('disable');
					}
				};

				_self.textClick = function() {
					_self.closeTools('text');

					// check if WCAG mode is disable
					if (!_self.isWCAG()) {
						// set cursor (remove default cursor first and all other cursors)
						$container.css('cursor', '');
						$container.addClass('gcviz-text-cursor');
					}

					// show dialog
					_self.isText(false);
					_self.drawTextValue('');
					_self.isTextDialogOpen(true);
				};

				_self.eraseClick = function() {
					_self.graphic.erase();

					// set focus on draw because when button is disable the focus goes
					// automatically to the top of the page if not
					$btnDraw.focus();

					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();

					// update stack and state for buttons with observable
					_self.updateStack();

				};

				_self.eraseSelClick = function() {
					_self.closeTools('erase');

					// set cursor (remove default cursor first and all other cursors)
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor-erase');
					_self.graphic.drawExtent();

					// focus the map. We need to specify this because when you use the keyboard to
					// activate ta tool, the focus sometimes doesnt go to the map.
					gcvizFunc.focusMap(mymap, false);
				};

				_self.undoClick = function() {
					_self.graphic.undo();

					// set focus on draw because when button is disable the focus goes
					// automatically to the top of the page if not
					if (_self.stackUndo().length === 0) {
						$btnDraw.focus();
					}

					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();

					// update stack and state for buttons with observable
					_self.updateStack();

				};

				_self.redoClick = function() {
					_self.graphic.redo();

					// set focus on draw because when button is disable the focus goes
					// automatically to the top of the page if not
					if (_self.stackRedo().length === 0) {
						$btnDraw.focus();
					}

					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();

					// update stack and state for buttons with observable
					_self.updateStack();

				};

				_self.dialogMeasureClose = function() {
					_self.isMeasureDialogOpen(false);
					_self.segmentMeasures('');
					_self.totalMeasures('');
				};

				_self.measureLengthClick = function() {
					var segments = 0;

					globalKey = gcvizFunc.getUUID();
					_self.closeTools('length');
					_self.measureType = 'length';

					// check if WCAG mode is enable, if so use dialog box instead!
					if (!_self.isWCAG()) {
						// show measure window
						_self.isMeasureDialogOpen(true);

						// set cursor (remove default cursor first and all other cursors)
						$container.css('cursor', '');
						$container.addClass('gcviz-draw-cursor-measure');

						clickMeasureLength = mymap.on('click', function(event) {
											_self.graphic.addMeasure(_self.measureHolder, globalKey, 0, 'km', _self.selectedColor(), _self.isMeasureOnMap(), event);
											_self.setSegmentLength(segments);
											segments++;
										});

						// on double click, close line and show total length
						dblclickMeasure = mymap.on('dbl-click', function(event) {
							// add last point then close
							_self.graphic.addMeasure(_self.measureHolder, globalKey, 0, 'km', _self.selectedColor(), _self.isMeasureOnMap(), event);
							_self.setSegmentLength(segments);
							segments = 0;

							// remove mouse mouve event that shows distance after the element is finish
							_self.graphic.removeMouseMove();

							// add a small time out to let the last point to go in. If not,
							// the last point is not in the sum length
							setTimeout(function() {
								_self.endMeasureLength();
							}, 300);
						});
					} else {
						_self.isDialogWCAG(true);
						_self.enableOkWCAG('disable');
					}

					// focus the map. We need to specify this because when you use the keyboard to
					// activate ta tool, the focus sometimes doesnt go to the map.
					gcvizFunc.focusMap(mymap, false);
				};

				_self.setSegmentLength = function(segments) {
					var pt,
						array = _self.measureHolder(),
						nbSeg = array.length,
						len = nbSeg - 1;

					// add value to window
					if (len > 0) {
						// put in a timeout to let gisGraphic and gisGeoprocessing generate the distance
						setTimeout(function() {
							pt = array[len];
							if (pt.hasOwnProperty('distance') && segments < nbSeg) {
								_self.segmentMeasures(_self.segmentMeasures() + lblSeg + pt.distance + ' km<br/>');
								_self.setTotalMeasure(array, nbSeg);
							}
						}, 1000);			
					} else {
						// the array only have 1 point, it is a new line, reinitalize the value
						_self.segmentMeasures('');
						_self.totalMeasures('');
					}
				};

				_self.setTotalMeasure = function(array, len) {
					var pt,
						dist = 0;

					// calculate values and add to window
					while (len--) {
						pt = array[len];

						if (pt.hasOwnProperty('distance')) {
							dist += pt.distance;
						}
					}
					dist = Math.floor(dist * 100) / 100;
					_self.totalMeasures(lblDist + dist + ' km');
				};

				_self.endMeasureLength = function() {
					var len = _self.measureHolder().length;

					if (len >= 2) {
						_self.graphic.addMeasureSumLength(_self.measureHolder, globalKey, 'km', _self.isMeasureOnMap());
					} else if (len > 0) {
						_self.graphic.eraseUnfinish();
					}

					// reset variables
					_self.measureHolder([]);
					globalKey = gcvizFunc.getUUID();
				};

				_self.measureAreaClick = function() {
					var segments = 0;

					globalKey = gcvizFunc.getUUID();
					_self.closeTools('area');
					_self.measureType = 'area';

					// check if WCAG mode is enable, if so use dialog box instead!
					if (!_self.isWCAG()) {
						// show measure window
						_self.isMeasureDialogOpen(true);

						// set cursor (remove default cursor first and all other cursors)
						$container.css('cursor', '');
						$container.addClass('gcviz-draw-cursor-measure');

						clickMeasureArea = mymap.on('click', function(event) {
											if (segments === 0) {
												_self.totalMeasures('');
											}
											_self.graphic.addMeasure(_self.measureHolder, globalKey, 1, 'km', _self.selectedColor(), false, event);
											segments++;
										});
						// on double click, close polygon and show total length and area
						dblclickMeasure = mymap.on('dbl-click', function(event) {
							// add last point then close
							_self.graphic.addMeasure(_self.measureHolder, globalKey, 1, 'km', _self.selectedColor(), false, event);
							_self.endMeasureArea();
							segments = 0;
						});
					} else {
						_self.isDialogWCAG(true);
						_self.enableOkWCAG('disable');
					}

					// focus the map. We need to specify this because when you use the keyboard to
					// activate ta tool, the focus sometimes doesnt go to the map.
					gcvizFunc.focusMap(mymap, false);
				};

				_self.endMeasureArea = function() {
					var array = _self.measureHolder(),
						len = array.length;

					if (len >= 3) {
						_self.graphic.addMeasureSumArea(array, globalKey, 'km', _self.isMeasureOnMap());
						setTimeout(function() {
							var item = array[len - 1];
							_self.totalMeasures(lblArea + item.area + ' km2<br/>' + lblDist + item.length + 'km');
						}, 1250);
					} else if (len > 0) {
						_self.graphic.eraseUnfinish();
					}

					// reset variables
					_self.measureHolder([]);
					globalKey = gcvizFunc.getUUID();
				};

				_self.launchDialog = function() {
					// launch the dialog. We cant put the dialog in the button because
					// Firefox will not launch the window. To be able to open the window,
					// we mimic the click
					$viz(document.getElementById('fileDialogAnno' + _self.mapid))[0].click();
				};

				_self.importClick = function(vm, event) {
					var file, reader,
						files = event.target.files,
						len = files.length;

					// loop through the FileList.
					while (len--) {
						file = files[len];
						reader = new FileReader();
						// closure to capture the file information and launch the process
						reader.onload = _self.loadFile();
						reader.readAsText(file);
					}

					// clear the selected file
					document.getElementById('fileDialogAnno' + _self.mapid).value = '';
				};

				_self.loadFile = function() {
					return function(e) {
						var graph,
							jsonGraphics;

						try {
							jsonGraphics = JSON.parse(e.target.result);
							graph = gisGraphic.importGraphics(mymap, jsonGraphics);
							
							// update stack and state for buttons with observable
							_self.graphic.addUndoStack(graph.key, graph.graphics);
							_self.updateStack();
						} catch(error) {
							console.log('Not able to load graphics' + ': ' + error);
						}
					};
				};

				_self.exportClick = function() {
					var graphics = gisGraphic.exportGraphics(mymap);

					$viz.generateFile({
						filename	: 'graphics.json',
						filetype	: 'application/json',
						content		: graphics,
						script		: config.urldownload
					});
				};

				_self.closeTools = function(tool) {
					// close menu
					$menu.accordion('option', 'active', false);

					// set event for the toolbar
					$menu.on('accordionbeforeactivate', function() {
						$menu.off();
						_self.endDraw();
					});

					// remove popup event
					gisDG.removeEvtPop();

					// disable zoom extent button on map
					mapVM.disableZoomExtent(true);

					_self.activeTool(tool);
				};

				_self.removeCursors = function() {
					$container.removeClass('gcviz-draw-cursor-black gcviz-draw-cursor-blue ' +
											'gcviz-draw-cursor-green gcviz-draw-cursor-red ' +
											'gcviz-draw-cursor-yellow gcviz-draw-cursor-white ' +
											'gcviz-text-cursor gcviz-draw-cursor-measure gcviz-draw-cursor-erase');
				};

				_self.addDrawCursor = function(colour) {
					// Add cursor class
					if (colour === 'black') {
						$container.addClass('gcviz-draw-cursor-black');
					} else if (colour === 'blue') {
						$container.addClass('gcviz-draw-cursor-blue');
					} else if (colour === 'green') {
						$container.addClass('gcviz-draw-cursor-green');
					} else if (colour === 'red') {
						$container.addClass('gcviz-draw-cursor-red');
					} else if (colour === 'yellow') {
						$container.addClass('gcviz-draw-cursor-yellow');
					} else if (colour === 'white') {
						$container.addClass('gcviz-draw-cursor-white');
					}
				};

				_self.setFocus = function() {

					$menu.on('accordionactivate', function() {
						$menu.off('accordionactivate');

						// bug with jQueryUI, focus does not work when menu open
						setTimeout(function() {
							if (_self.activeTool() === 'draw') {
								$btnDraw.focus();
							} else if (_self.activeTool() === 'text') {
								$btnText.focus();
							} else if (_self.activeTool() === 'length') {
								$btnLength.focus();
							} else if (_self.activeTool() === 'area') {
								$btnArea.focus();
							} else if (_self.activeTool() === 'erase') {

								if (_self.isGraphics()) {
									$btnDelsel.focus();
								} else {
									// set focus on draw because when button is disable the focus goes
									// automatically to the top of the page if not
									$btnDraw.focus();
								}
							}

							// reset active tools
							_self.activeTool('');
						}, 1000);
					});
				};

				_self.dialogWCAGOk = function() {
					var flag = false;

					// select the active tool
					if (_self.activeTool() === 'draw') {
						_self.graphic.drawLineWCAG(_self.WCAGcoords(), _self.selectedColor());
						flag = true;
					} else if (_self.activeTool() === 'text') {
						_self.graphic.drawTextWCAG([_self.xValue() * -1, _self.yValue()], _self.drawTextValue(), _self.selectedColor());
						// set the holder empty
						_self.drawTextValue('');
						flag = true;
					} else if (_self.activeTool() === 'length') {
						_self.graphic.measureWCAG(_self.WCAGcoords(), globalKey, 0, 'km', _self.selectedColor());
						flag = true;
					} else if (_self.activeTool() === 'area') {
						_self.graphic.measureWCAG(_self.WCAGcoords(), globalKey, 1, 'km', _self.selectedColor());
						flag = true;
					}

					// if operation occurs, close the window
					if (flag) {
						_self.isDialogWCAG(false);
						_self.wcagok = true;
					}
				};

				_self.dialogWCAGCancel = function() {
					_self.isDialogWCAG(false);
				};

				_self.dialogWCAGClose = function() {
					var active = _self.activeTool();

					_self.isDialogWCAG(false);

					// if not text, or text and not ok press, open tools
					if (active !== 'text' || (!_self.wcagok && active === 'text')) {
						_self.endDraw();
					}

					_self.wcagok = false;
					_self.WCAGcoords([]);
				};

				_self.enableOkWCAG = function(state) {
					$viz('#diagDrawWCAG' + mapid).parent().find('#btnOk').button(state);
				};

				_self.addCoords = function() {
					var x = _self.xValue() * -1,
						y = _self.yValue(),
						last = _self.WCAGcoords()[_self.WCAGcoords().length - 1];

					// add the point only of the value is different
					if (typeof last === 'undefined') {
						_self.WCAGcoords.push([x, y]);
					} else if (x !== last[0] || y !== last[1]) {
						_self.WCAGcoords.push([x, y]);
					}

					// if not area and more then 1 points enable ok button. if it is area,
					// wait until there is at least 3 points.
					if (_self.activeTool() !== 'area' && _self.WCAGcoords().length > 1) {
						_self.enableOkWCAG('enable');
					} else if (_self.WCAGcoords().length > 2) {
						_self.enableOkWCAG('enable');
					}
				};

				_self.init();
			};

			vm = new toolbardrawViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
