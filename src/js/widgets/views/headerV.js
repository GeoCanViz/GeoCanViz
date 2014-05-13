/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-header'
	], function(headerVM) {
		var initialize;

		initialize = function($mapElem) {
			var $header,
				config = $mapElem.header,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
                toolbarSize = 0,
				node = '';

			$mapElem.find('#' + mapid).prepend('<div id="head' + mapid + '" class="gcviz-head"></div>');
			$header = $mapElem.find('.gcviz-head');

			// Left side of header
			node += '<div class="gcviz-head-left">';
			// set title
			if (typeof title !== 'undefined') {
				node += '<label class="gcviz-head-titlelabel">' + title + '</label>';
			}
			node += '</div>';

			// Right side of header
			node += '<div class="gcviz-head-right">';
				// Add buttons using sprite
				node += '<ul id="headbuttons">';
					node += '  <li id="help" data-bind="click: helpClick, tooltip: { content: tpHelp }, attr: { style: xpositionHelp }"></li>';
					if (config.about.enable) {
						node += '  <li id="about" data-bind="click: aboutClick, tooltip: { content: tpAbout }, attr: { style: xpositionAbout }"></li>';
					}
					// add inset button if inset are present
					if (config.inset) {
						node += '  <li id="inset" data-bind="click: insetClick, tooltip: { content: tpInset }, attr: { style: xpositionInset }"></li>';
					}
					if (config.link) {
						node += '  <li id="link" data-bind="click: insetClick, tooltip: { content: tpInset }, attr: { style: xpositionLink }"></li>';
					}
					// add tools button
					if (config.tools) {
						node += '  <li id="tools" data-bind="click: toolsClick, tooltip: { content: tpTools }, attr: { style: xpositionTools }"></li>';
						toolbarSize = parseInt($mapElem.mapframe.size.height, 10) - 105;
						$mapElem.find('.gcviz-head').after('<div class="gcviz-tbcontainer gcviz-hidden" style="max-height:' + toolbarSize.toString() + 'px!important;"><div class="gcviz-tbholder" style="max-height:' + toolbarSize.toString() + 'px!important;"></div></div>');
					}
					// add print button
					if (config.print.enable) {
						node += '  <li id="print" data-bind="click: printClick, tooltip: { content: tpPrint }, attr: { style: xpositionPrint }"></li>';
					}
					// add fullscreen button
					if (config.fullscreen) {
						node += '  <li id="full" data-bind="click: fullscreenClick, tooltip: { content: tpFullScreen }, attr: { style: xpositionFull }"></li>';
					}
				node += '</ul>';
			node += '</div>';

			$header.append(node);
			return (headerVM.initialize($header, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
