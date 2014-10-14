/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * WCAG view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['knockout',
			'gcviz-i18n',
			'gcviz-func'
	], function(ko, i18n, gcvizFunc) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid) {

			// data model				
			var wcagViewModel = function($mapElem, mapid) {
				var _self = this,
					map = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// text keyboard instruction
				_self.wcagInstr = i18n.getDict('%wcag-instr');
				
				// wcag text
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 50, max: 130 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });

				// wcag mode
				_self.isWCAG = ko.observable(false);
				_self.WCAGLabel = i18n.getDict('%wcag-lblenable');

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};
				
				_self.enableWCAG = function() {
					_self.isWCAG(!_self.isWCAG());
					
					return true;
				};
				
				_self.active = function(event, ui) {
					// we need to resize the map every time we open/close the panel
					// because it change the section size
					map.resize();
				};

				_self.init();
			};

			vm = new wcagViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
