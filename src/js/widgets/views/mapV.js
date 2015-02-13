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

		initialize = function($mapElem, widthMax) {
			var holder, ext, zoomClass,
				mapframe = $mapElem.mapframe,
				mapid = mapframe.id,
				config = mapframe.map,
				$div = $mapElem.find('#' + mapid),
				size = mapframe.size,
				width = size.width,
				height = size.height,
				side = $mapElem.header.side,
				zoom = config.zoombar;

			// set width and height (map + header and footer)
			$div.css({ 'width': widthMax, 'height': height + 80 });

			// set the side class extension to know where to put items
			ext = side === 1 ? 'l' : 'r';

			// add a wrapper around the map (keep original height and witdh on the element for resize event)
			$div.prepend('<div id="' + mapid + '_holder' + '" name="map" class="gcviz-mapholder" gcviz-size="' + height + ';' + width + '" data-bind="event: { click: clickMouse }, enterkey: { func: \'applyKey\', keyType: \'keydown\' }" tabindex="0"><div class="gcviz-loading gcviz-loading-' + ext + '"><div class="gcviz-loadingLabel"></div></div></div>');
			holder = $mapElem.find('#' + mapid + '_holder');

			// add zoom in with box extent
			if (zoom.zoom) {
				zoomClass = (zoom.bar) ? 'gcviz-map-zoomposl' : 'gcviz-map-zoomposh';
				holder.prepend('<button class="gcviz-map-zm gcviz-map-zoom' + ext + ' ' + zoomClass + '" tabindex="0" data-bind="buttonBlur, click: zoomClick, tooltip: { content: tpZoom }"></button>');
			}

			// add zoom full extent
			if (zoom.zoomfull) {
				holder.prepend('<button class="gcviz-map-zm gcviz-map-zoommax' + ext + '" tabindex="0" data-bind="buttonBlur, click: extentClick, tooltip: { content: tpZoomFull }"></button>');
			}

			// add div to hold overview map if user decide to show it on the map instead of toolbar
			$div.append('<div id="ovmapcont' + mapid +'" class="gcviz-ovmapcontainer' + ext + '"><div id="ovmap' + mapid +'"></div></div>');

			// set height and width for the map. Substract the header height
			holder.css({ 'width': widthMax, 'height': height });

			return mapVM.initialize($mapElem, side);
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
