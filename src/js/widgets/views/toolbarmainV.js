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
				node += '<label class="gcviz-tbmain-title">' + title + '</label>';
			}
			
			// set fullscreen button
			if (config.fullscreen) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: fullscreenClick"><img class="gcviz-img-button" data-bind="attr:{src: imgFullscreen}"></img></button>';
			}
			
			// set inset button if inset are present
			if ($mapElem.insetframe.enable) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: insetClick"><img class="gcviz-img-button" data-bind="attr:{src: imgShowInset}"></img></button>';
			}
			
			// set tools button
			if (config.tools) {
				node += '<button class="gcviz-button" tabindex="1" data-bind="click: toolsClick"><img class="gcviz-img-button" data-bind="attr:{src: imgTools}"></img></button>';
				$mapElem.find('.gcviz-tbmain').after('<div class="gcviz-tbholder hidden"></div>');
			}
			
			// set help button (must always be there!)
			node += '<button class="gcviz-button" tabindex="1" data-bind="click: helpClick"><img class="gcviz-img-button" data-bind="attr:{src: imgHelp}"></img></button>';
			
			$toolbar.append(node);
			toolbarmainVM.initialize($toolbar, mapid);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
