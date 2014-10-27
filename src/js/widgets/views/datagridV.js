/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Datagrid view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-datagrid'
	], function(datagridVM) {
		var initialize;

		initialize = function($mapElem) {
			var $datagrid,
				$footer,
				config = $mapElem.datagrid,
				mapid = $mapElem.mapframe.id,
				node = '';

			$footer = $mapElem.find('.gcviz-foot');
			
			// datatable holder
			node = '<div id="gcviz-datagrid' + mapid + '" class="gcviz-datagrid">' +
						'<h3 id="gcviz-datahead' + mapid + '"></h3>' +
						'<div id="gcviz-datatab' + mapid + '" class="gcviz-datagrid-hold">' +
							'<ul class="gcviz-datagrid-ul"></ul>' +
						'</div>' +
					'</div>';
			
			$footer.after(node);
			$datagrid = $mapElem.find('#gcviz-datagrid' + mapid);
			return(datagridVM.initialize($datagrid, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
