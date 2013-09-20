/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * map view widget
 */
(function() {
	'use strict';
	define(['jquery',
			'gcviz-vm-map'
	], function($, mapVM) {
		var initialize;
		
		initialize = function($mapElem) {
			var mapid = $mapElem.mapframe.id,
				len = $mapElem.mapframe.map.length,
				$div = $mapElem.find('#' + mapid),
				size = $mapElem.mapframe.size,
				width = size.width;
			
			while (len--) {
				$div.prepend('<div id="' + mapid + '_' + len + '"></div>');
				
				// set height and width for the map. Substract the toolbar main height
				$mapElem.find('#' + mapid + '_' + len).css({'height': (size.height - 80), 'width': width});
			}
			
			return mapVM.initialize($mapElem);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);