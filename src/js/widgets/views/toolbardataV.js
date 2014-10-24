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
				node = '',
				$holder = $mapElem.find('.gcviz-tbholder');

			$holder.append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbdata' + mapid, title: i18n.getDict('%toolbardata-name'), content: '<div class="gcviz-tb-scroll gcviz-tbdata-content gcviz-tbcontent"></div>', open: config.expand });
			$holder.append(tp.domNode);
			tp.startup();

			// set focus on open
			tp.on('click', function() {
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbdata-content'));
			});

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdata-content');

			// contextual help
			node += '<div class="row">' +
						'<label class="gcviz-help-bubbledesc" for="tbdata' + mapid + '" data-bind="contextHelp: { text: helpDesc, alt: helpAlt, img: imgHelpBubble, id: \'tbdata' + mapid + '\' }"></label>' +
					'</div>';

			// set add data button
			if (config.data.enable) {
				node += '<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addClick }" tabindex="-1"></input>' +
						'<button class="gcviz-data-add" tabindex="0" data-bind="buttonBlur, click: launchDialog, attr: { title: tpAdd }"></button>';
			}

			// set legend and template for recursive item loading
            node += '<div><ul class="gcviz-data-ul" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';
			node += '<script id="userTmpl" type="text/html">';
				node += '<li class="gcviz-data-li"><div class="gcviz-data-item">';
					node += '<input class="gcviz-data-itemchild" type="checkbox" data-bind="event: { click: $root.changeItemsVisibility }, attr: { title: $root.tpVisible, id: \'checkbox\' + id }, checked: true"/>';
					node += '<span class="gcviz-data-itemchild" data-bind="text: label, attr: { id: \'span\' + id }"></span>';
					node += '<div class="gcviz-data-itemchild" data-bind="attr: { id: \'symbol\' + id }"></div>';
					node += '<button class="gcviz-data-itemchild gcviz-data-del" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"></button>';
				node += '</div></li>';
			node += '</script>';

			// add dialog error message
			node += '<div data-bind="uiDialog: { title: $root.lblErrTitle, width: 300, height: 200, ok: dialogDataClose, close: $root.dialogDataClose, openDialog: \'isErrDataOpen\' }">' +
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
