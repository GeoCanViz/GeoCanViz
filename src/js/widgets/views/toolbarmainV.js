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
				title = config.title,
				node = '';
			
			$mapElem.find('#' + mapid).prepend('<div id="tbmain' + mapid + '" class="toolbarmain"></div>');
			$toolbar = $mapElem.find('.toolbarmain');
			
			// set title
			if (typeof title.value !== 'undefined') {
				node += '<label class="toolbarmain-title">' + title.value + '</label>';
			}
			
			// set fullscreen button
			if (config.fullscreen) {
				node += '<button class="toolbarmain-button" tabindex="1" data-bind="click: fullscreenClick"><img class="img-button" data-bind="attr:{src: imgFullscreen}"></img></button>';
			}
			
			// set tools button
			if (config.tools) {
				node += '<button class="toolbarmain-button" tabindex="1" data-bind="click: toolsClick"><img class="img-button" data-bind="attr:{src: imgTools}"></img></button>';
				$mapElem.find('.toolbarmain').after('<div class="toolbars-holder hidden"></div>');
			}
			
			// set help button (must always be there!)
			node += '<button class="toolbarmain-button" tabindex="1" data-bind="click: helpClick"><img class="img-button" data-bind="attr:{src: imgHelp}"></img></button>';
			
			$toolbar.append(node);
			toolbarmainVM.initialize($mapElem.find('.toolbarmain'), mapid);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
