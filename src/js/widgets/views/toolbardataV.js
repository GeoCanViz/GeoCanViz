/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * data widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbdata'
	], function($viz, tbdataVM) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardata,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdata-content');

			// set add data button
			if (config.data.enable) {
				node += '<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addClick }" tabindex="-1"></input>' +
						'<div class="row">' +
							'<div class="span1"><button id="btnAddCSV' + mapid + '" class="gcviz-data-add" tabindex="0" data-bind="buttonBlur, click: launchDialog, attr: { alt: tpAdd }"></button></div>' +
							'<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnAddCSV' + mapid + '" data-bind="text: lblCSV"></label></div>' +
						'</div>';
			}

			// set legend and template for recursive item loading
			node += '<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';
			node += '<script id="userTmpl" type="text/html">';
				node += '<li class="gcviz-data-li"><div class="gcviz-data-item">';
					node += '<input class="gcviz-data-itemchild" type="checkbox" data-bind="event: { click: $root.changeItemsVisibility }, attr: { alt: $root.tpVisible, id: \'checkbox\' + id }, checked: true"/>';
					node += '<span class="gcviz-data-itemchild" data-bind="text: label, attr: { id: \'span\' + id }"></span>';
					node += '<div class="gcviz-data-itemchild" data-bind="attr: { id: \'symbol\' + id }"></div>';
					node += '<button class="gcviz-data-itemchild gcviz-data-del" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"></button>';
				node += '</div></li>';
			node += '</script>';

			// add dialog error message
			node += '<div data-bind="uiDialog: { title: lblErrTitle, width: 300, height: 200, ok: dialogDataClose, close: dialogDataClose, openDialog: \'isErrDataOpen\' }">' +
						'<span data-bind="text: errMsg"></span>' +
					'</div>';

			$toolbar.append(node);
			return (tbdataVM.initialize($toolbar, mapid));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
