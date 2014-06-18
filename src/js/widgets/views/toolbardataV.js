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
			'gcviz-vm-tbdata',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function($viz, tbdataVM, dojotitle, i18n) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardata,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			$mapElem.find('.gcviz-tbholder').append('<div class="gcviz-tbwidth gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbdata' + mapid, title: i18n.getDict('%toolbardata-name'), content: '<div class="gcviz-tbdata-content gcviz-tbcontent"></div>', open: config.expand });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			$viz('#tbdata' + mapid).addClass('gcviz-tbwidth');

			// add tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdata-content');

			// set add data button
			if (config.add.enable) {
				node += '<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addClick }"></input>' +
						'<button class="gcviz-data-add" tabindex="0" data-bind="click: launchDialog, tooltip: { content: tpAdd }"></button>';
			}

			// set legend and template for recursive item loading
            node += '<div><ul class="gcviz-userLayersUL" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';
			node += '<script id="userTmpl" type="text/html">';
				node += '<li class="gcviz-userLayer">';
					node += '<div class="gcviz-userLegendDiv"><input type="checkbox" data-bind="event: { click: $root.changeItemsVisibility }, attr: { title: $root.tpVisible, id: \'checkbox\' + id }, checked: true"/></div>';
					node += '<div class="gcviz-userLegendDiv"><span data-bind="text: label, attr: { id: \'span\' + id }"></span></div>';
					node += '<div class="gcviz-userLegendDiv" data-bind="attr: { id: \'symbol\' + id }"></div>';
					node += '<button class="gcviz-data-del" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"></button>';
				node += '</li>';
			node += '</script>';

			// add dialog error message
			node += '<div id="data_err" data-bind="uiDialog: { title: $root.lblErrTitle, width: 300, height: 200, ok: dialogDataClose, cancel: $root.dialogDataClose, close: $root.dialogDataClose, openDialog: \'isErrDataOpen\' }">' +
						'<span data-bind="text: errMsg"></span>' +
					'</div>';

            //$toolbar.append(itemsTemplate);
            $toolbar.append(node);
            return (tbdataVM.initialize($toolbar, mapid, config));
        };

        return {
            initialize: initialize
        };
    });
}).call(this);
