/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * time slider widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbslider'
	], function($viz, tbsliderVM) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarslider,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbslider-content');

            node += "<div id='gcvizTimeSlider'></div>"
			$toolbar.append(node);
			return (tbsliderVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
