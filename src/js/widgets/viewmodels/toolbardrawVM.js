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
			'gcviz-func',
			'gcviz-gisgraphic',
			'gcviz-vm-help',
	], function($viz, ko, generateFile, i18n, gcvizFunc, gisGraphic, helpVM) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbardrawViewModel = function($mapElem, mapid) {
				var _self = this,
					globalKey,
					clickMeasureLength, clickMeasureArea,
					dblclickMeasure,
					pathHelpBubble = locationPath + 'gcviz/images/helpBubble.png',
					lblDist = i18n.getDict('%toolbardraw-dist'),
					lblArea = i18n.getDict('%toolbardraw-area'),
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					$container = $viz('#' + mapid + '_holder_layers'),
					$btnDraw = $mapElem.find('.gcviz-draw-line'),
					$btnText = $mapElem.find('.gcviz-draw-text'),
					$btnLength = $mapElem.find('.gcviz-draw-length'),
					$btnArea = $mapElem.find('.gcviz-draw-area'),
					$btnDelsel = $mapElem.find('.gcviz-draw-delsel');

				// help and bubble
                _self.imgHelpBubble = pathHelpBubble;
                _self.helpDesc = i18n.getDict('%toolbardraw-desc');
                _self.helpAlt = i18n.getDict('%toolbardraw-alt');

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

				// dialog window for text
				_self.lblTextTitle = i18n.getDict('%toolbardraw-inputbox-name');
				_self.lblTextDesc = i18n.getDict('%toolbardraw-inputbox-label');
				_self.lblTextInfo = i18n.getDict('%toolbardraw-insinputbox');
				_self.isTextDialogOpen = ko.observable();
				_self.isText = ko.observable(false);
				_self.drawTextValue = ko.observable('');

				// keep color setting
				_self.selectedColor = ko.observable();

				// enable buttons (undo, export)
				_self.stackUndo = ko.observableArray([]);
				_self.stackRedo = ko.observableArray([]);
				_self.isGraphics = ko.observable(false);

				// graphic object
				_self.graphic = new gisGraphic.initialize(mymap, _self.isGraphics, _self.stackUndo, _self.stackRedo, lblDist, lblArea);

				// measure array and info
				_self.measureHolder = ko.observableArray([]);
				_self.measureType = '';

				// set active tool
				_self.activeTool = ko.observable('');

				// WCAG
				_self.mapid = mapid;
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.tpWCAGadd = i18n.getDict('%wcag-addcoords');
				_self.lblWCAGAddPoint = i18n.getDict('%wcag-add');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 50, max: 130 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.WCAGcoords = ko.observableArray([]);
				_self.isWCAG = ko.observable(false);
				_self.isDialogWCAG = ko.observable(false);
				_self.wcagok = false;

				_self.init = function() {

					// set event for the toolbar
					var $tb = $viz('#tbTools' + mapid + '_titleBarNode');
					$tb.on('click', _self.endDraw);

					// select black by default
					_self.selectColorClick('black');

					return { controlsDescendantBindings: true };
				};

				_self.showBubble = function(key) {
					helpVM.toggleHelpBubble(key, 'gcviz-help-tbdraw');
				};

				// end draw action on tools toolbar click
				_self.endDraw = function() {

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

					_self.graphic.deactivate();
					_self.measureType = '';

					// set the focus back to the right tool
					_self.setFocus();
				};

				// add text dialog buttons functions (ok and cancel)
				_self.dialogTextOk = function() {
					var value = _self.drawTextValue();

					if (value !== '') {
						// check if WCAG mode is enable, if so use dialog box instead)
						if (!_self.isWCAG()) {
							_self.graphic.drawText(value, _self.selectedColor());
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
					_self.isTextDialogOpen(false);
					_self.isText(false);
					_self.endDraw();
					_self.openTools('text');
				};

				_self.dialogTextClose = function() {
					// if window is close with the close X
					if (_self.isTextDialogOpen()) {
						// open menu and reset cursor
						_self.endDraw();
						_self.openTools('text');

						_self.isTextDialogOpen(false);
						_self.isText(false);
					}
				};

				_self.selectColorClick = function(color) {
					_self.selectedColor(color);
				};

				_self.drawClick = function() {
					_self.openTools('draw');

					// check if WCAG mode is enable, if so use dialog box instead)
					if (!_self.isWCAG()) {
						// set cursor to selected colour (remove default cursor first)
						$container.css('cursor', '');
						_self.addDrawCursor(_self.selectedColor());
						_self.graphic.drawLine(_self.selectedColor());
					} else {
						_self.isDialogWCAG(true);
					}
				};

				_self.textClick = function() {
					_self.openTools('text');

					// set cursor (remove default cursor first and all other cursors)
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor');

					// show dialog
					_self.isText(false);
					_self.drawTextValue('');
					_self.isTextDialogOpen(true);
				};

				_self.eraseClick = function() {
					_self.graphic.erase();
					
					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();
				};

				_self.eraseSelClick = function() {
					_self.openTools('erase');

					// set cursor (remove default cursor first and all other cursors)
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor-erase');
					_self.graphic.drawExtent();
				};

				_self.undoClick = function() {
					_self.graphic.undo();

					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();
				};

				_self.redoClick = function() {
					_self.graphic.redo();

					// workaround to remove tooltip on undo. The tooltip appears
					// even if the button is disable
					$viz('.ui-tooltip').remove();
				};

				_self.measureLengthClick = function() {
					globalKey = gcvizFunc.getUUID();
					_self.openTools('length');
					_self.measureType = 'length';

					// set cursor (remove default cursor first and all other cursors)
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor-measure');

					clickMeasureLength = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, globalKey, 0, 'km', _self.selectedColor(), event);
									});

					// on double click, close line and show total length
					dblclickMeasure = mymap.on('dbl-click', function(event) {
						// add last point then close
						_self.graphic.addMeasure(_self.measureHolder, globalKey, 0, 'km', _self.selectedColor(), event);

						// add a small time out to let the last point to go in. If not,
						// the last point is not in the sum length
						setTimeout(function() {
							_self.endMeasureLength();
						}, 250);
					});
				};

				_self.endMeasureLength = function() {
					var len = _self.measureHolder().length;

					if (len >= 2) {
						_self.graphic.addMeasureSumLength(_self.measureHolder, globalKey, 'km');
					} else if (len > 0) {
						_self.graphic.eraseUnfinish();
					}

					// reset variables
					_self.measureHolder([]);
					globalKey = gcvizFunc.getUUID();
				};

				_self.measureAreaClick = function() {
					globalKey = gcvizFunc.getUUID();
					_self.openTools('area');
					_self.measureType = 'area';

					// set cursor (remove default cursor first and all other cursors)
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor-measure');

					clickMeasureArea = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, globalKey, 1, 'km', _self.selectedColor(), event);
									});
					// on double click, close polygon and show total length and area
					dblclickMeasure = mymap.on('dbl-click', function(event) {
						// add last point then close
						_self.graphic.addMeasure(_self.measureHolder, globalKey, 1, 'km', _self.selectedColor(), event);

						_self.endMeasureArea();
					});
				};

				_self.endMeasureArea = function() {
					var len = _self.measureHolder().length;

					if (len >= 3) {
						_self.graphic.addMeasureSumArea(_self.measureHolder, globalKey, 'km');
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
					$viz(document.getElementById('fileDialogAnno'))[0].click();
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
					document.getElementById('fileDialogAnno').value = '';
				};

				_self.loadFile = function() {
					return function(e) {
						var jsonGraphics;

						try {
							jsonGraphics = JSON.parse(e.target.result);
							gisGraphic.importGraphics(mymap, jsonGraphics, _self.isGraphics);
						} catch(error) {
							console.log('Not able to load graphics' + ': ' + error);
						}
					};
				};

				_self.exportClick = function() {
					var graphics = gisGraphic.exportGraphics(mymap);

					$viz.generateFile({
						filename	: 'graphics.json',
						content		: graphics,
						script		: config.urldownload
					});
				};

				_self.openTools = function(tool) {
					gcvizFunc.getElemValueVM(mapid, ['header', 'toolsClick'], 'js')();
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
							$btnDelsel.focus();
						}
						_self.activeTool('');
					}, 500);
				};

				_self.dialogWCAGOk = function() {
					var flag = false;

					// select the active tool
					if (_self.activeTool() === 'draw' && _self.WCAGcoords().length > 1) {
						_self.graphic.drawLineWCAG(_self.WCAGcoords(), _self.selectedColor());
						flag = true;
					} else if (_self.activeTool() === 'text') {
						_self.graphic.drawTextWCAG([_self.xValue() * -1, _self.yValue()], _self.drawTextValue(), _self.selectedColor());
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
					_self.isDialogWCAG(false);

					// if not ok press, open tools
					if (!_self.wcagok) {
						// set the focus back to the right tool
						_self.openTools(_self.activeTool());
						_self.setFocus();
					}
					_self.wcagok = false;
					_self.WCAGcoords([]);
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
