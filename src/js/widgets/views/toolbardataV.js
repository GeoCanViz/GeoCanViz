/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * data widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tbdata',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function(tbdataVM, dojotitle, i18n) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardata,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			$mapElem.find('.gcviz-tbholder').append('<div style="background-color:rgba(100,100,100,0.6)!important; height:3px;"></div>');
			tp = new dojotitle({ id: 'tbdata' + mapid, title: i18n.getDict('%toolbardata-name'), content: '<div class="gcviz-tbdata-content gcviz-tbcontent-nobkg"></div>', open: config.expand });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();

			// add tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdata-content');

			// set add data button
			if (config.add.enable) {
				node += '<input id="fileDialogData" type="file" accept=".csv" data-bind="event: { change: addClick }"></input>' +
						'<button class="gcviz-button" tabindex="0" data-bind="click: launchDialog, tooltip: { content: tpAdd }"><img class="gcviz-img-button" data-bind="attr: { src: imgAdd }"></img></button>';
			}

			// set legend and template for recursive item loading
            node += '<div><ul class="gcviz-userLayersUL" data-bind="template: { name: \'userTmpl\', foreach: $root.userArray }"></ul></div>';
			node += '<script id="userTmpl" type="text/html">';
				node += '<li class="gcviz-userLayer">';
					node += '<div class="gcviz-userLegendDiv"><input class="gcviz-legendCheck" type="checkbox" data-bind="click: $root.changeItemsVisibility($data), clickBubble: false, attr: { title: $root.tpVisible, id: \'checkbox\' + id }, checked: true"/></div>';
					node += '<div class="gcviz-userLegendDiv"><span data-bind="text: label, attr: { id: \'span\' + id }"></span></div>';
					node += '<div class="gcviz-userLegendDiv" data-bind="attr: { id: \'symbol\' + id }"></div>';
					node += '<button class="gcviz-button" tabindex="0" data-bind="click: function($data) { $root.removeClick($data) }, tooltip: { content: $root.tpDelete }"><img class="gcviz-img-button" data-bind="attr: { src: $root.imgDel }"></img></button>';
				node += '</li>';
			node += '</script>';

            //$toolbar.append(itemsTemplate);
            $toolbar.append(node);
            return (tbdataVM.initialize($toolbar, mapid, config));
        };

        return {
            initialize: initialize
        };
    });
}).call(this);
