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
				mapid = $mapElem.mapframe.id,
				node = '';

			$footer = $mapElem.find('.gcviz-foot');
			
			node = '<div style="width: 1000px;"><table class="table gcviz-datagrid display" cellspacing="0" width="100%"">' +
						'<caption>Test table</caption>' +
						'<thead><tr>' +
							'<th>SAMPLENO</th>' +
							'<th>AGE</th>' +
							'<th>ERR_PLUS</th>' +
							'<th>ERR_MINUS</th>' +
							//'<th>AGE_METHOD</th>' +
							//'<th>AGE_INTERP</th>' +
							// '<th>AGE_NOTE</th>' +
							// '<th>PROV</th>' +
							// '<th>LATITUDE</th>' +
							// '<th>LONGITUDE</th>' +
							// '<th>LOCATION</th>' +
							// '<th>ROCKTYPE</th>' +
							// '<th>ROCKDESC</th>' +
							// '<th>AUTHORS</th>' +
							// '<th>YEAR_</th>' +
							// '<th>TITLE</th>' +
							// '<th>AGE_MATERIAL</th>' +
							// '<th>AGE_TECHNIQUE</th>' +
							// '<th>AGE_QUALIFIER</th>' +
							// '<th>GEOLOGICAL_PROVINCE</th>' +
							// '<th>GEOLOGICAL_INFO</th>' +
							// '<th>REFERENCE_INFO</th>' +
							// '<th>COMPILATION_NAME</th>' +
							// '<th>OBJECTID</th>' +
						'</tr></thead>' +
						'<tbody></tbody>' +
					'</table></div>';
			
			$footer.after(node);
			$datagrid = $mapElem.find('.gcviz-datagrid');
			return(datagridVM.initialize($datagrid, mapid));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
