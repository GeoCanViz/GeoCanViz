/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar annotation view model widget
 */
/* global mapArray: false, locationPath: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'jqueryui',
		'gcviz-i18n',
		'gcviz-gisgraphic'
	], function($, ko, qUI, i18n, gisGraphic) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var toolbarannoViewModel = function($mapElem, mapid) {
				var _self = this,
					pathDraw = locationPath + 'gcviz/images/annoDraw.png',
					pathText = locationPath + 'gcviz/images/annoText.png',
					pathErase = locationPath + 'gcviz/images/annoErase.png',
					pathMeasure = locationPath + 'gcviz/images/annoMeasure.png',
					pathImport = locationPath + 'gcviz/images/annoImport.png',
					pathExport = locationPath + 'gcviz/images/annoExport.png',
					mymap = mapArray[mapid][0],
					mygraphic = new gisGraphic.initialize(mymap);

				// images path
				_self.imgDraw = ko.observable(pathDraw);
				_self.imgText = ko.observable(pathText);
				_self.imgErase = ko.observable(pathErase);
				_self.imgMeasure = ko.observable(pathMeasure);
				_self.imgImport = ko.observable(pathImport);
				_self.imgExport = ko.observable(pathExport);
				
				// tooltip
				_self.tpDraw = i18n.getDict('%toolbaranno-tpdraw');
				_self.tpText = i18n.getDict('%toolbaranno-tptext');
				_self.tpErase = i18n.getDict('%toolbaranno-tperase');
				
				// keep info for annotation input box
				_self.mapid = mapid;
				_self.graphic = mygraphic;
				
				// set annotation window
				$('#gcviz-anno-inputbox').dialog({
					autoOpen: false,
					modal: true,
					resizable: false,
					draggable: false,
					show: 'fade',
					hide: 'fade',
					closeOnEscape: true,
					title: 'Annotation',
					width: 400,
					close: function() { $('#value').val('');},
					buttons: [{ 
								text: 'Ok',
								click: function() {
											var value = $('#value').val(),
												$anno = $('#gcviz-anno-inputbox'),
												mapid = $anno.dialog('option', 'mapid'),
												graphic = $anno.dialog('option', 'graphic');
											
											if (value !== '') {
												$('#' + mapid + '_0_container').addClass('gcviz-text-cursor');
												graphic.drawText(value);
											}
											$(this).dialog('close');
										}
								}, { 
								text: 'Cancel',
								click: function() {
											$(this).dialog('close');
										}
							}] 
				});

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};
				
				_self.drawClick = function() {
					$('#' + mapid + '_0_container').addClass('gcviz-draw-cursor');
					_self.graphic.drawLine();
				};
				
				_self.textClick = function() {
					var $anno = $('#gcviz-anno-inputbox');
					$anno.dialog('open');
					// set graphic and mapid to the current map
					$anno.dialog('option', {graphic: _self.graphic, mapid: _self.mapid});
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
			ko.applyBindings(new toolbarannoViewModel($mapElem, mapid), $mapElem[0]); // This makes Knockout get to work
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
