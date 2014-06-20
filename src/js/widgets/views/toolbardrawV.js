/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'gcviz-vm-tbdraw',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function($viz, tbdrawVM, dojotitle, i18n) {
		var initialize;

		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardraw,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';

			// add the url for dowload page to config
			config.urldownload = $mapElem.mapframe.map.urldownload;

			$mapElem.find('.gcviz-tbholder').append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbdraw' + mapid, title: '' + i18n.getDict('%toolbardraw-name') + '', content: '<div class="gcviz-tbdraw-content gcviz-tbcontent"></div>', open: config.expand });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();

			// change tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdraw-content');

			// set color picker
			node += '<button class="gcviz-draw-black" tabindex="0" data-bind="click: colorClick, tooltip: { content: tpColor }, css: cssColor"></button>';

			// set draw button
			if (config.drawline.enable) {
				node += '<button class="gcviz-draw-line" tabindex="0" data-bind="click: drawClick, tooltip: { content: tpDraw }"></button>';
			}

			// set text button
			if (config.drawtext.enable) {
				node += '<button class="gcviz-draw-text" tabindex="0" data-bind="click: textClick, tooltip: { content: tpText }"></button>';
			}

			// set measure button
			if (config.measureline.enable) {
				node += '<button class="gcviz-draw-length" tabindex="0" data-bind="click: measureLengthClick"></button>';
			}
			if (config.measurearea.enable) {
				node += '<button class="gcviz-draw-area" tabindex="0" data-bind="click: measureAreaClick"></button>';
			}

			// color selection panel (wrap function setColorClick because there is parameter. If we dont do this, it will fire at init)
			node += '<div data-bind="visible: isColor">' +
						'<div class="row gcviz-draw-cholderl">' +
							'<button class="gcviz-draw-picker gcviz-draw-pickblack" tabindex="0" data-bind="click: function() { selectColorClick(\'black\') }, tooltip: { content: tpBlack }"></button>' +
							'<button class="gcviz-draw-picker gcviz-draw-pickblue" tabindex="0" data-bind="click: function() { selectColorClick(\'blue\') }, tooltip: { content: tpBlue }"></button>' +
							'<button class="gcviz-draw-picker gcviz-draw-pickgreen" tabindex="0" data-bind="click: function() { selectColorClick(\'green\') }, tooltip: { content: tpGreen }"></button>' +
							'<button class="gcviz-draw-picker gcviz-draw-pickred" tabindex="0" data-bind="click: function() { selectColorClick(\'red\') }, tooltip: { content: tpRed }"></button>' +
						'</div><div class="row gcviz-draw-cholderr">' +
							'<button class="gcviz-draw-picker gcviz-draw-pickyellow" tabindex="0" data-bind="click: function() { selectColorClick(\'yellow\') }, tooltip: { content: tpYellow }"></button>' +
							'<button class="gcviz-draw-picker gcviz-draw-pickwhite" tabindex="0" data-bind="click: function() { selectColorClick(\'white\') }, tooltip: { content: tpWhite }"></button>' +
						'</div>' +
					'</div>';

			// Change line
			node += '<br/>';
			// set erase buttons and undo erase
			node += '<div class="row gcviz-inlineblock">' +
						'<button class="gcviz-draw-del" tabindex="0" data-bind="click: eraseClick, tooltip: { content: tpErase }, enable: isGraphics"></button>' +
						'<button class="gcviz-draw-delsel" tabindex="0" data-bind="click: eraseSelClick, tooltip: { content: tpEraseSel }, enable: isGraphics"></button>' +
					'</div>';

			node += '<div class="gcviz-tbseparator"></div>';

			// set undo and redo buttons
			node += '<div class="row gcviz-inlineblock">' +
						'<button class="gcviz-draw-undo" tabindex="0" data-bind="click: undoClick, tooltip: { content: tpUndo }, enable: stackUndo().length > 0"></button>' +
						'<button class="gcviz-draw-redo" tabindex="0" data-bind="click: redoClick, tooltip: { content: tpRedo }, enable: stackRedo().length > 0"></button>' +
					'</div>';

			node += '<div class="gcviz-tbseparator"></div>';

			// set import and save buttons
			if (config.importexport.enable) {
			node += '<div class="gcviz-inlineblock">' +
						'<input id="fileDialogAnno" type="file" accept="application/json" data-bind="event: { change: importClick }"></input>' +
						'<button class="gcviz-draw-imp" tabindex="0" data-bind="click: launchDialog, tooltip: { content: tpImport }"></button>' +
						'<button class="gcviz-draw-exp" tabindex="0" data-bind="click: exportClick, tooltip: { content: tpExport }, enable: isGraphics"></button>' +
					'</div>';
			}

			// dialog text to add annotation
			node += '<div data-bind="uiDialog: { title: $root.lblTextTitle, width: 450, height: 220, ok: $root.dialogTextOk, cancel: $root.dialogTextCancel, close: $root.dialogTextClose, openDialog: \'isTextDialogOpen\' }">' +
						'<div id="gcviz-draw-inputbox">' +
							'<form><fieldset>' +
								'<label for="gcviz-textvalue" data-bind="value: lblTextDesc"></label>' +
								'<input id="gcviz-textvalue" class="text ui-widget-content ui-corner-all" data-bind="value: drawTextValue, valueUpdate: \'afterkeydown\', returnKey: dialogTextOkEnter"/>' +
								'<div style="clear: both"></div><span data-bind="text: lblTextInfo"></span>' +
							'</fieldset></form>' +
						'</div>' +
					'</div>';

			$toolbar.append(node);
			return(tbdrawVM.initialize($toolbar, mapid, config));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
