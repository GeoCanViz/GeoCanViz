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
				datafile = config.datafile,
				dataurl = config.dataurl,
				node = '';

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdata-content');

			// set add data from file button
			if (datafile.enable) {
				// CSV file
				node += '<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addFileClick }" tabindex="-1"></input>' +
						'<div class="row">' +
							'<div class="span1"><button id="btnAddCSV' + mapid + '" class="gcviz-data-add" tabindex="0" data-bind="buttonBlur, click: launchDialog, attr: { alt: tpAdd }"></button></div>' +
							'<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnAddCSV' + mapid + '" data-bind="text: lblCSV"></label></div>' +
						'</div>';
			}

			// set add data from file button
			if (dataurl.enable) {
				// File from URL
				node += '<div class="row">' +
							'<div class="span1"><button id="btnAddUrl' + mapid + '" class="gcviz-data-add" tabindex="0" data-bind="buttonBlur, click: addURLClick, attr: { alt: tpAdd }"></button></div>' +
							'<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnAddUrl' + mapid + '" data-bind="text: lblUrl"></label></div>' +
						'</div>' +
						'<div data-bind="uiDialog: { title: lblUrlTitle, width: 450, height: 220, ok: dialogUrlOk, cancel: dialogUrlCancel, close: dialogUrlClose, openDialog: \'isUrlDialogOpen\' }">' +
							'<div>' +
								'<form><fieldset>' +
									'<span data-bind="text: lblAddUrl"></span>' +
									'<input class="gcviz-data-textinput text ui-widget-content ui-corner-all" data-bind="value: addUrlValue, valueUpdate: \'afterkeydown\', returnKey: dialogUrlOkEnter, attr: { alt: lblUrlTitle }"/>' +
								'</fieldset></form>' +
							'</div>' +
						'</div>';
			}

			// set legend and template for recursive item loading
			node += '<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';
			node += '<script id="userTmpl" type="text/html">';
				node += '<li class="gcviz-data-li"><div class="gcviz-data-item">';
					node += '<span class="gcviz-data-itemchild" data-bind="text: label, attr: { id: \'span\' + id }"></span>';
					node += '<button class="gcviz-data-itemchild gcviz-data-del" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"></button>';
				node += '</div></li>';
			node += '</script>';

			// add dialog error message
			node += '<div data-bind="uiDialog: { title: lblErrTitle, width: 500, height: 200, ok: dialogDataClose, close: dialogDataClose, openDialog: \'isErrDataOpen\' }">' +
						'<span data-bind="text: errMsg"></span>' +
					'</div>';

			// add dialog error message
			node += '<div data-bind="uiDialog: { title: lblAddTitle, width: 500, height: 200, openDialog: \'isDataProcess\' }">' +
						'<span data-bind="text: lblAddDesc"></span>' +
					'</div>';

			$toolbar.append(node);
			return (tbdataVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
