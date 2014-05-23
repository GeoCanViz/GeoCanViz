/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'genfile',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gisgraphic'
	], function($viz, ko, generateFile, i18n, gcvizFunc, gisGraphic) {
		var initialize,
			vm,
			addDrawCursor;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbardrawViewModel = function($mapElem, mapid) {
				var _self = this,
					mygraphic,
					clickMeasureLength, clickMeasureArea,
					dblclickMeasure,
					pathColor = locationPath + 'gcviz/images/drawPicColourBlack.png',
					pathColorBlack = locationPath + 'gcviz/images/drawPicColourBlack.png',
					pathColorBlue = locationPath + 'gcviz/images/drawPicColourBlue.png',
					pathColorGreen = locationPath + 'gcviz/images/drawPicColourGreen.png',
					pathColorRed = locationPath + 'gcviz/images/drawPicColourRed.png',
					pathColorYellow = locationPath + 'gcviz/images/drawPicColourYellow.png',
					pathColorWhite = locationPath + 'gcviz/images/drawPicColourWhite.png',
					pathDraw = locationPath + 'gcviz/images/drawpencilblack.png',
					pathDrawBlack = locationPath + 'gcviz/images/drawBlack.png',
					pathDrawBlue = locationPath + 'gcviz/images/drawBlue.png',
					pathDrawGreen = locationPath + 'gcviz/images/drawGreen.png',
					pathDrawRed = locationPath + 'gcviz/images/drawRed.png',
					pathDrawYellow = locationPath + 'gcviz/images/drawYellow.png',
					pathDrawWhite = locationPath + 'gcviz/images/drawWhite.png',
					pathText = locationPath + 'gcviz/images/drawText.png',
					pathErase = locationPath + 'gcviz/images/drawErase.png',
					pathEraseSel = locationPath + 'gcviz/images/drawEraseSel.png',
					pathUndo = locationPath + 'gcviz/images/drawUndo.png',
					pathRedo = locationPath + 'gcviz/images/drawRedo.png',
					pathMeasureArea = locationPath + 'gcviz/images/drawMeasureArea.png',
					pathMeasureLength = locationPath + 'gcviz/images/drawMeasureLength.png',
					pathImport = locationPath + 'gcviz/images/drawImport.png',
					pathExport = locationPath + 'gcviz/images/drawExport.png',
					lblDist = i18n.getDict('%toolbardraw-dist'),
					lblArea = i18n.getDict('%toolbardraw-area'),
					mymap = vmArray[mapid].map.map,
					$container = $viz('#' + mapid + '_holder_container'),
					$text = $viz('#gcviz-draw-inputbox');

				// images path
				_self.imgColor = ko.observable(pathColor);
				_self.imgDraw = ko.observable(pathDraw);
				_self.imgDrawWhite = ko.observable(pathDrawWhite);
				_self.imgDrawYellow = ko.observable(pathDrawYellow);
				_self.imgDrawRed = ko.observable(pathDrawRed);
				_self.imgDrawGreen = ko.observable(pathDrawGreen);
				_self.imgDrawBlue = ko.observable(pathDrawBlue);
				_self.imgDrawBlack = ko.observable(pathDrawBlack);
				_self.imgText = ko.observable(pathText);
				_self.imgErase = ko.observable(pathErase);
				_self.imgEraseSel = ko.observable(pathEraseSel);
				_self.imgUndo = ko.observable(pathUndo);
				_self.imgRedo = ko.observable(pathRedo);
				_self.imgMeasureArea = ko.observable(pathMeasureArea);
				_self.imgMeasureLength = ko.observable(pathMeasureLength);
				_self.imgImport = ko.observable(pathImport);
				_self.imgExport = ko.observable(pathExport);

				// tooltip
				_self.tpColor = i18n.getDict('%toolbardraw-tpcolor');
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

				// keep color setting
				_self.selectedColor = ko.observable();

				// unique graphic id (use this for text because the function is in the dialog box)
				_self.uniqueID = ko.observable('');

				// enable buttons (undo, export)
				_self.isColor = ko.observable(false);
				_self.stackUndo = ko.observableArray([]);
				_self.stackRedo = ko.observableArray([]);
				_self.isGraphics = ko.observable(false);

				// graphic object
				mygraphic = new gisGraphic.initialize(mymap, _self.isGraphics, _self.stackUndo, _self.stackRedo, lblDist, lblArea);

				// keep info for annotation input box
				_self.mapid = mapid;
				_self.graphic = mygraphic;
				_self.drawTextValue = ko.observable();

				// measure array
				_self.measureHolder = ko.observableArray([]);

				_self.init = function() {
					// set annotation window
					$text.dialog({
						autoOpen: false,
						modal: true,
						resizable: false,
						draggable: false,
						show: 'fade',
						hide: 'fade',
						closeOnEscape: true,
						title: i18n.getDict('%toolbardraw-inputbox-name'),
						width: 400,
						close: function() {
							$viz('#value').val('');
							$container.removeClass('gcviz-text-cursor');
						},
						buttons: [{
									text: 'Ok',
									click: function() {
												var value = $viz('#value').val(),
													graphic = $text.dialog('option', 'graphic');
	
												if (value !== '') {
													graphic.drawText(value, _self.uniqueID(), _self.selectedColor());
												} else {
													vmArray[mapid].header.toolsClick();
												}
												$viz(this).dialog('close');
											}
									}, {
									text: 'Cancel',
									click: function() {
												vmArray[mapid].header.toolsClick();
												$viz(this).dialog('close');
											}
								}]
					});

					// to solve page refresh bug on enter on input field
					// http://www.w3.org/MarkUp/html-spec/html-spec_8.html#SEC8.2
					document.getElementById('gcviz-textvalue').onkeydown = function(event) {
						event.cancelBubble = true;
					};

					return { controlsDescendantBindings: true };
				};

				_self.colorClick = function() {
					// show panel
					_self.isColor(!_self.isColor());
				};

				_self.selectColorClick = function(color) {
					_self.selectedColor(color);
					_self.isColor(false);
					// set colour picker to selected colour
					if (color === 'black') {
						_self.imgColor(pathColorBlack);
					}
					if (color === 'blue') {
						_self.imgColor(pathColorBlue);
					}
					if (color === 'green') {
						_self.imgColor(pathColorGreen);
					}
					if (color === 'red') {
						_self.imgColor(pathColorRed);
					}
					if (color === 'yellow') {
						_self.imgColor(pathColorYellow);
					}
					if (color === 'white') {
						_self.imgColor(pathColorWhite);
					}
				};

				_self.drawClick = function() {
					vmArray[mapid].header.toolsClick();
					
					// set cursor to selected colour (remove default cursor first)
					$container.css('cursor', '');
					addDrawCursor($container, _self.selectedColor());
					_self.uniqueID(gcvizFunc.getUUID());
					_self.graphic.drawLine(_self.uniqueID(), _self.selectedColor());
				};

				_self.textClick = function() {
					vmArray[mapid].header.toolsClick();
					
					// use a text cursor (remove default cursor first)
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor');
					$text.dialog('open');
					_self.uniqueID(gcvizFunc.getUUID());

					// set graphic and mapid to the current map
					$text.dialog('option', { graphic: _self.graphic, mapid: _self.mapid });
				};

				_self.eraseClick = function() {
					_self.graphic.erase();
				};

				_self.eraseSelClick = function() {
					vmArray[mapid].header.toolsClick();
					
					// set cursor (remove default cursor first)
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor'); // TODO set right cursor
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
					var key = gcvizFunc.getUUID();
					vmArray[mapid].header.toolsClick();

					// set cursor (remove default cursor first)
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor'); // TODO set right cursor

					clickMeasureLength = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, key, 0, 'km', _self.selectedColor(), event);
									});
					// on double click, close line and show total length
					dblclickMeasure = mymap.on('dbl-click', function() {
						var len = _self.measureHolder().length;
						if (len >= 2) {
							_self.graphic.addMeasureSumLength(_self.measureHolder, key, 'km');
						} else if (len > 0) {
							_self.graphic.eraseUnfinish();
						}
						clickMeasureLength.remove();
						dblclickMeasure.remove();
						_self.measureHolder([]);

						// Remove cursor class and reopen panel
						$container.removeClass('gcviz-text-cursor');
						vmArray[mapid].header.toolsClick();
					});
				};

				_self.measureAreaClick = function() {
					var key = gcvizFunc.getUUID();
					vmArray[mapid].header.toolsClick();

					// set cursor (remove default cursor first)
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor'); // TODO set right cursor

					clickMeasureArea = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, key, 1, 'km', _self.selectedColor(), event);
									});
					// on double click, close polygon and show total length and area
					dblclickMeasure = mymap.on('dbl-click', function() {
						var len = _self.measureHolder().length;
						if (len >= 3) {
							_self.graphic.addMeasureSumArea(_self.measureHolder, key, 'km');
						} else if (len > 0) {
							_self.graphic.eraseUnfinish();
						}
						clickMeasureArea.remove();
						dblclickMeasure.remove();
						_self.measureHolder([]);

						// Remove cursor class and reopen panel
						$container.removeClass('gcviz-text-cursor');
						vmArray[mapid].header.toolsClick();
					});
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
				};

				_self.loadFile = function() {
					return function(e) {
						var jsonGraphics;

						try {
							jsonGraphics = JSON.parse(e.target.result);
							gisGraphic.importGraphics(mymap, jsonGraphics);
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

				_self.init();
			};

			addDrawCursor = function(container, colour) {
				// Add cursor class
				if (colour === 'black') {
					container.addClass('gcviz-draw-cursor-black');
				}
				if (colour === 'blue') {
					container.addClass('gcviz-draw-cursor-blue');
				}
				if (colour === 'green') {
					container.addClass('gcviz-draw-cursor-green');
				}
				if (colour === 'red') {
					container.addClass('gcviz-draw-cursor-red');
				}
				if (colour === 'yellow') {
					container.addClass('gcviz-draw-cursor-yellow');
				}
				if (colour === 'white') {
					container.addClass('gcviz-draw-cursor-white');
				}
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
