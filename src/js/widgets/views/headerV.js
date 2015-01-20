/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-header'
	], function($viz, headerVM) {
		var initialize,
			addToolbars;

		initialize = function($mapElem) {
			var $header, ext,
				config = $mapElem.header,
				configTools = config.tools,
				configAbout = config.about,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
				node = '',
				menu = '';

			$mapElem.find('#' + mapid).prepend('<div id="head' + mapid + '" class="gcviz-head"></div>');
			// Find the header element to insert things in
			$header = $mapElem.find('.gcviz-head');

			// set the side class extension to know where to put tools and buttons
			ext = config.side === 1 ? '-r' : '-l';

			// set title (always configure with menu right so use ext = -r)
			if (typeof title !== 'undefined') {
				node += '<label class="gcviz-head-title-r unselectable">' + title + '</label>';
			}

			// add buttons (always configure with menu right so use ext = -r)
			node += '<div class="gcviz-head-btn-r">';

			// set about button
			if (configAbout.enable) {
				node += '<button class="gcviz-head-about" tabindex="0" data-bind="buttonBlur, click: aboutClick, tooltip: { content: tpAbout }"></button>';

				// dialog text to show about
				node += '<div data-bind="uiDialog: { title: lblAboutTitle, width: 400, height: 300, ok: dialogAboutOk, close: dialogAboutOk, openDialog: \'isAboutDialogOpen\' }">' +
						'<span data-bind="text: aboutInfo1"></span>' +
						'<div data-bind="if: aboutType === 2"><a data-bind="attr: { href: aboutURL, title: aboutURLText }, text: aboutURLText" tabindex="0" target="_blank"></a>' +
						'<span data-bind="text: aboutInfo2"></span></div>' +
					'</div>';
			}

			//TODO: add this functionnality
			// add link if link map is enable
			//if (config.link) {
				//node += '<button class="gcviz-head-link" tabindex="0" data-bind="click: linkClick, tooltip: { content: tpLink }"></button>';
			//}

			// add inset button if inset are present
			if (config.inset) {
				node += '<button class="gcviz-head-inset" tabindex="0" data-bind="buttonBlur, click: insetClick, tooltip: { content: tpInset }"></button>';
			}

			// add print button
			if (config.print.enable) {
				node += '<button class="gcviz-head-print" tabindex="0" data-bind="buttonBlur, click: printClick, tooltip: { content: tpPrint }"></button>';
			}

			// add fullscreen button
			if (config.fullscreen) {
				node += '<button class="gcviz-head-fs gcviz-head-pop" tabindex="0" data-bind="buttonBlur, click: fullscreenClick, tooltip: { content: tpFullScreen }, css: { \'gcviz-head-fs\': isFullscreen() === false, \'gcviz-head-reg\': isFullscreen() === true }"></button>';
			}

			// set help button (help is always visible)
			node += '<button class="gcviz-head-help" tabindex="0" data-bind="buttonBlur, click: helpClick, tooltip: { content: tpHelp }"></button>';

			node += '</div>';

			$header.append(node);
			if (configTools.enable === true) {
				// Add a collapsible container for tools to hold all the toolbars instead of having a tools icon
				$mapElem.find('.gcviz-head').append('<div id="divToolsOuter' + mapid + '" class="gcviz-tbcontainer' + ext + '" data-bind="attr: { style: xheightToolsOuter }">' +
														'<div id="divToolsInner' + mapid + '" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsOuter }"></div>' +
													'</div>');
				menu = '<div id="gcviz-menu' + mapid + '" class="gcviz-menu" data-bind="uiAccordion: { heightStyle: \'content\', collapsible: true }, attr: { style: xheightToolsOuter }">' +
							'<h3 class="gcviz-menu-title gcviz-menu-title' + ext + '" data-bind="panelBlur"><span data-bind="text: lblMenu"></span></h3>' +
							'<div id="gcviz-menu-cont' + mapid + '" class="gcviz-menu-cont" data-bind="uiAccordion: { heightStyle: \'content\', collapsible: true, active: false, activate: function(event, ui) { showExtractGrid(event, ui); } }, attr: { style: xheightToolsInner }">' +
								addToolbars($mapElem, mapid) +
							'</div>' +
						'</div>';

				$mapElem.find('.gcviz-toolsholder').append(menu);
			}

			return (headerVM.initialize($header, mapid, config));
		};

		addToolbars = function(config, mapid) {
			var cfgDraw = config.toolbardraw,
				cfgNav = config.toolbarnav,
				cfgLeg = config.toolbarlegend,
				cfgData = config.toolbardata,
				cfgExtract = config.toolbarextract,
				tools = ['', '', '', '', ''];

			// check what toolbar is enable, the order and the index of the expand one.
			// add the contextual help
			if (cfgDraw.enable) {
				tools[cfgDraw.pos] = '<h3 class="gcviz-panel-title" data-bind="panelBlur">' +
										'<span data-bind="contextHelp: { text: drawTitle; alt: drawAlt; img: imgHelpBubble; id: \'tbdraw' + mapid + '\'; link: \'gcviz-help-tbdraw\' }"></span>' +
									'</h3>' +
									'<div class="gcviz-tbdraw-content gcviz-tbcontent" gcviz-exp="' + cfgDraw.expand + '" tabindex="-1"></div>';
			}
			if (cfgNav.enable) {
				tools[cfgNav.pos] = '<h3 class="gcviz-panel-title gcviz-nav-panel" data-bind="panelBlur">' +
										'<span data-bind="contextHelp: { text: navTitle; alt: navAlt; img: imgHelpBubble; id: \'tbnav' + mapid + '\'; link: \'gcviz-help-tbnav\' }"></span>' +
									'</h3>' +
									'<div class="gcviz-tbnav-content gcviz-tbcontent" gcviz-exp="' + cfgNav.expand + '" tabindex="-1"></div>';
			}
			if (cfgLeg.enable) {
				tools[cfgLeg.pos] = '<h3 class="gcviz-panel-title" data-bind="panelBlur">' +
										'<span data-bind="contextHelp: { text: legendTitle; alt: legendAlt; img: imgHelpBubble; id: \'tbleg' + mapid + '\'; link: \'gcviz-help-tbleg\' }"></span>' +
									'</h3>' +
									'<div class="gcviz-tbleg-content gcviz-tbcontent-leg" gcviz-exp="' + cfgLeg.expand + '" tabindex="-1"></div>';
			}
			if (cfgData.enable) {
				tools[cfgData.pos] = '<h3 class="gcviz-panel-title" data-bind="panelBlur">' +
										'<span data-bind="contextHelp: { text: dataTitle; alt: dataAlt; img: imgHelpBubble; id: \'tbdata' + mapid + '\'; link: \'gcviz-help-tbdata\' }"></span>' +
									'</h3>' +
									'<div class="gcviz-tbdata-content gcviz-tbcontent" gcviz-exp="' + cfgData.expand + '" tabindex="-1"></div>';
			}
			if (cfgExtract.enable) {
				tools[cfgExtract.pos] = '<h3 class="gcviz-panel-title" data-bind="panelBlur">' +
										'<span data-bind="contextHelp: { text: extractTitle; alt: extractAlt; img: imgHelpBubble; id: \'tbextract' + mapid + '\'; link: \'gcviz-help-tbextract\' }"></span>' +
									'</h3>' +
									'<div class="gcviz-tbextract-content gcviz-tbcontent" gcviz-exp="' + cfgExtract.expand + '" tabindex="-1"></div>';
			}

			// remove coma between toolbars. Make sure to keep inner coma.
			return tools.toString().replace(/,/g, '').replace(/;/g, ',');
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
