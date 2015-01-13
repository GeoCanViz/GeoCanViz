/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * data download and extraction widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbextract'
	], function($viz, tbextractVM) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarextract,
				mapid = $mapElem.mapframe.id,
				node = '';
            
			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbextract-content');

			// add data extraction section
			if (config.enable) {

				// set template for recursive item loading
				node += '<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.itemsArray }"></ul></div>';
				node += '<script id="userTmpl" type="text/html">';
					node += '<li><div>';
						node += '<label class="gcviz-label" for="urlData' + mapid + '" data-bind="text: label"></label>';
						node +=	'<a id="urlData' + mapid + '" class="" data-bind="attr: { href: hrefData }, text: $root.btnLabel, css: { \'gcviz-extract-urldis\': !isReady() }"></a>';
					node += '</div></li>';
				node += '</script>';
			}

			$toolbar.append(node);
			return (tbextractVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
