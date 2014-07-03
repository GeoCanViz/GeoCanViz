/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tblegend',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function($viz, tblegendVM, dojotitle, i18n) {
		var initialize;

		initialize = function($mapElem) {
			var $legend,
				config = $mapElem.toolbarlegend,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '',
				itemsTemplate = '',
				$holder = $mapElem.find('.gcviz-tbholder');

			$holder.append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbleg' + mapid, title: i18n.getDict('%toolbarlegend-name'), content: '<div class="gcviz-tbleg-content gcviz-tbcontent-leg"></div>', open: config.expand });
			$holder.append(tp.domNode);
			tp.startup();

			// set focus on open
			tp.on('click', function() {
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbleg-content'));
			});

			// find toolbar and start to add items
			$legend = $mapElem.find('.gcviz-tbleg-content');

			//template for recursive item loading
			itemsTemplate = '<script id="itemsTmpl" type="text/html">';
					itemsTemplate += '<li class="gcviz-leg-li" data-bind="legendItemList: { expanded: expand }, attr { \'id\': id }">';
					itemsTemplate += '<div class="gcviz-legendHolderDiv gcviz-leg-imgholder" data-bind="if: displaychild.enable || customimage.enable"><div tabindex="0" data-bind="event: { keyup: function(data, event) { $root.toggleViewService(data, event) } }, click: function(data, event) { $root.toggleViewService(data, event) }, css: $root.determineCSS($parent, $data)"></div></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="if: visibility.enable && visibility.type === 1"><input class="gcviz-leg-check" type="checkbox" data-bind="event: { click: $root.changeItemsVisibility }, clickBubble: false, attr: { title: $root.tpVisible, id: \'checkbox\' + id }, checked: visibility.initstate"/></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="if: visibility.enable && visibility.type === 2"><div data-bind="LegendRadioButtons: { value: visibility.initstate, group: \'radio\' + visibility.radioid }"></div></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="HorizontalSliderDijit: { widget: $root.HorizontalSlider, extent: [opacity.min, opacity.max], value: opacity.initstate, enable: opacity.enable}, if: opacity.enable"></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="if: metadata.enable"><span class="gcviz-leg-span" data-bind=" attr: { id: \'span\' + id }"><a class="gcviz-legendLink" target="_blank" data-bind="click: $root.openMetadata($element), attr: { href: metadata.value, title: metadata.alttext, alt: metadata.alttext }, text: label.value"></a></span></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="ifnot: metadata.enable"><span class="gcviz-leg-span" data-bind="text: label.value, attr: { id: \'span\' + id }"></span></div>';
					itemsTemplate += '<div class="gcviz-legendHolderImgDiv" id="customImage" data-bind="if: customimage.enable"><img class="gcviz-legendImg" data-bind="attr: { src: customimage.url, title: customimage.alttext, alt: customimage.alttext }"></img></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="visible: displayfields"><div class="gcviz-legendSymbolDiv" data-bind="attr: { id: \'featureLayerSymbolFieldName\' + id }"/></div>';
					itemsTemplate += '<div class="gcviz-legendSymbolDiv" data-bind="visible: displaychild, event: { onload: $root.createSymbol($data, $element) }, attr: { id: \'featureLayerSymbol\' + graphid }"></div>';
					itemsTemplate += '<div class="gcviz-legendHolderDiv" id="childItems" data-bind="if: displaychild.enable"><ul class="gcviz-leg-ul" data-bind="template: { name: \'itemsTmpl\', foreach: $data.items }"></ul></div>';
				itemsTemplate += '</li>';
			itemsTemplate += '</script>';
            $legend.append(itemsTemplate);

            $legend.append(itemsTemplate);
            node += '<div class="gcviz-leg-baseb"><span class="gcviz-leg-baset" data-bind="text: baseMap"></span><ul class="gcviz-leg-ul" data-bind="template: { name: \'itemsTmpl\', foreach: $data.basesArray }"></ul></div>';
            node += '<div><ul class="gcviz-leg-ul" data-bind="template: { name: \'itemsTmpl\', foreach: $data.layersArray }"></ul></div>';
            $legend.append(node);
            return (tblegendVM.initialize($legend, mapid, config));
        };

        return {
            initialize: initialize
        };
    });
}).call(this);
