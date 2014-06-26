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
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			$mapElem.find('.gcviz-tbholder').append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbnav' + mapid, title: 'Navigation', content: '<div class="gcviz-tbnav-content gcviz-tbcontent"></div>', open: true }); // true because of a bug, see init function in VM
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			
			// set focus on open
			tp.on('click', function() { 
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbnav-content'));
			});

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');

			// if present, group the 2 items (fullextent and geolocation) on the same line
			node += '<div class="row gcviz-nav-zoom">';
			// set full extent button
			if (config.zoom) {
				node += '<div class="span2"><button class="gcviz-nav-max" tabindex="0" data-bind="click: extentClick, tooltip: { content: tpZoomFull }"></button></div>';
			}

			// set geolocation
			if (configgeolocation.enable) {
				node += '<div class="span10"><span id="divAutoCompleteInstructions' + mapid + '" class="ui-helper-hidden-accessible" data-bind="text: insKeyboard"></span>';
				node += '<label class="gcviz-inline" for="inGeoLocation" data-bind="text: geoLocLabel"></label>';
				node += '<input id="inGeoLocation' + mapid + '" data-bind="value: geoLocSample, tooltip: { content: geoLocSample }" /></div>';
			}
			node += '</div>';

			// set position information
			if (configposition.enable) {
				node += '<div class="row gcviz-nav-tools"><div class="span1">';
				node += '<button id="btnClickMap' + mapid + '" class="gcviz-nav-pos" tabindex="0" data-bind="click: getMapClick, tooltip: { content: tpGetLocInfo }"></button>';
				node += '</div></div>';
			}

			// set overview map
			if (configoverview.enable) {
				node += '<div class="row gcviz-nav-overview"><div class="span1"></div><div class="span9 gcviz-ovtoolcontainer">';
					node += '<div id="divOverviewMapContainer' + mapid + '" class="gcviz-overviewMap" data-bind="tooltip: { content: tpOverview }">';
						node += '<div id="divOverviewMap' + mapid + '"></div>';
					node += '</div>';
				node += '</div></div>';
			}

			// if present, group the 2 items (scale and scale display)
			node += '<div class="row gcviz-nav-scale"><div class="span1"></div>';
			// set scalebar
			if (configscalebar.enable) {
				node += '<div class="span6 unselectable"><div id="divScalebar' + mapid + '"></div>';
				node += '<div class="gcviz-scaleApprox">(approx.)</div></div>';
			}

			// set scale display
			if (configscaledisplay.enable) {
				node += '<div class="span5"><span class="gcviz-scaleDisplayLabel" data-bind="text: lblScale"></span><span class="gcviz-scaleApprox">(approx.)</span></div>';
			}
			node += '</div>';

			// DIVs for position information
			if (configposition.enable) {
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
