/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * map view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-map'
	], function(mapVM) {
		var initialize;

		initialize = function($mapElem) {
			var mapid = $mapElem.mapframe.id,
				$div = $mapElem.find('#' + mapid),
				size = $mapElem.mapframe.size,
				width = size.width,
				height = size.height;

			// set width
			$div.css({ 'width': width, 'height': height });

			// add a wrapper around the map (keep original height and witdh on the lement for resize event)
			$div.prepend('<div id="' + mapid + '_holder' + '" name="map" gcviz-size="' + height + ';' + width + '" data-bind="event: { mouseover: enterMouse, mouseout: leaveMouse }, hasfocus: mapfocus.focused, enterkey: { func: \'applyKey\', keyType: \'keyup\' }" tabindex="0"><div class="gcviz-loading"><div class="gcviz-loadingLabel"></div></div></div>');

			$div.prepend('<button class="gcviz-nav-max" tabindex="0" z-index="5000"></button>');
			// set height and width for the map. Substract the header height
			$mapElem.find('#' + mapid + '_holder').css({ 'height': height, 'width': width });

			return mapVM.initialize($mapElem);
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
