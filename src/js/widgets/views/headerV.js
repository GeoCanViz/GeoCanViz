/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-header',
			'gcviz-i18n',
			'dijit/TitlePane'
	], function(headerVM, i18n, dojotitle) {
		var initialize;

		initialize = function($mapElem) {
			var $header, tp, ext,
				config = $mapElem.header,
				configTools = config.tools,
				configAbout = config.about,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
				node = '';

			$mapElem.find('#' + mapid).prepend('<div id="head' + mapid + '" class="gcviz-head"></div>');
			// Find the header element to insert things in
			$header = $mapElem.find('.gcviz-head');

			// set the side class extension to know where to put tools and buttons
			ext = config.side ? '-r' : '-l';

			// set title
			if (typeof title !== 'undefined') {
				node += '<label class="gcviz-head-title' + ext + ' unselectable">' + title + '</label>';
			}

			// add buttons
			node += '<div class="gcviz-head-btn' + ext + '">';

			// set help button (help is always visible)
			node += '<button class="gcviz-head-help" tabindex="0" data-bind="buttonBlur, click: helpClick, tooltip: { content: tpHelp }"></button>';

			// dialog text to show help
			node += '<div data-bind="uiDialog: { title: $root.lblHelpTitle, width: 350, height: 220, ok: $root.dialogHelpOk, close: $root.dialogHelpOk, openDialog: \'isHelpDialogOpen\' }">' +
						'<span data-bind="text: $root.helpInfo1"></span>' +
						'<a data-bind="attr: { href: $root.helpURL, title: $root.helpURLText }, text: $root.helpURLText" tabindex="0" target="new"></a></br>' +
						'<span data-bind="text: $root.helpInfo2"></span>' +
					'</div>';

			// set WCAG button
			node += '<button class="gcviz-head-wcag" tabindex="0" data-bind="buttonBlur, click: WCAGClick, tooltip: { content: tpWCAG }, css: { \'gcviz-head-wcag\': isWCAG() === false, \'gcviz-head-wcagon\': isWCAG() === true }"></button>';

			// set about button
			if (configAbout.enable) {
				node += '<button class="gcviz-head-about" tabindex="0" data-bind="buttonBlur, click: aboutClick, tooltip: { content: tpAbout }"></button>';

				// dialog text to show about
				node += '<div data-bind="uiDialog: { title: $root.lblAboutTitle, width: 400, height: 300, ok: $root.dialogAboutOk, close: $root.dialogAboutOk, openDialog: \'isAboutDialogOpen\' }">' +
						'<span data-bind="text: $root.aboutInfo1"></span>' +
						'<div data-bind="if: aboutType === 2"><a data-bind="attr: { href: $root.aboutURL, title: $root.aboutURLText }, text: $root.aboutURLText" tabindex="0" target="_blank"></a>' +
						'<span data-bind="text: $root.aboutInfo2"></span></div>' +
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
				node += '<button class="gcviz-head-fs" tabindex="0" data-bind="buttonBlur, click: fullscreenClick, tooltip: { content: tpFullScreen }, css: { \'gcviz-head-fs\': isFullscreen() === false, \'gcviz-head-reg\': isFullscreen() === true }"></button>';
			}
			node += '</div>';

			$header.append(node);
			if (configTools.enable === true) {
				// Add a collapsible container for tools to hold all the toolbars instead of having a tools icon
				$mapElem.find('.gcviz-head').append('<div id="divToolsOuter' + mapid + '" class="gcviz-tbcontainer' + ext + '" data-bind="attr: { style: xheightToolsOuter }"><div id="divToolsInner' + mapid + '" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsInner }"></div></div>');
				tp = new dojotitle({ id: 'tbTools' + mapid, title: '' + i18n.getDict('%header-tools') + '', content: '<div class="gcviz-tbholder" data-bind="attr: { style: widthheightTBholder }"></div>', open: true });
				$mapElem.find('.gcviz-toolsholder').append(tp.domNode);
				tp.startup();
				
				// if expand is true, toggle tools
				// wait until the navigation toolbar overview widget is set (250 milliseconds)
				setTimeout(function() {			
					if (!configTools.expand) {
						tp.toggle();
					}
				}, 300);
			}
			return (headerVM.initialize($header, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
