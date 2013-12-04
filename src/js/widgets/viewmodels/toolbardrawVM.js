/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery',
			'knockout',
			'jqueryui',
			'gcviz-i18n',
			'gcviz-gisgraphic'
	], function($, ko, qUI, i18n, gisGraphic) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var toolbardrawViewModel = function($mapElem, mapid) {
				var _self = this,
					pathDraw = locationPath + 'gcviz/images/drawDraw.png',
					pathText = locationPath + 'gcviz/images/drawText.png',
					pathErase = locationPath + 'gcviz/images/drawErase.png',
					pathMeasure = locationPath + 'gcviz/images/drawMeasure.png',
					pathImport = locationPath + 'gcviz/images/drawImport.png',
					pathExport = locationPath + 'gcviz/images/drawExport.png',
					mymap = vmArray[mapid].map.map,
					$container = $('#' + mapid + '_holder_container'),
					mygraphic = new gisGraphic.initialize(mymap),
					$text = $('#gcviz-draw-inputbox');

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
				
				// keep info for annotation input box
				_self.mapid = mapid;
				_self.graphic = mygraphic;
				
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
					close: function() { $('#value').val('');},
					buttons: [{ 
								text: 'Ok',
								click: function() {
											var value = $('#value').val(),
												graphic = $text.dialog('option', 'graphic');
											
											if (value !== '') {
												graphic.drawText(value);
											} else {
												$container.removeClass('gcviz-text-cursor');
											}
											$(this).dialog('close');
										}
								}, { 
								text: 'Cancel',
								click: function() {
											$container.removeClass('gcviz-text-cursor');
											$(this).dialog('close');
										}
							}] 
				});

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};
				
				_self.drawClick = function() {
					$container.css('cursor', '');
					$container.addClass('gcviz-draw-cursor');
					_self.graphic.drawLine();
				};
				
				_self.textClick = function() {
					$container.css('cursor', '');
					$container.addClass('gcviz-text-cursor');
					
					$text.dialog('open');
					// set graphic and mapid to the current map
					$text.dialog('option', { graphic: _self.graphic, mapid: _self.mapid });
				};
			
				_self.eraseClick = function() {
					mygraphic.erase();
				};
				
				_self.measureClick = function() {
					
				};
				
				_self.importClick = function() {
					
				};
				
				_self.exportClick = function() {
					
				};
				
				_self.init();
			};
			ko.applyBindings(new toolbardrawViewModel($mapElem, mapid), $mapElem[0]); // This makes Knockout get to work
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
