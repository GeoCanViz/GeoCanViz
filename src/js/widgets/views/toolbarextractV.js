/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * data download and extraction widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbextract'
	], function($viz, tbextractVM) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarextract,
				mapid = $mapElem.mapframe.id,
				node = '';
            
			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbextract-content');

			// add data extraction section
			if (config.enable) {

				// set template for recursive item loading
				node += '<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.itemsArray }"></ul></div>';
				node += '<script id="userTmpl" type="text/html">';
					node += '<li><div>';
						node += '<span class="gcviz-label" data-bind="text: label"></span>';
						node +=	'<div class="gcviz-ext-url" data-bind="foreach: query">';
							node += '<div data-bind="if: control === \'link\'"><a target="_blank" data-bind="attr: { href: hrefData }, text: label, css: { \'gcviz-ext-urldis\': !$parent.isReady() }"></a></div>';
							node += '<div class="row" data-bind="if: control === \'button\'">';
								node += '<div class="span1"><button class="gcviz-ext-nts" tabindex="0" data-bind="buttonBlur, click: function() { $root.clickNTS(hrefData()) }, attr: { alt: label, id: \'selnts\' + $parentContext.$index() + $index() }, enable: $parent.isReady()"></button></div>';
								node += '<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" data-bind="text: label, attr: { for: \'selnts\' + $parentContext.$index() + $index() }, css: { \'gcviz-ext-urldis\': !$parent.isReady() }"></label></div>';
							node += '</div>';
						node += '</div>';
					node += '</div></li>';
				node += '</script>';
			}

			// WCAG dialog window
			node += '<div data-bind="wcag: { }, uiDialog: { title: WCAGTitle, width: 490, height: 210, ok: dialogWCAGOk, cancel: dialogWCAGCancel, close: dialogWCAGClose, openDialog: \'isDialogWCAG\' }">' +
						'<div>' +
							'<label for="gcviz-xvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGx"></label>' +
							'<input id="gcviz-xvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: xValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgx"></span>' +
						'</div>' +
						'<div>' +
							'<label for="gcviz-yvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGy"></label>' +
							'<input id="gcviz-yvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: yValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgy"></span>' +
						'</div>' +
					'</div>';

			$toolbar.append(node);
			return (tbextractVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
