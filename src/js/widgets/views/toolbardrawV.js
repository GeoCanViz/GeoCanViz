/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar draw widget
 */
(function() {
	'use strict';
	define(['jquery',
			'gcviz-vm-tbdraw',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function($, tbdrawVM, dojotitle, i18n) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbardraw,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';
			
			tp = new dojotitle({id: 'tbanno' + mapid, title: '' + i18n.getDict('%toolbardraw-name') + '', content: '<div class="gcviz-tbdraw-content gcviz-tbcontent"></div>', open: false});
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();

			// change tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');
			
			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbdraw-content');

			// set draw button
			if (config.drawline.enable) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: drawClick, tooltip: { content: tpDraw }"><img class="gcviz-img-button" data-bind="attr:{src: imgDraw}"></img></button>';
			}
			
			// set text button
			if (config.drawtext.enable) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: textClick, tooltip: { content: tpText }"><img class="gcviz-img-button" data-bind="attr:{src: imgText}"></img></button>';
				
				// create the annotation inputbox (dont use knockout data-bind because there one window for the whole page not by ViewModel)
				if ($('#gcviz-draw-inputbox').length === 0) {
					$('body').prepend('<div id="gcviz-draw-inputbox">' +
										'<form><fieldset>' +
										'<label for="value">' + i18n.getDict('%toolbardraw-inputbox-label') + '</label>' +
										' <input id="value" class="text ui-widget-content ui-corner-all"/>' +
										'</fieldset></form></div>');
				}
			}
			
			// set erase button
			node += '<button class="gcviz-button" tabindex="0" data-bind="click: eraseClick, tooltip: { content: tpErase }"><img class="gcviz-img-button" data-bind="attr:{src: imgErase}"></img></button>';
			
			// set measure button
			if (config.measure.enable) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: measureClick"><img class="gcviz-img-button" data-bind="attr:{src: imgMeasure}"></img></button>';
			}
			
			// set import and save buttons
			if (config.importexport.enable) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: importClick"><img class="gcviz-img-button" data-bind="attr:{src: imgImport}"></img></button>';
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: exportClick"><img class="gcviz-img-button" data-bind="attr:{src: imgExport}"></img></button>';
			}
			
			$toolbar.append(node);
			return(tbdrawVM.initialize($toolbar, mapid));
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
