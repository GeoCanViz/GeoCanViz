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
				node = '',
				$holder = $mapElem.find('.gcviz-tbholder');

			// add the url for dowload page to config
			config.urldownload = $mapElem.mapframe.map.urldownload;

			$holder.append('<div class="gcviz-tbspacer"></div>');
			tp = new dojotitle({ id: 'tbdraw' + mapid, title: '' + i18n.getDict('%toolbardraw-name') + '', content: '<div class="gcviz-tbdraw-content gcviz-tbcontent"></div>', open: config.expand });
			$holder.append(tp.domNode);
			tp.startup();

			// set focus on open
			tp.on('click', function() {
				$viz('.gcviz-tbholder').scrollTo($viz('.gcviz-tbdraw-content'));
			});

			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdraw-content');

			// first row
			node += '<div class="gcviz-draw-row1">';

			// set color picker
			node +=	'<div class="gcviz-draw-cholder">' +
						'<button class="gcviz-draw-black" tabindex="0" data-bind="click: function() { selectColorClick(\'black\') }, tooltip: { content: tpBlack }, css: {\'gcviz-draw-pickblack\': selectedColor() === \'black\' }"></button>' +
						'<button class="gcviz-draw-blue" tabindex="0" data-bind="click: function() { selectColorClick(\'blue\') }, tooltip: { content: tpBlue }, css: {\'gcviz-draw-pickblue\': selectedColor() === \'blue\' }"></button>' +
						'<button class="gcviz-draw-green" tabindex="0" data-bind="click: function() { selectColorClick(\'green\') }, tooltip: { content: tpGreen }, css: {\'gcviz-draw-pickgreen\': selectedColor() === \'green\' }"></button>' +
						'<button class="gcviz-draw-red" tabindex="0" data-bind="click: function() { selectColorClick(\'red\') }, tooltip: { content: tpRed }, css: {\'gcviz-draw-pickred\': selectedColor() === \'red\' }"></button>' +
						'<button class="gcviz-draw-yellow" tabindex="0" data-bind="click: function() { selectColorClick(\'yellow\') }, tooltip: { content: tpYellow }, css: {\'gcviz-draw-pickyellow\': selectedColor() === \'yellow\' }"></button>' +
						'<button class="gcviz-draw-white" tabindex="0" data-bind="click: function() { selectColorClick(\'white\') }, tooltip: { content: tpWhite }, css: {\'gcviz-draw-pickwhite\': selectedColor() === \'white\' }"></button>' +
						'<button class="gcviz-draw-arrow" tabindex="-1"></button>' +
					'</div>';

			node += '<div class="gcviz-tbseparator"></div>';

			// set draw button
			if (config.drawline.enable) {
				node += '<button class="gcviz-draw-line" tabindex="0" data-bind="buttonBlur, click: drawClick, tooltip: { content: tpDraw }"></button>';
			}
			// set text button
			if (config.drawtext.enable) {
				node += '<button class="gcviz-draw-text" tabindex="0" data-bind="buttonBlur, click: textClick, tooltip: { content: tpText }"></button>';
			}

			node += '<div class="gcviz-tbseparator"></div>';

			// set measure button
			if (config.measureline.enable) {
				node += '<button class="gcviz-draw-length" tabindex="0" data-bind="buttonBlur, click: measureLengthClick, tooltip: { content: tpMeasureLength }"></button>';
			}
			if (config.measurearea.enable) {
				node += '<button class="gcviz-draw-area" tabindex="0" data-bind="buttonBlur, click: measureAreaClick, tooltip: { content: tpMeasureArea }"></button>';
			}

			// close first row
			node += '</div>';

			// set erase buttons
			node += '<div class="row gcviz-inlineblock">' +
						'<button class="gcviz-draw-del" tabindex="0" data-bind="buttonBlur, click: eraseClick, tooltip: { content: tpErase }, enable: isGraphics"></button>' +
						'<button class="gcviz-draw-delsel" tabindex="0" data-bind="buttonBlur, click: eraseSelClick, tooltip: { content: tpEraseSel }, enable: isGraphics"></button>' +
					'</div>';

			node += '<div class="gcviz-tbseparator"></div>';

			// set undo and redo buttons
			node += '<div class="row gcviz-inlineblock">' +
						'<button class="gcviz-draw-undo" tabindex="0" data-bind="buttonBlur, click: undoClick, tooltip: { content: tpUndo }, enable: stackUndo().length > 0"></button>' +
						'<button class="gcviz-draw-redo" tabindex="0" data-bind="buttonBlur, click: redoClick, tooltip: { content: tpRedo }, enable: stackRedo().length > 0"></button>' +
					'</div>';

			node += '<div class="gcviz-tbseparator"></div>';

			// set import and save buttons
			if (config.importexport.enable) {
			node += '<div class="gcviz-inlineblock">' +
						'<input id="fileDialogAnno" type="file" accept="application/json" data-bind="event: { change: importClick }" tabindex="-1"></input>' +
						'<button class="gcviz-draw-imp" tabindex="0" data-bind="buttonBlur, click: launchDialog, tooltip: { content: tpImport }"></button>' +
						'<button class="gcviz-draw-exp" tabindex="0" data-bind="buttonBlur, click: exportClick, tooltip: { content: tpExport }, enable: isGraphics"></button>' +
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
