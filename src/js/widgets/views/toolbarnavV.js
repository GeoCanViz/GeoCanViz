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
			'dijit/TitlePane'
	], function($viz, tbnavVM, i18n, dojotitle) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarnav,
				configgeolocation = config.geolocation,
				configoverview = config.overview,
				configposition = config.position,
				configscalebar = config.scalebar,
				configscaledisplay = config.scaledisplay,
				configzoom = config.zoom,
				navheight = 0,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			// Calculate height required based on selected options
			if (configzoom || configgeolocation.enable) {
				navheight += 60;
			}
			if (configoverview.enable) {
				navheight += 105;
			}
			if (configscalebar.enable) {
				navheight += 45;
			}
			if (configscalebar.enable) {
				navheight += 20;
			}
			if (configposition.enable) {
				navheight += 25;
			}

			$mapElem.find('.gcviz-tbholder').append('<div class="gcviz-tbwidth gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbnav' + mapid, title: 'Navigation', content: '<div class="gcviz-tbnav-content gcviz-tbcontent" style="height:' + navheight + 'px;"></div>', open: config.expand });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			$viz('#tbnav' + mapid).addClass('gcviz-tbwidth');

			// add tabindex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');

			// Put everything inside a DIV
			node += '<div>';

//TODO: Try using the dynamic grid instead of the gcviz-w*** classes

				// if present, group the 2 items (fullextent and geolocation) on the same line
				node += '<div class="gcviz-w247">';
				// Item 1 of group - set full extent button
				if (config.zoom) {
					node += '<button id="btnFullExtent' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: extentClick, tooltip: { content: tpZoomFull }"><img class="gcviz-img-button" data-bind="attr:{ src: imgExtent }"></img></button>';
				}

				// Item 2 of group - use geolocation
				if (configgeolocation.enable) {
					node += '<span id="divAutoCompleteInstructions' + mapid + '" class="ui-helper-hidden-accessible gcviz-inline" data-bind="text: insKeyboard"></span>';
					node += '<label class="gcviz-geoloclabel gcviz-inline" for="inGeoLocation" data-bind="text: geoLocLabel"></label>';
					node += '<input id="inGeoLocation' + mapid + '" class="gcviz-greyTextGeoLoc gcviz-inline gcviz-w140" data-bind="value: geoLocSample, tooltip: { content: geoLocSample }" />';
				}
				node += '</div>';
				node += '<br/>';

                // See if overview map desired
                if (configoverview.enable) {
                    node += '<div class="gcviz-w240 gcviz-border gcviz-margin-left5 toolbar-background-opaque gcviz-ovtoolcontainer">';
                        node += '<div id="divOverviewMapContainer' + mapid + '" class="gcviz-overviewMap" data-bind="tooltip: { content: tpOverview }" tabindex="-1">';
                            node += '<div id="divOverviewMap' + mapid + '" class="gcviz-overviewMapContent" tabindex="-1"></div>';
                        node += '</div>';
                    node += '</div>';
                }

                // See if scalebar desired
                if (configscalebar.enable) {
                    node += '<div class="gcviz-scaleBar gcviz-scaleBarToolbar">';
                        node += '<div id="divScalebar' + mapid + '" class="gcviz-scaleBarToolbarContainer" tabindex="-1"></div>';
                        node += '<div id="divScalebarLabel' + mapid + '" class="gcviz-scaleBarToolbarContainer gcviz-scaleBarLabel" tabindex="-1">(approx.)</div>';
                    node += '</div>';
                }

                // See if scale display is desired
                if (configscaledisplay.enable) {
                    node += '<div class="gcviz-w247 gcviz-scaleDisplay">';
                        node += '<div id="divScale' + mapid + '" class="row"><span class="span6 gcviz-scaleDisplayLabel" data-bind="text: lblScale"></span><a class="span4 gcviz-scale">(approx.)</a></div>';
                    node += '</div>';
                }

                // See if position information or magnifier desired
                //TODO - Implement magnifier later
                //if (config.position.enable || config.magnify.enable) {
                if (configposition.enable) {
                    node += '<div id="divPosition' + mapid + '" class="gcviz-positionToolbar gcviz-margin-left5">';
						//TODO - Implement magnifier later
                        //if (configposition.enable || configmagnify.enable) {
                        if (configposition.enable) {
                            node += '<div class="row">';
                            node += '   <div class="span2">';
                            node += '       <button id="btnClickMap' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: getMapClick, tooltip: { content: tpGetLocInfo }"><img class="gcviz-img-button" data-bind="attr:{ src: imgPosition }"></img></button>';
                            node += '   </div>';
                            node += '</div>';
                        }
						//TODO - Implement magnifier later
                        // if (configmagnify.enable) {
                            // node += '<button id="btnMagnifier' + mapid + '" class="gcviz-button gcviz-img-button gcviz-inline" tabindex="0" data-bind="click: magnifyClick, tooltip: { content: tpMagnify }"><img class="gcviz-img-button" data-bind="attr:{src: imgMagnify}"></img></button>';
                        // }
                    node += '</div>';
                }
                // DIVs for position information
                if (configposition.enable) {
                    // Setup a dialog box to ask user to click or enter a location
                    node += '<div id="divGetLocInfo' + mapid + '" class="gcviz-hidden">';
                        node += '<div data-bind="template: { name: \'getlocinfo\' }"></div>';
                        node += '<script id="getlocinfo" type="text/html">';
                            node += '<p><span data-bind="text: $root.infoOption1"></span></p>';
                            node += '<button data-bind="click: $root.getMapClick, text: $root.infoClickMap" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus"></button>';
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
