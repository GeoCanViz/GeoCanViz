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
				configGeolocation = config.geolocation.enable,
				configOverview = config.overview.enable,
				configPosition = config.position.enable,
				configScaleDisplay = config.scaledisplay.enable,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '',
				$holder = $mapElem.find('.gcviz-tbholder');

			$holder.append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbnav' + mapid, title: '' + i18n.getDict('%toolbarnav-name') + '', content: '<div class="gcviz-tbnav-content gcviz-tbcontent"></div>', open: true }); // true because of a bug, see init function in VM
			$holder.append(tp.domNode);
			tp.startup();

			// set focus on open
			tp.on('click', function() {
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbnav-content'));
			});

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');

			// contextual help
			node += '<div class="row">' +
						'<label class="gcviz-help-bubbledesc" for="tbnav' + mapid + '" data-bind="contextHelp: { text: helpDesc, alt: helpAlt, img: imgHelpBubble, id: \'tbnav' + mapid + '\' }"></label></div>' +
					'</div>';

			// geolocation zoom
			if (configGeolocation) {
				node += '<div>' +
							'<span id="divAutoCompleteInstructions' + mapid + '" class="ui-helper-hidden-accessible" data-bind="text: insKeyboard"></span>' +
							'<label class="gcviz-inline gcviz-label" for="inGeoLocation' + mapid + '" data-bind="text: geoLocLabel"></label>' +
							'<input id="inGeoLocation' + mapid + '" class="gcviz-nav-auto" data-bind="value: \'\'"></input>' +
						'</div>';
			}

			// set position information
			if (configPosition) {
				node += '<div class="row">' +
							'<div class="span1"><button id="btnClickMap' + mapid + '" class="gcviz-nav-pos" tabindex="0" data-bind="buttonBlur, click: getMapClick, attr: { title: tpGetLocInfo }"></button></div>' +
							'<div class="span11"><label class="gcviz-label gcviz-nav-lblpos" for="btnClickMap' + mapid + '" data-bind="text: infoLabel"></label></div>' +
						'</div>';
			}

			// set overview map
			if (configOverview) {
				node += '<div class="row gcviz-nav-overview">' +
							'<div class="span1"></div>' +
							'<div class="span10">' +
								'<label class="gcviz-label" for="ovMapContainer' + mapid + '" data-bind="text: OVLabel"></label>' +
								'<div id="ovtoolcontainer' + mapid + '" class="gcviz-ovtoolcontainer">' +
									'<div id="ovMapContainer' + mapid + '" class="gcviz-overviewMap" data-bind="attr: { title: tpOverview }">' +
										'<div id="divOverviewMap' + mapid + '"></div>' +
									'</div>' +
								'</div>' +
								'<input class="gcviz-leg-check" type="checkbox" data-bind="event: { click: showOVMap }, clickBubble: false, attr: { title: $root.tpVisible, id: \'chk-ov-display\' }, checked: isOVShowMap"/>' +
								'<label class="gcviz-label gcviz-nav-lblovdisp" for="chk-ov-display" data-bind="text: OVDisplayLabel"></label>' +
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
			node += '<div data-bind="wcag: { }, uiDialog: { title: $root.WCAGTitle, width: 490, height: 210, ok: $root.dialogWCAGOk, cancel: $root.dialogWCAGCancel, close: $root.dialogWCAGClose, openDialog: \'isDialogWCAG\' }">' +
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
				node += '<div data-bind="uiDialog: { title: $root.lblLocTitle, width: 400, height: 625, close: $root.dialogLocOk, openDialog: \'isLocDialogOpen\' }">' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: $root.infoTopoCoord"></span></strong>' +
								'<p><strong data-bind="text: $root.infoDecDeg"></strong></p>' +
								'<p><span data-bind="text: $root.infoLat"></span><span data-bind="text: $root.infoLatDD"></span></p>' +
								'<p><span data-bind="text: $root.infoLong"></span><span data-bind="text: $root.infoLongDD"></span></p>' +
								'<p><strong data-bind="text: $root.infoDMS"></strong></p>' +
								'<p><span data-bind="text: $root.infoLat"></span><span data-bind="text: $root.infoLatDMS"></span></p>' +
								'<p><span data-bind="text: $root.infoLong"></span><span data-bind="text: $root.infoLongDMS"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: $root.infoUTM"></span></strong>' +
								'<p><span data-bind="text: $root.infoUTMz"></span><span data-bind="text: $root.spnUTMzone"></span></p>' +
								'<p><span data-bind="text: $root.infoUTMeast"></span><span data-bind="text: $root.spnUTMeast"></span></p>' +
								'<p><span data-bind="text: $root.infoUTMnorth"></span><span data-bind="text: $root.spnUTMnorth"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: $root.infoNTS"></span></strong>' +
								'<p></span><span data-bind="text: $root.spnNTS"></span></p>' +
							'</div>' +
							'<div class="gcviz-navinfo-content">' +
								'<strong>&nbsp;<span data-bind="text: $root.infoAltitude"></span></strong>' +
								'<p></span><span data-bind="text: $root.spnAltitude"></span></p>' +
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
