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
				configDatagrid = $mapElem.datagrid,
				configScalebar = config.scalebar.enable,
				node = '';

			$mapElem.find('#' + mapid).append('<div id="foot' + mapid + '" class="gcviz-foot"></div>');
			$footer = $mapElem.find('.gcviz-foot');

			// create row to hold all componants
			node = '<div class="row">';

            // logo and link to GitHub
            node += '<div class="span5">';

            if (config.logo) {
				node += '<div><a target="_blank" data-bind="attr: { href: urlLogo }" tabindex="-1">' +
							'<img class="gcviz-foot-logo" data-bind="event: { keyup: goGitHub }, attr: { src: imgLogoPNG }, tooltip: { content: urlLogoAlt }" tabindex="0"></img>' +
						'</a></div>';
            }

			// add button to open datagrid
			if (configDatagrid.enable) {
				node += '<button class="gcviz-foot-data" tabindex="0" data-bind="buttonBlur, click: datagridClick, tooltip: { content: tpDatagrid }, enable: isTableReady"></button>';
			}

			node += '</div>';

			// set scalebar
			node += '<div class="span2">';
			if (configScalebar) {
				node += '<div id="divScalebar' + mapid + '" class="unselectable"></div>';
			}
			node += '</div>';

			// set mouse coordinates
			node += '<div class="span4">';
			if (config.mousecoords.enable) {
				node += '<span id="mousecoord_' + mapid + '" class="gcviz-foot-coords-values unselectable" data-bind="text: coords"></span>';
			}
			node += '</div>';

			// set north arrow
			node += '<div class="span1">';
			if (config.northarrow.enable) {
				node += '<div id="arrow_' + mapid + '" class="gcviz-foot-arrow unselectable" data-bind="style: { \'webkitTransform\': rotateArrow(), ' +
																												'\'MozTransform\': rotateArrow(), ' +
																												'\'msTransform\': rotateArrow(), ' +
																												'\'OTransform\': rotateArrow(), ' +
																												'\'transform\': rotateArrow() }"></div>';
			}
			node += '</div>';

			// close row
			node += '</div>';

			$footer.append(node);
			return(footerVM.initialize($footer, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
