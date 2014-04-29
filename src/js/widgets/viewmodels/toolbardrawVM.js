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
			'gcviz-gisgraphic',
			'gcviz-gisgeo',
	], function($viz, ko, generateFile, i18n, gisGraphic, gisGeo) {
		var initialize,
			vm,
			loadFile;

		initialize = function($mapElem, mapid) {

			// data model				
			var toolbardrawViewModel = function($mapElem, mapid) {
				var _self = this,
					clickMeasureLength, clickMeasureArea,
					dblclickMeasure,
					pathDraw = locationPath + 'gcviz/images/drawDraw.png',
					pathText = locationPath + 'gcviz/images/drawText.png',
					pathErase = locationPath + 'gcviz/images/drawErase.png',
					pathMeasure = locationPath + 'gcviz/images/drawMeasure.png',
					pathImport = locationPath + 'gcviz/images/drawImport.png',
					pathExport = locationPath + 'gcviz/images/drawExport.png',
					lblDist = i18n.getDict('%toolbardraw-dist'),
					lblArea = i18n.getDict('%toolbardraw-area'),
					mymap = vmArray[mapid].map.map,
					$container = $viz('#' + mapid + '_holder_container'),
					mygraphic = new gisGraphic.initialize(mymap, lblDist, lblArea),
					$text = $viz('#gcviz-draw-inputbox');

				// images path
				_self.imgDraw = ko.observable(pathDraw);
				_self.imgText = ko.observable(pathText);
				_self.imgErase = ko.observable(pathErase);
				_self.imgMeasure = ko.observable(pathMeasure);
				_self.imgImport = ko.observable(pathImport);
				_self.imgExport = ko.observable(pathExport);

				// tooltip
				_self.tpDraw = i18n.getDict('%toolbardraw-tpdraw');
				_self.tpText = i18n.getDict('%toolbardraw-tptext');
				_self.tpErase = i18n.getDict('%toolbardraw-tperase');
				_self.tpImport = i18n.getDict('%toolbardraw-tpimport');
				_self.tpExport = i18n.getDict('%toolbardraw-tpexport');
				
				// keep info for annotation input box
				_self.mapid = mapid;
				_self.graphic = mygraphic;
				
				// keep color setting
				_self.selectedColor = ko.observable('black');
				
				// unique graphic id
				_self.uniqueID = ko.observable('');
				
				// enable the export button
				_self.isGraphics = ko.observable(false);
				
				// measure array
				_self.measureHolder = ko.observableArray([]);
				
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
					close: function() { $viz('#value').val(''); },
					buttons: [{
								text: 'Ok',
								click: function() {
											var value = $viz('#value').val(),
												graphic = $text.dialog('option', 'graphic');

											if (value !== '') {
												graphic.drawText(value, _self.uniqueID(), _self.selectedColor());
											} else {
												$container.removeClass('gcviz-text-cursor');
											}
											$viz(this).dialog('close');
										}
								}, {
								text: 'Cancel',
								click: function() {
											$container.removeClass('gcviz-text-cursor');
											$viz(this).dialog('close');
										}
							}]
				});

				_self.init = function() {
					// event to catch add or remove item
					setTimeout(function() {
						var myfunction = function() {
							if (mymap.graphics.graphics.length > 0) {
								_self.isGraphics(true);
							} else {
								_self.isGraphics(false);
							}
						};
						
						mymap.graphics.on('graphic-add', myfunction);
						mymap.graphics.on('graphic-remove', myfunction);
						mymap.graphics.on('graphic-clear', myfunction);
						
						// set default color
						_self.selectedColor('black');
					}, 3000);
					
					return { controlsDescendantBindings: true };
				};

				_self.drawClick = function() {
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor');
					
					_self.uniqueID(Math.random());
					_self.graphic.drawLine(_self.uniqueID(), _self.selectedColor());
				};

				_self.textClick = function() {
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor');

					$text.dialog('open');
					_self.uniqueID(Math.random());
					// set graphic and mapid to the current map
					$text.dialog('option', { graphic: _self.graphic, mapid: _self.mapid });
				};
				
				_self.selectColor = function(color) {
					_self.selectedColor(color);
				};
				
				_self.eraseClick = function() {
					mygraphic.erase();
				};

				_self.measureLengthClick = function() {
					var key = Math.random();
					clickMeasureLength = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, key, 0, 'km', _self.selectedColor(), event);
									});
					
					// on double click, close line and show total length
					dblclickMeasure = mymap.on('dbl-click', function(event) {
						var len = _self.measureHolder().length;
						
						if (len >= 2) {
							_self.graphic.addMeasureSumLength(_self.measureHolder, key, 'km');
							
						} else {
							_self.graphic.eraseUnfinish();
						}
						clickMeasureLength.remove();
						dblclickMeasure.remove();
						_self.measureHolder([]);
					});
				};
				
				_self.measureAreaClick = function(type) {
					var key = Math.random();
					clickMeasureArea = mymap.on('click', function(event) {
										_self.graphic.addMeasure(_self.measureHolder, key, 1, 'km', _self.selectedColor(), event);
									});
					
					// on double click, close polygon and show total length and area
					dblclickMeasure = mymap.on('dbl-click', function(event) {
						var len = _self.measureHolder().length;
						
						if (len >= 3) {
							_self.graphic.addMeasureSumArea(_self.measureHolder, key, 'km');
							
						} else {
							_self.graphic.eraseUnfinish();
						}
						clickMeasureArea.remove();
						dblclickMeasure.remove();
						_self.measureHolder([]);
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
						reader.onload = loadFile();
						reader.readAsText(file);
					}
				};
				
				loadFile = function() {
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
						script		: 'http://localhost:8888/php/download.php' //TODO: put ext server when php installed
					});
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
