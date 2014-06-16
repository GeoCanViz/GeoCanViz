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
			// Find the header element to insert things in
			$header = $mapElem.find('.gcviz-head');

			// set title
			if (typeof title !== 'undefined') {
				node += '<label class="gcviz-head-title unselectable">' + title + '</label>';
			}

			// add buttons
			node += '<div class="gcviz-head-btn">';
			
			// set help button (help is always visible)
			node += '<button class="gcviz-head-help" tabindex="0" data-bind="click: helpClick, tooltip: { content: tpHelp }"></button>';

			// set about button
			if (config.about.enable) {
				node += '<button class="gcviz-head-about" tabindex="0" data-bind="click: aboutClick, tooltip: { content: tpAbout }"></button>';
			}

			//TODO: add this functionnality
			// add link if link map is enable
			//if (config.link) {
				//node += '<button class="gcviz-head-link" tabindex="0" data-bind="click: linkClick, tooltip: { content: tpLink }"></button>';
			//}

			// add inset button if inset are present
			if (config.inset) {
				node += '<button class="gcviz-head-inset" tabindex="0" data-bind="click: insetClick, tooltip: { content: tpInset }"></button>';
			}

			// add print button
			if (config.print.enable) {
				node += '<button class="gcviz-head-print" tabindex="0" data-bind="click: printClick, tooltip: { content: tpPrint }"></button>';
			}

			// add fullscreen button
			if (config.fullscreen) {
				node += '<button tabindex="0" data-bind="click: fullscreenClick, tooltip: { content: tpFullScreen }, css: { \'gcviz-head-fs\': isFullscreen() === false, \'gcviz-head-reg\': isFullscreen() === true }"></button>';
			}
			node += '</div>';
			
			$header.append(node);
			if (config.tools === true) {
				// Add a collapsible container for tools to hold all the toolbars instead of having a tools icon
				$mapElem.find('.gcviz-head').append('<div id="divToolsOuter' + mapid + '" class="gcviz-tbcontainer" data-bind="attr: { style: xheightToolsOuter }"><div id="divToolsInner' + mapid + '" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsInner }"></div></div>');
				tp = new dojotitle({ id: 'tbTools' + mapid, title: '' + i18n.getDict('%header-tools') + '', content: '<div class="gcviz-tbholder" data-bind="attr: { style: widthheightTBholder }"></div>', open: true });
				$mapElem.find('.gcviz-toolsholder').append(tp.domNode);
				tp.startup();
			}
			return (headerVM.initialize($header, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
