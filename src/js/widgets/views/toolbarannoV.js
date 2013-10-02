/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar annotation widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tbanno',
			'dijit/TitlePane',
			'gcviz-i18n'
	], function(toolbarannoVM, dojotitle, i18n) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbaranno,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';
			
			tp = new dojotitle({id: 'tbanno' + mapid, title:'Annotation', content: '<div class="toolbaranno-content toolbar-content"></div>', open: false});
			$mapElem.find('.toolbars-holder').append(tp.domNode);
			tp.startup();
			
			$toolbar = $mapElem.find('.toolbaranno-content');
			
			// set import and save buttons
			if (config.importexport.enable) {
				node += '<button class="toolbaranno-button" data-bind="click: importClick"><img class="img-button" data-bind="attr:{src: imgImport}"></img></button>';
				node += '<button class="toolbaranno-button" data-bind="click: exportClick"><img class="img-button" data-bind="attr:{src: imgExport}"></img></button>';
			}
			
			// set measure button
			if (config.measure.enable) {
				node += '<button class="toolbaranno-button" data-bind="click: measureClick"><img class="img-button" data-bind="attr:{src: imgMeasure}"></img></button>';
			}
			
			// set erase button
			node += '<button class="toolbaranno-button" data-bind="click: eraseClick"><img class="img-button" data-bind="attr:{src: imgErase}"></img></button>';
			
			// set text button
			if (config.drawtext.enable) {
				node += '<button class="toolbaranno-button" data-bind="click: textClick"><img class="img-button" data-bind="attr:{src: imgText}"></img></button>';
				
				// create the annotation inputbox (dont use knockout data-bind because there one window for the whole page not by ViewModel)
				if ($('#anno-inputbox').length === 0) {
					$('body').prepend('<div id="anno-inputbox">'
										+ '<form><fieldset>'
										+ '<label for="value">' + i18n.getDict('%toolbaranno-inputbox-label') + '</label>'
										+ '<input id="value" class="text ui-widget-content ui-corner-all"/>'
										+ '</fieldset></form></div>');
				}
			}

			// set draw button
			if (config.drawline.enable) {
				node += '<button class="toolbaranno-button" data-bind="click: drawClick"><img class="img-button" data-bind="attr:{src: imgDraw}"></img></button>';
			}

			$toolbar.append(node);
			toolbarannoVM.initialize($mapElem.find('.toolbaranno-content'), mapid);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
