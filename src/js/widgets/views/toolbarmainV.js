/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar main view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tbmain'
	], function(toolbarmainVM) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarmain,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
				node = '';
			
			$mapElem.find('#' + mapid).prepend('<div id="tbmain' + mapid + '" class="gcviz-tbmain"></div>');
			$toolbar = $mapElem.find('.gcviz-tbmain');
			
			// set title
			if (typeof title !== 'undefined') {
				node += '<div class="gcviz-tbmain-title"><label class="gcviz-tbmain-titlelabel">' + title + '</label></div>';
			}
			
			// add buttons
			node += '<div class="gcviz-tbmain-button">';
			// set help button (must always be there!)
			node += '<button id="help" class="gcviz-button" tabindex="1" data-bind="click: helpClick, tooltip: { content: tpHelp }"><img class="gcviz-img-button" data-bind="attr:{src: imgHelp}"></img></button>';

			// set tools button
			if (config.tools) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: toolsClick, tooltip: { content: tpTools }"><img class="gcviz-img-button" data-bind="attr:{src: imgTools}"></img></button>';
				$mapElem.find('.gcviz-tbmain').after('<div class="gcviz-tbholder hidden"></div>');
			}
			
			// set inset button if inset are present
			if ($mapElem.insetframe.enable) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: insetClick, tooltip: { content: tpInset }"><img class="gcviz-img-button" data-bind="attr:{src: imgShowInset}"></img></button>';
			}
			
			// set fullscreen button
			if (config.fullscreen) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: fullscreenClick, tooltip: { content: tpFullScreen }"><img class="gcviz-img-button" data-bind="attr:{src: imgFullscreen}"></img></button>';
			}
			node += '</div>';
					
			$toolbar.append(node);
			return (toolbarmainVM.initialize($toolbar, mapid));
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
