/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar annotation view model widget
 */
/* global mapArray: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'gcviz-i18n',
		'gcviz-gisgraphic'
	], function($, ko, i18n, gisGraphic) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var toolbarannoViewModel = function($mapElem, mapid) {
				var _self = this,
					pathDraw = 'dist/images/annoDraw.png',
					pathText = 'dist/images/annoText.png',
					pathErase = 'dist/images/annoErase.png',
					pathMeasure = 'dist/images/annoMeasure.png',
					pathImport = 'dist/images/annoImport.png',
					pathExport = 'dist/images/annoExport.png',
					mymap = mapArray[mapid][0],
					mygraphic = new gisGraphic.initialize(mymap);

				// images path
				_self.imgDraw = ko.observable(pathDraw);
				_self.imgText = ko.observable(pathText);
				_self.imgErase = ko.observable(pathErase);
				_self.imgMeasure = ko.observable(pathMeasure);
				_self.imgImport = ko.observable(pathImport);
				_self.imgExport = ko.observable(pathExport);
				
				_self.errorHandler = function(error) {
					console.log('error toolbar annotation view model: ', error);
				};
		
				_self.init = function() {
					return { controlsDescendantBindings: true };
				};
				
				_self.drawClick = function() {
					mygraphic.drawLine();
				};
				
				_self.textClick = function() {
					mygraphic.drawText('ze texte');
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
