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
				$div = $mapElem.find('#' + mapid),
				size = $mapElem.mapframe.size,
				width = size.width,
				height = size.height;
			
			// set width
			$div.css({'width': width, 'height': height});
			
			// add a wrapper around the map
			$div.prepend('<div id="' + mapid + '_holder' + '" name="map" data-bind="hasfocus: mapfocus.focused, enterkey: {}" tabindex="0"></div>');
				
			// set height and width for the map. Substract the header height
			$mapElem.find('#' + mapid + '_holder').css({'height': (height - 80), 'width': width});
			
			return mapVM.initialize($mapElem);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);