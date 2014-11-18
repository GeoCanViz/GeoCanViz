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
			'gcviz-vm-tbnav'
	], function($viz, tbnavVM) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarnav,
				configGeolocation = config.geolocation.enable,
				configOverview = config.overview.enable,
				configPosition = config.position.enable,
				configScaleDisplay = config.scaledisplay.enable,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');

			// geolocation zoom
			if (configGeolocation) {
				node += '<div>' +
							'<span id="divAutoCompleteInstructions' + mapid + '" class="ui-helper-hidden-accessible" data-bind="text: insKeyboard"></span>' +
							'<span class="gcviz-subtitle" data-bind="text: zoomGrp"></span>' +
							'<input id="inGeoLocation' + mapid + '" class="gcviz-nav-auto" data-bind="value: \'\'"></input>' +
							'<label class="gcviz-inline gcviz-label" for="inGeoLocation' + mapid + '" data-bind="text: geoLocLabel"></label>' +
						'</div>';
			}

			// set position information
			if (configPosition) {
				node += '<div class="row gcviz-nav-info">' +
							'<span class="gcviz-subtitle" data-bind="text: mapInfoGrp"></span>' +
							'<div class="row">' +
								'<div class="span1"><button id="btnClickMap' + mapid + '" class="gcviz-nav-pos" tabindex="0" data-bind="buttonBlur, click: getMapClick, attr: { alt: tpGetLocInfo }"></button></div>' +
								'<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnClickMap' + mapid + '" data-bind="text: infoLabel"></label></div>' +
							'</div>' +
						'</div>';
			}

			// set overview map
			if (configOverview) {
				node += '<div class="row gcviz-nav-overview">' +
							'<span class="gcviz-subtitle" data-bind="text: OVLabel"></span>' +
							'<div class="row">' +
								'<div class="span1"></div>' +
								'<div class="span10">' +
									'<div id="ovtoolcontainer' + mapid + '" class="gcviz-ovtoolcontainer">' +
										'<div id="ovMapContainer' + mapid + '" class="gcviz-overviewMap" data-bind="tooltip: { content: tpOverview }">' +
											'<div id="divOverviewMap' + mapid + '"></div>' +
										'</div>' +
									'</div>' +
									'<input class="gcviz-leg-check" type="checkbox" data-bind="event: { click: showOVMap }, clickBubble: false, attr: { alt: $root.tpVisible, id: \'chk-ov-display\' }, checked: isOVShowMap"/>' +
									'<label class="gcviz-label gcviz-nav-lblovdisp" for="chk-ov-display" data-bind="text: OVDisplayLabel"></label>' +
								'</div>' +
							'</div>' +
						'</div>';
			}

			// set scale display
			if (configScaleDisplay) {
				node += '<div class="row gcviz-nav-scale">' +
							'<div class="span1"></div>' +
							'<div id="scaletool' + mapid + '" class="span11"><span class="gcviz-scaleDisplayLabel" data-bind="text: lblScale"></div>' +
						'</div>';
			}

			// WCAG dialog window
			node += '<div data-bind="wcag: { }, uiDialog: { title: WCAGTitle, width: 490, height: 210, ok: dialogWCAGOk, cancel: dialogWCAGCancel, close: dialogWCAGClose, openDialog: \'isDialogWCAG\' }">' +
						'<div>' +
							'<label for="gcviz-xvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGx"></label>' +
							'<input id="gcviz-xvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: xValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgx"></span>' +
						'</div>' +
						'<div>' +
							'<label for="gcviz-yvalue" class="gcviz-label gcviz-label-wcag" data-bind="text: lblWCAGy"></label>' +
							'<input id="gcviz-yvalue" class="text ui-widget-content ui-corner-all gcviz-input-wcag" data-bind="value: yValue"/>' +
							'<span class="gcviz-message-wcag" data-bind="text: lblWCAGmsgy"></span>' +
						'</div>' +
					'</div>';

			// position information
			if (configPosition) {
				// Setup a dialog box to show results
				node += '<div data-bind="uiDialog: { title: lblLocTitle, width: 400, height: 625, modal: false, draggable: true, close: dialogLocOk, openDialog: \'isLocDialogOpen\' }">' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: infoTopoCoord"></span></strong>' +
								'<p><strong data-bind="text: infoDecDeg"></strong></p>' +
								'<p><span data-bind="text: infoLat"></span><span data-bind="text: $root.infoLatDD"></span></p>' +
								'<p><span data-bind="text: infoLong"></span><span data-bind="text: $root.infoLongDD"></span></p>' +
								'<p><strong data-bind="text: infoDMS"></strong></p>' +
								'<p><span data-bind="text: infoLat"></span><span data-bind="text: $root.infoLatDMS"></span></p>' +
								'<p><span data-bind="text: infoLong"></span><span data-bind="text: $root.infoLongDMS"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: $root.infoUTM"></span></strong>' +
								'<p><span data-bind="text: infoUTMz"></span><span data-bind="text: $root.spnUTMzone"></span></p>' +
								'<p><span data-bind="text: infoUTMeast"></span><span data-bind="text: $root.spnUTMeast"></span></p>' +
								'<p><span data-bind="text: infoUTMnorth"></span><span data-bind="text: $root.spnUTMnorth"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: infoNTS"></span></strong>' +
								'<p></span><span data-bind="text: spnNTS"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: infoAltitude"></span></strong>' +
								'<p></span><span data-bind="text: spnAltitude"></span></p>' +
							'</div>' +
						'</div>';
			}

			$toolbar.append(node);
			return(tbnavVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
