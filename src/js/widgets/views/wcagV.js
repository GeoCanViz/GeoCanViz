/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * WCAG view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-wcag',
			'gcviz-i18n'
	], function(wcagVM, i18n) {
		var initialize;

		initialize = function($mapElem) {
			var $wcag,
				mapid = $mapElem.mapframe.id,
				node = '';

			// add the wcag container
			$mapElem.prepend('<div id="wcag' + mapid + '"></div>');
			$wcag = $mapElem.find('#wcag' + mapid);

			// create the keyboard instruction. Use i18 instead of data-bind text because it removes the inside of h3 tag
			node = '<div data-bind="uiAccordion: { heightStyle: \'content\', collapsible: true, active: false, activate: $root.active }">' +
						'<h3 class="ui-accordion-header">' + i18n.getDict('%wcag-instrtitle') + '</h3>' +
						'<div>' +
							'<p class="gcviz-wcag-instr" data-bind="text: wcagInstr"></p>' +
							'<input class="gcviz-leg-check" type="checkbox" data-bind="event: { click: enableWCAG }, clickBubble: false, attr: { title: WCAGLabel, id: \'chk-wcag\' }, checked: isWCAG"/>' +
							'<label class="gcviz-label gcviz-nav-lblovdisp" for="chk-wcag" data-bind="text: WCAGLabel"></label>' +
						'</div>' +
					'</div>';

			$wcag.append(node);
			return(wcagVM.initialize($wcag, mapid));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
