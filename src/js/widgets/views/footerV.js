/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Footer view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-footer'
	], function(footerVM) {
		var initialize;

		initialize = function($mapElem) {
			var $footer,
				config = $mapElem.footer,
				mapid = $mapElem.mapframe.id,
				node = '';

			$mapElem.find('#' + mapid).append('<div id="foot' + mapid + '" class="gcviz-foot"></div>');
			$footer = $mapElem.find('.gcviz-foot');

            // Add DIV with logo and link to GitHub
            node += '<div><a data-bind="attr: { href: urlLogo }, tooltip: { content: urlLogoAlt }">';
				node += '<img class="gcviz-foot-logo" data-bind="attr: { src: imgLogoPNG }"></img>';
            node += '</a></div>';


			// set north arrow
			if (config.northarrow.enable) {
				node += '<div id="north_' + mapid + '" class="gcviz-foot-north"><img id="imgarrow_' + mapid + '" class="gcviz-foot-imgarrow" data-bind="attr: { src: imgNorth }"></img></div>';
			}

			// set mouse coordinates
			if (config.mousecoords.enable) {
				node += '<div id="mousecoord_' + mapid + '" class="gcviz-foot-coords"></div>';
				//node += '<div class="gcviz-foot-coords"><span id="mousecoord_' + mapid + '" class="gcviz-foot-coords-values"></span></div>';
			}

			$footer.append(node);
			return(footerVM.initialize($footer, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
