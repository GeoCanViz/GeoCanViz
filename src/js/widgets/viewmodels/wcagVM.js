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
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-vm-help',
			'gcviz-vm-map'
	], function($viz, ko, i18n, gcvizFunc, helpVM, mapVM) {
		var initialize,
			subscribeIsWCAG,
			subscribeIsOpen,
			vm = {};

		initialize = function($mapElem, mapid) {

			// data model				
			var wcagViewModel = function($mapElem, mapid) {
				var _self = this,
					pathHelpBubble = locationPath + 'gcviz/images/helpBubble.png';

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// help and bubble
				_self.imgHelpBubble = pathHelpBubble;
				_self.helpAlt = i18n.getDict('%wcag-instrtitlealt');

				// text keyboard instruction
				_self.wcagInstr = i18n.getDict('%wcag-instr');

				// wcag text
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 150 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.lblWCAGTitle = i18n.getDict('%wcag-instrtitle');

				// wcag mode
				_self.isWCAG = ko.observable(false);
				_self.WCAGLabel = i18n.getDict('%wcag-lblenable');

				// track if menu is open
				_self.isMenuOpen = ko.observable(false);

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};

				_self.openMenu = function() {
					_self.isMenuOpen(!_self.isMenuOpen());
				};

				_self.showBubble = function(key, id) {
					return helpVM.toggleHelpBubble(mapid, key, id);
				};

				_self.enableWCAG = function() {
					_self.isWCAG(!_self.isWCAG());

					return true;
				};

				_self.active = function() {
					// we need to resize the map every time we open/close the panel
					// because it change the section size
					mapVM.resizeMap(mapid);
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new wcagViewModel($mapElem, mapid);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		subscribeIsWCAG = function(mapid, funct) {
			return vm[mapid].isWCAG.subscribe(funct);
		};

		subscribeIsOpen = function(mapid, funct) {
			return vm[mapid].isMenuOpen.subscribe(funct);
		};

		return {
			initialize: initialize,
			subscribeIsWCAG: subscribeIsWCAG,
			subscribeIsOpen: subscribeIsOpen
		};
	});
}).call(this);
