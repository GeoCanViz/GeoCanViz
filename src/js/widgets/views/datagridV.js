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

            // add the url for dowload page to config
            config.urldownload = $mapElem.mapframe.map.urldownload;

            // find the footer to add the node to
            $footer = $mapElem.find('.gcviz-foot');

            // datatable and popup holder
            node = '<div id="gcviz-datagridall' + mapid + '" class="gcviz-dg-all">' +
                        '<div id="gcviz-datagrid' + mapid + '" class="gcviz-datagrid">' +
                            '<h3 id="gcviz-datahead' + mapid + '"></h3>' +
                            '<div id="gcviz-datatab' + mapid + '" class="gcviz-datagrid-hold">' +
                                '<ul class="gcviz-datagrid-ul" data-bind="click: focusTables"></ul>' +
                            '</div>' +
                        '</div>' +

                        // popup
                        '<div id="gcviz-popup' + mapid + '" class="gcviz-popup" data-bind="uiDialog: { title: popupDialogTitle, width: 350, minWidth: 200, minHeigth: 200, close: dialogPopupClose, openDialog: \'isPopupDialogOpen\', ' +
                                                                                                        'modal: false, resizable: true, draggable: true, resizeStop: setPopupSize, ' +
                                                                                                        'position: { within: \'#' + mapid + '_holder\', at: \'' + side + ' bottom\' } }">' +
                            '<select id="popupSelect' + mapid + '" class="gcviz-popup-select" data-bind="options: layerName, value: selectedLayer, event: { change: changeSelectLayer }, ' +
                                                                                                            'attr: { title: lblSelectLayer }" tabindex="0"></select>' +
                            '<button class="gcviz-popup-zoom" data-bind="click: clickZoom, attr: { title: lblZoomSelect }" tabindex="0"></button>' +
                            '<button class="gcviz-popup-previous" data-bind="click: clickPrevious, enable: isEnablePrevious, attr: { title: previous }" tabindex="0"></button>' +
                            '<button class="gcviz-popup-next" data-bind="click: clickNext, enable: isEnableNext, attr: { title: next }" tabindex="0"></button>' +
                            '<span class="gcviz-popup-counter" data-bind="text: popupCounter"></span>' +
                            '<hr class="gcviz-popup-separator"/>' +
                            '<span class="gcviz-popup-title" data-bind="text: featLayerName"></span>' +
                            '<div id="gcviz-popup-content' + mapid + '" class="gcviz-popup-content" style="height: 200px"></div>' +
                        '</div>' +

                        // add modal dialog until tables are loaded
                        '<div id="diagWait' + mapid + '" data-bind="uiDialog: { title: progressTitle, width: 490, modal: true, openDialog: \'isWait\', closeOnEscape: false, ' +
                                                                                'beforeClose: closeWait, open: openWait, position: { at: \'center\', of: \'#' + mapid + '_holder\' } }">' +
                            '<div><span data-bind="text: progressDesc"></span></div>' +
                        '</div>' +

                        // WCAG dialog window
                        '<div id="gcviz-dg-wcag' + mapid + '" data-bind="wcag: { }, uiDialog: { title: WCAGTitle, width: 490, ok: dialogWCAGOk, cancel: dialogWCAGCancel, close: dialogWCAGClose, openDialog: \'isDialogWCAG\' }">' +
                            '<div>' +
                                '<label for="gcviz-xvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGx"></label>' +
                                '<input id="gcviz-xvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: xValueMin"/>' +
                                '<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgx"></span>' +
                            '</div>' +
                            '<div>' +
                                '<label for="gcviz-yvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGy"></label>' +
                                '<input id="gcviz-yvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: yValueMin"/>' +
                                '<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgy"></span>' +
                            '</div>' +
                            '<div>' +
                                '<label for="gcviz-xvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGx"></label>' +
                                '<input id="gcviz-xvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: xValueMax"/>' +
                                '<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgx"></span>' +
                            '</div>' +
                            '<div>' +
                                '<label for="gcviz-yvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGy"></label>' +
                                '<input id="gcviz-yvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: yValueMax"/>' +
                                '<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgy"></span>' +
                            '</div>' +
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
