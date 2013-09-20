/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tbnav',
			'dijit/TitlePane'
	], function(toolbarnavVM, dojotitle) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarnav,
				mapid = $mapElem.mapframe.id,
				tp;
			
			tp = new dojotitle({id: 'tbnav' + mapid, title:'Navigation', content: '<div class="toolbarnav-content toolbar-content"></div>', open: false});
			$mapElem.find('.toolbars-holder').append(tp.domNode);
			tp.startup();
			
			$toolbar = $mapElem.find('.toolbarnav-content');
			
			// set full extent button button
			if (config.fullextent) {
				$toolbar.append('<button class="toolbar-button" data-bind="click: extentClick"><img class="img-button" data-bind="attr:{src: imgExtent}"></img></button>');
			}
			
			toolbarnavVM.initialize($mapElem.find('.toolbarnav-content'), mapid);
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
