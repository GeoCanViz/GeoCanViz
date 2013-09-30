/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar foot view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tbfoot'
	], function(toolbarfootVM) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarfoot,
				mapid = $mapElem.mapframe.id,
				node = '';
			
			$mapElem.find('#' + mapid).append('<div id="tbfoot' + mapid + '" class="toolbarfoot"></div>');
			$toolbar = $mapElem.find('.toolbarfoot');
			
			// set north arrow
			if (config.northarrow.enable) {
				node += '<div id="north_' + mapid + '" class="toolbarfoot-north"><img class="img-button" data-bind="attr:{src: imgNorth}"></img></div>';
			}
			
			// set mouse coordinates
			if (config.mousecoords.enable) {
				node += '<div id="mousecoord_' + mapid + '" class="toolbarfoot-coords"></div>';
			}
			
			$toolbar.append(node);
			toolbarfootVM.initialize($mapElem.find('.toolbarfoot'), mapid, config);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
