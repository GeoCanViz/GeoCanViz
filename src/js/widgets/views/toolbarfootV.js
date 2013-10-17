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
			
			$mapElem.find('#' + mapid).append('<div id="tbfoot' + mapid + '" class="gcviz-tbfoot"></div>');
			$toolbar = $mapElem.find('.gcviz-tbfoot');
			
			// set north arrow
			if (config.northarrow.enable) {
				node += '<div id="north_' + mapid + '" class="gcviz-tbfoot-north"><img class="gcviz-tbfoot-imgarrow" data-bind="attr:{src: imgNorth}"></img></div>';
			}
			
			// set mouse coordinates
			if (config.mousecoords.enable) {
				node += '<div id="mousecoord_' + mapid + '" class="gcviz-tbfoot-coords"></div>';
			}
			
			$toolbar.append(node);
			toolbarfootVM.initialize($toolbar, mapid, config);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
