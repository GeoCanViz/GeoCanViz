/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view widget
 */
(function() {
    'use strict';
    define(['gcviz-vm-tblegend',
            'dijit/TitlePane',
            'gcviz-i18n'
    ], function(tblegendVM, dojotitle, i18n) {
        var initialize;
        
        initialize = function($mapElem) {
            var $legend,
                config = $mapElem.toolbarlegend,
                mapid = $mapElem.mapframe.id,
                tp,
                node = '',
                itemsTemplate = '';

            tp = new dojotitle({ id: 'tbleg' + mapid, title: i18n.getDict('%toolbarlegend-name'), content: '<div class="gcviz-tbleg-content gcviz-tbcontent-nobkg"></div>', open: config.expand });
            $mapElem.find('.gcviz-tbholder').append(tp.domNode);
            tp.startup();
            
            // add tabinndex
            tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');
            
            // find toolbar and start to add items
            $legend = $mapElem.find('.gcviz-tbleg-content');

            //template for recursive item loading
            itemsTemplate = '<script id="itemsTmpl" type="text/html">';
                itemsTemplate += ' <ul class="gcviz-legendULLayer" id="layerList"  data-bind="foreach: $data">';
                    itemsTemplate += '<li  class="gcviz-legendLiLayer" data-bind="LegendItemList: { expanded: expand }, click: $root.toggleViewService">';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="if: visibility.enable && visibility.type ===1"><input class="gcviz-legendCheck" type="checkbox" data-bind="click: $root.changeItemsVisibility, attr: { title: $root.tpVisible, checked: visibility.initstate, id: \'checkbox\' + id }"/></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="LegendRadioButtons: { value: visibility.initstate, group: \'radio\' + visibility.radioid }, if: visibility.enable && visibility.type === 2"></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="HorizontalSliderDijit: { widget: $root.HorizontalSlider, extent: opacity.minmax, value: opacity.initstate }, if: opacity.enable"></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="if: metadata.enable"><span data-bind=" attr: { id: \'span\' + id }"><a class="gcviz-legendLink" target="_blank" data-bind="attr: { href: metadata.value, title: metadata.alttext, alt: metadata.alttext }, text: label.value"></a></span></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" data-bind="ifnot: metadata.enable"><span data-bind="text: label.value, attr: { id: \'span\' + id }"></span></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderImgDiv" id="customImage" data-bind="if: customimage.enable"><img class="gcviz-legendImg" data-bind="attr: { src: customimage.url, title: customimage.alttext, alt: customimage.alttext }"></img></div>';
                            itemsTemplate += '<div class="gcviz-legendHolderDiv" id="childItems" data-bind="template: { name: \'itemsTmpl\', data: items }"></div>';
                            itemsTemplate += '<div class="gcviz-legendSymbolDiv" data-bind="visible: displaychild, attr: { id: \'featureLayerSymbol\' + id }"></div>';
                        itemsTemplate += '</li>';
                    itemsTemplate += '</ul>';
            itemsTemplate += '</script>';
            
            $legend.append(itemsTemplate);
            node += '<div data-bind="template: { name: \'itemsTmpl\', data: theArray }"></div><br><br><p>';
            $legend.append(node);
            return (tblegendVM.initialize($legend, mapid, config));
        };
       
        return {
            initialize: initialize
        };
    });
}).call(this);