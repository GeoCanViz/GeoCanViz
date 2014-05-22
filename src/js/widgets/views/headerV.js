/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-header',
			'gcviz-i18n',
			'dijit/TitlePane'
	], function(headerVM, i18n, dojotitle) {
		var initialize;

		initialize = function($mapElem) {
			var $header,
				//$mapContainer,
				config = $mapElem.header,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
                //toolbarSize = 0,
                tp,
				node = '';

			$mapElem.find('#' + mapid).prepend('<div id="head' + mapid + '" class="gcviz-head"></div>');
			// Add a collapsible container for tools to hold all the toolbars instead of having a tools icon
			$mapElem.find('.gcviz-head').append('<div id="divToolsOuter' + mapid + '" class="gcviz-tbcontainer" data-bind="attr: { style: xheightToolsOuter }"><div id="divToolsInner' + mapid + '" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsInner }"></div></div>');
			tp = new dojotitle({ id: 'tbTools' + mapid, title: '' + i18n.getDict('%header-tools') + '', content: '<div class="gcviz-tbholder" data-bind="attr: { style: widthheightTBholder }"></div>', open: false });
			$mapElem.find('.gcviz-toolsholder').append(tp.domNode);
			tp.startup();

			// Find the header element to insert things in
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
