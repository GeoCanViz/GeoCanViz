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
			var holder, ext,
				mapframe = $mapElem.mapframe,
				mapid = mapframe.id,
				config = mapframe.map,
				$div = $mapElem.find('#' + mapid),
				size = mapframe.size,
				width = size.width,
				height = size.height,
				side = $mapElem.header.side;

			// set width
			$div.css({ 'width': width, 'height': height });

			// add a wrapper around the map (keep original height and witdh on the lement for resize event)
			$div.prepend('<div id="' + mapid + '_holder' + '" name="map" gcviz-size="' + height + ';' + width + '" data-bind="event: { mouseover: enterMouse, mouseout: leaveMouse }, hasfocus: mapfocus.focused, enterkey: { func: \'applyKey\', keyType: \'keyup\' }" tabindex="0"><div class="gcviz-loading"><div class="gcviz-loadingLabel"></div></div></div>');

			// add zoom full extent
			holder = $mapElem.find('#' + mapid + '_holder');
			if (config.zoombar.zoom) {
				// set the side class extension to know where to put zoom max
				ext = side ? 'l' : 'r';
				holder.prepend('<button class="gcviz-map-zoommax' + ext + '" tabindex="0" data-bind="buttonBlur, click: extentClick, tooltip: { content: tpZoomFull }"></button>');
			}
			
			// add div to hold overview map if user decide to show it on the map instead of toolbar
			$div.append('<div id="ovmapcont' + mapid +'" class="gcviz-ovmapcontainer"><div id="ovmap' + mapid +'"></div></div>');
			
			// set height and width for the map. Substract the header height
			holder.css({ 'height': height, 'width': width });

			return mapVM.initialize($mapElem, side);
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
