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

            $toolbar.append(node);
            return (tbdataVM.initialize($toolbar, mapid, config));
        };

        return {
            initialize: initialize
        };
    });
}).call(this);
