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
	], function(tbnavVM, dojotitle) {
		var initialize;
		
		initialize = function($mapElem) {
			var $toolbar,
				config = $mapElem.toolbarnav,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';
			
			tp = new dojotitle({ id: 'tbnav' + mapid, title:'Navigation', content: '<div class="gcviz-tbnav-content gcviz-tbcontent"></div>', open: false });
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			
			// add tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');
			
			// find toolbar and start to add items
			$toolbar = $mapElem.find('.gcviz-tbnav-content');
			
			// set full extent button
			if (config.fullextent) {
				node += '<button class="gcviz-button" tabindex="0" data-bind="click: extentClick"><img class="gcviz-img-button" data-bind="attr:{src: imgExtent}"></img></button>';
			}
			
			$toolbar.append(node);
			return(tbnavVM.initialize($toolbar, mapid));
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
