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
				node = '',
				side = $mapElem.header.side === 1 ? 'left' : 'right'; //popup side from menu side

			$footer = $mapElem.find('.gcviz-foot');
			
			// datatable and popup holder
			node = '<div id="gcviz-datagridall' + mapid + '">' +
						'<div id="gcviz-datagrid' + mapid + '" class="gcviz-datagrid">' +
							'<h3 id="gcviz-datahead' + mapid + '"></h3>' +
							'<div id="gcviz-datatab' + mapid + '" class="gcviz-datagrid-hold">' +
								'<ul class="gcviz-datagrid-ul"></ul>' +
							'</div>' +
						'</div>' +

						// popup
						'<div id="gcviz-popup' + mapid + '" class="gcviz-popup" data-bind="uiDialog: { title: $root.popupDialogTitle, width: 350, height: 200, close: $root.dialogPopupClose, openDialog: \'isPopupDialogOpen\', modal: false, draggable: true, position: { within: \'#' + mapid + '_holder\', at: \'' + side + ' bottom\' } }">' +
							'<select id="popupSelect' + mapid + '" class="gcviz-popup-select" data-bind="click: $root.selectLayerOptions, attr: { title: $root.lblSelectLayer }" tabindex="0"></select>' +
							'<button class="gcviz-popup-zoom" data-bind="click: $root.clickZoom, attr: { title: $root.lblZoomSelect }" tabindex="0"></button>' +
							'<button class="gcviz-popup-previous" data-bind="click: $root.clickPrevious, enable: $root.isEnablePrevious, attr: { title: $root.previous }" tabindex="0"></button>' +
							'<button class="gcviz-popup-next" data-bind="click: $root.clickNext, enable: $root.isEnableNext, attr: { title: $root.next }" tabindex="0"></button>' +
							'<span class="gcviz-popup-counter" data-bind="text: $root.popupCounter"></span>' +
							'<hr class="gcviz-popup-separator"/>' +
							'<div id="gcviz-popup-content' + mapid + '" class="gcviz-popup-content"></div>' +
						'</div>' +
					'</div>';

			$footer.after(node);
			$datagrid = $mapElem.find('#gcviz-datagridall' + mapid);
			return(datagridVM.initialize($datagrid, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
