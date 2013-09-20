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
			'dijit/TitlePane'
	], function(toolbarannoVM, dojotitle) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbaranno,
				mapid = $mapElem.mapframe.id,
				tp;
			
			tp = new dojotitle({id: 'tbanno' + mapid, title:'Annotation', content: '<div class="toolbaranno-content toolbar-content"></div>', open: false});
			$mapElem.find('.toolbars-holder').append(tp.domNode);
			tp.startup();
			
			$toolbar = $mapElem.find('.toolbaranno-content');
			
			// set draw button
			if (config.drawline) {
				$toolbar.append('<button class="toolbar-button" data-bind="click: drawClick"><img class="img-button" data-bind="attr:{src: imgDraw}"></img></button>');
			}
			
			// set text button
			if (config.drawtext) {
				$toolbar.append('<button class="toolbar-button" data-bind="click: textClick"><img class="img-button" data-bind="attr:{src: imgText}"></img></button>');
			}
			
			// set erase button
			$toolbar.append('<button class="toolbar-button" data-bind="click: eraseClick"><img class="img-button" data-bind="attr:{src: imgErase}"></img></button>');
			
			// set measure button
			if (config.measure) {
				$toolbar.append('<button class="toolbar-button" data-bind="click: measureClick"><img class="img-button" data-bind="attr:{src: imgMeasure}"></img></button>');
			}
			
			// set import and save buttons
			if (config.importsave) {
				$toolbar.append('<button class="toolbar-button" data-bind="click: importClick"><img class="img-button" data-bind="attr:{src: imgImport}"></img></button>');
				$toolbar.append('<button class="toolbar-button" data-bind="click: exportClick"><img class="img-button" data-bind="attr:{src: imgExport}"></img></button>');
			}
			
			toolbarannoVM.initialize($mapElem.find('.toolbaranno-content'), mapid);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
