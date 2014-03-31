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

			// set title
			if (typeof title !== 'undefined') {
				node += '<div class="gcviz-head-title"><label class="gcviz-head-titlelabel">' + title + '</label></div>';
			}

			// add buttons
			node += '<div class="gcviz-head-button">';
			// add help button (must always be there!)
			node += '<button class="gcviz-button" tabindex="0" data-bind="click: helpClick, tooltip: { content: tpHelp }"><img class="gcviz-img-button" data-bind="attr: { src: imgHelp }"></img></button>';

            // add about button
            if (config.about.enable) {
                node += '<button class="gcviz-button" tabindex="0" data-bind="click: aboutClick, tooltip: { content: tpAbout }"><img class="gcviz-img-button" data-bind="attr:{src: imgAbout}"></img></button>';
            }

			// add tools button
			if (config.tools) {
                node += '<button id="btnTools' + mapid + '" class="gcviz-button gcviz-tools-button" tabindex="0" data-bind="click: toolsClick, tooltip: { content: tpTools }"><img class="gcviz-img-button" data-bind="attr:{src: imgTools}"></img></button>';
                toolbarSize = parseInt($mapElem.mapframe.size.height, 10) - 105;
                $mapElem.find('.gcviz-head').after('<div class="gcviz-tbcontainer gcviz-hidden" style="max-height:' + toolbarSize.toString() + 'px!important;"><div class="gcviz-tbholder"></div></div>');
			}

			// add inset button if inset are present
			if ($mapElem.insetframe.enable) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: insetClick, tooltip: { content: tpInset }"><img class="gcviz-img-button" data-bind="attr: { src: imgShowInset }"></img></button>';
			}

			// add fullscreen button
			if (config.fullscreen) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: fullscreenClick, tooltip: { content: tpFullScreen }"><img class="gcviz-img-button" data-bind="attr: { src: imgFullscreen }"></img></button>';
			}
			node += '</div>';

			$header.append(node);
			return (headerVM.initialize($header, mapid));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
