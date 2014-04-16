/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbnav',
			'gcviz-i18n',
			'dijit/TitlePane',
            'esri/dijit/OverviewMap'
	], function($viz, tbnavVM, i18n, dojotitle) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarnav,
				navheight = 0,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			// Calculate height required based on selected options
			if ( config.zoom || config.geolocation.enable ) { navheight += 60; }
			if ( config.overview.enable ) { navheight += 105; }
			if ( config.scalebar.enable ) { navheight += 30; }
			//if ( config.position.enable ) { navheight += 125; }
			if ( config.position.enable ) { navheight += 45; }

			tp = new dojotitle({ id: 'tbnav' + mapid, title:'Navigation', content: '<div class="gcviz-tbnav-content gcviz-tbcontent" style="height:' + navheight+ 'px;"></div>', open: false });
			//tp = new dojotitle({ id: 'tbnav' + mapid, class: 'gcviz-navbartitle', title:'Navigation', content: '<div class="gcviz-tbnav-content gcviz-tbcontent gcviz-h320"></div>', open: false });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();

			// add tabindex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');

			// Put everything inside a DIV
			node += '<div>';

				// if present, group the the 2 items (fullextent and geolocation) on the same line
				node += '<div class="gcviz-float-left gcviz-w247">';
				// Item 1 of group - set full extent button
				if (config.zoom) {
					node += '<button id="btnFullExtent' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: extentClick, tooltip: { content: tpZoomFull }"><img class="gcviz-img-button" data-bind="attr:{src: imgExtent}"></img></button>';
				}

				// Item 2 of group - use geolocation
				if (config.geolocation.enable) {
					node += '<span id="divAutoCompleteInstructions' + mapid + '" class="ui-helper-hidden-accessible gcviz-inline">' + i18n.getDict('%toolbarnav-inskeyboard') + '</span>';
					node += '<label class="gcviz-geoloclabel gcviz-inline" for="inGeoLocation">' + i18n.getDict('%toolbarnav-geoloclabel') + '</label>';
					node += '<input id="inGeoLocation' + mapid + '" class="gcviz-greyTextGeoLoc gcviz-inline gcviz-w145" value="' + i18n.getDict('%toolbarnav-geolocsample') + '" title="' + i18n.getDict('%toolbarnav-geolocsample') + '"/>';
				}
				node += '</div>';

                // See if overview map desired
                if (config.overview.enable) {
                    node += '<div class="gcviz-float-left gcviz-w250 gcviz-border gcviz-margin-left5 toolbar-background-opaque" style="width: 250px; height: 100px; opacity:1.0!important;">';
                        node += '<div id="divOverviewMapContainer' + mapid + '" class="gcviz-overviewMap" data-bind="tooltip: { content: tpOverview }" style="width: 247px; height: 100px;" tabindex="-1">';
                            node += '<div id="divOverviewMap' + mapid + '" style="width: 247px; height: 100px;" tabindex="-1"></div>';
                        node += '</div>';
                    node += '</div>';
		//var dd = $viz('tbnav' + mapid);
		//dd.attr('data-bind', 'click: refreshOverview');
		//var ee='';
			//tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('data-bind', 'click: refreshOverview');
			//tp.domNode.setAttribute('data-bind', 'click: refreshOverview');
			//tp.domNode.setAttribute('data-bind', 'visible: false');
                }

                // See if scalebar desired
                if (config.scalebar.enable) {
                    node += '<div class="gcviz-float-left gcviz-scaleBar gcviz-w247" style="width: 247px; height: 30px;">';
                        node += '<div id="divScalebar' + mapid + '" style="width: 200px; height: 25px;" tabindex="-1"></div>';
                    node += '</div>';
                }

                // See if position information or magnifier desired
                //if (config.position.enable || config.magnify.enable) {
                // if (config.position.enable) {
                    // node += '<div id="divPosition' + mapid + '" class="gcviz-float-left gcviz-w247" style="width: 247px; height: 30px;">';
                        // //if (config.position.enable || config.magnify.enable) {
                        // if (config.position.enable) {
                            // //node += '<button id="btnGetInfo' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: infoClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{src: imgPosition}"></img></button>';
                            // node += '<div class="row">';
                            // node += '   <span class="gcviz-appText" data-bind="text: infoGetLocInfo"></span>';
                            // node += '</div>';
                            // node += '<div class="row">';
                            // node += '   <div class="span2">';
                            // node += '       <button id="btnClickMap' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline gcviz-up5" tabindex="0" data-bind="click: getMapClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{src: imgPosition}"></img></button>';
                            // node += '   </div>';
                            // node += '   <div class="span2">';
                            // node += '       <span class="gcviz-appText">-or-</span>';
                            // node += '   </div>';
                            // node += '   <div class="span8">';
                            // node += '       <div class="row">';
                            // node += '           <div class="row">';
                            // node += '               <span class="span2 gcviz-appText">Lat</span>';
                            // node += '               <span class="span6"><input id="inInfoLat' + mapid + '" data-bind="text: $root.infoLat" class="gcviz-w90"></input></span>';
                            // node += '           </div>';
                            // node += '           <div class="row">';
                            // node += '               <span class="span2 gcviz-appText">Long</span>';
                            // node += '               <span class="span6"><input id="inInfoLong' + mapid + '" data-bind="text: $root.infoLong" class="gcviz-w90"></input></span>';
                            // node += '           </div>';
                            // node += '           <div class="row">';
                            // node += '               <span class="span8 gcviz-appText"></span>';
                            // node += '                   <button id="btnGetInfo' + mapid + '" data-bind="click: getInfoClick, text: $root.infoGetInfo" class="gcviz-appText ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus"></button>';
                            // node += '               </span>';
                            // node += '           </div>';
                            // node += '       </div>';
                            // node += '   </div>';
                            // node += '</div>';
                        // }
                // // TODO - Implement magnifier later
                        // // if (config.magnify.enable || config.magnify.enable) {
                            // // node += '<button id="btnMagnifier' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: magnifyClick, tooltip: { content: tpMagnify }"><img class="gcviz-img-button" data-bind="attr:{src: imgMagnify}"></img></button>';
                        // // }
                    // node += '</div>';
                // }

                // See if position information or magnifier desired
                //if (config.position.enable || config.magnify.enable) {
                if (config.position.enable) {
                    node += '<div id="divPosition' + mapid + '" class="gcviz-float-left gcviz-w247 gcviz-margin-left5" style="width: 247px; height: 30px;">';
                        //if (config.position.enable || config.magnify.enable) {
                        if (config.position.enable) {
                            //node += '<button id="btnGetInfo' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: infoClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{src: imgPosition}"></img></button>';
                            node += '<div class="row">';
                            node += '   <span class="gcviz-appText" data-bind="text: infoGetLocInfo"></span>';
                            node += '</div>';
                            node += '<div class="row">';
                            node += '   <div class="span2">';
                            node += '       <button id="btnClickMap' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline gcviz-up5" tabindex="0" data-bind="click: getMapClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{src: imgPosition}"></img></button>';
                            node += '   </div>';
                            //node += '   <div class="span2">';
                            //node += '       <span class="gcviz-appText">-or-</span>';
                            //node += '   </div>';
                            //node += '   <div class="span2">';
                            //node += '       <button id="btnClickMap2' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline gcviz-up5" tabindex="0" data-bind="click: getMapClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{src: imgPosition2}"></img></button>';
                            //node += '   </div>';
                            node += '</div>';
                        }
                // TODO - Implement magnifier later
                        // if (config.magnify.enable || config.magnify.enable) {
                            // node += '<button id="btnMagnifier' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: magnifyClick, tooltip: { content: tpMagnify }"><img class="gcviz-img-button" data-bind="attr:{src: imgMagnify}"></img></button>';
                        // }
                    node += '</div>';
                }
                // DIVs for position information
                if (config.position.enable) {
                    // Setup a dialog box to ask user to click or enter a location
                    node += '<div id="divGetLocInfo' + mapid + '" class="gcviz-hidden">';
                        node += '<div data-bind="template: { name: \'getlocinfo\' }"></div>';
                        node += '<script id="getlocinfo" type="text/html">';
                            node += '<p><span data-bind="text: $root.infoOption1"></span></p>';
                            node += '<button data-bind="click: $root.getMapClick, text: $root.infoClickMap" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus"></button>';
                            //node += '<button data-bind="click: $root.getMapClick2" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus">Click 2 - Append</button>';
                            //node += '<button data-bind="click: $root.getMapClick3" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus">Click 3 - Target icon</button>';
                            node += '<p><span data-bind="text: $root.infoOption2"></span></p>';
                            node += '<p>';
                                node += '<span data-bind="text: $root.infoLat"></span>';
                                node += '<input id="inInfoLat' + mapid + '" data-bind="text: $root.infoLat" class="gcviz-w210"></input>';
                            node += '</p>';
                            node += '<p>';
                                node += '<span data-bind="text: $root.infoLong"></span>';
                                node += '<input id="inInfoLong' + mapid + '" data-bind="text: $root.infoLong" class="gcviz-w210"></input>';
                            node += '</p>';
                            node += '<button data-bind="click: $root.getInfoClick, text: $root.infoGetInfo" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus"></button>';
                        node += '</script>';
                    node += '</div>';

                    // Setup a dialog box to show results
                    node += '<div id="divGetLocResults' + mapid + '" class="gcviz-hidden">';
                        node += '<div data-bind="template: { name: \'getshowlocinfo\' }"></div>';
                        node += '<script id="getshowlocinfo" type="text/html">';
                            node += '<div class="ui-widget-content">';
                                node += '<strong><span data-bind="text: $root.infoTopoCoord"></span></strong>';
                                node += '<p><strong data-bind="text: $root.infoDecDeg"></strong></p>';
                                node += '<p><span data-bind="text: $root.infoLat"></span><span data-bind="text: $root.infoLatDD"></span></p>';
                                node += '<p><span data-bind="text: $root.infoLong"></span><span data-bind="text: $root.infoLongDD"></span></p>';
                                node += '<p><strong data-bind="text: $root.infoDMS"></strong></p>';
                                node += '<p><span data-bind="text: $root.infoLat"></span><span data-bind="text: $root.infoLatDMS"></span></p>';
                                node += '<p><span data-bind="text: $root.infoLong"></span><span data-bind="text: $root.infoLongDMS"></span></p>';
                            node += '</div>';
                            node += '<div class="ui-widget-content">';
                                node += '<strong><span data-bind="text: $root.infoUTM"></span></strong>';
                                node += '<p><span data-bind="text: $root.infoUTMz"></span><span data-bind="text: $root.spnUTMzone"></span></p>';
                                node += '<p><span data-bind="text: $root.infoUTMeast"></span><span data-bind="text: $root.spnUTMeast"></span></p>';
                                node += '<p><span data-bind="text: $root.infoUTMnorth"></span><span data-bind="text: $root.spnUTMnorth"></span></p>';
                            node += '</div>';
                            node += '<div class="ui-widget-content">';
                                node += '<strong><span data-bind="text: $root.infoNTS"></span></strong>';
                                node += '<p></span><span data-bind="text: $root.spnNTS"></span></p>';
                            node += '</div>';
                            node += '<div class="ui-widget-content">';
                                node += '<strong><span data-bind="text: $root.infoAltitude"></span></strong>';
                                node += '<p></span><span data-bind="text: $root.spnAltitude"></span></p>';
                            node += '</div>';
                        node += '</script>';
                    node += '</div>';
                }

            // End of DIV to include everything
            node += '</div>';
            // For debugging
            //node += '<div data-bind="text: ko.toJSON($root)"></div>';
			$toolbar.append(node);
			return(tbnavVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
