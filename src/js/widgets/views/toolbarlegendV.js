/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-tblegend',
			'dijit/TitlePane',
			'gcviz-i18n'	
	], function(tblegendVM, dojotitle, i18n) {
		var initialize;
		
		initialize = function($mapElem) {
			var $legend,
				config = $mapElem.toolbarlegend,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';
			
			tp = new dojotitle({id: 'tbleg' + mapid, title: i18n.getDict('%toolbarlegend-name'), content: '<div class="gcviz-tbleg-content gcviz-tbcontent"></div>', open: config.expand});
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			
			// add tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');
			
			// find toolbar and start to add items
			$legend = $mapElem.find('.gcviz-tbleg-content');

		    //list services
			node += '<div id="legendDiv' + mapid + '" data-bind="foreach: theArray">';
		 	
		    node += '<ul id="serviceList" >';
		    node += '<li>';
		    node += '<input type="checkbox" data-bind="click: $root.changeServiceVisibility, attr: { title: $root.tpVisible, checked:visibility.visible, hidden: visibility.control }"/>';
		    node += '<span data-bind="text: label.value"></span>';
		    node += '<div data-bind="HorizontalSliderDijit: { widget: ' + '$root.HorizontalSlider' + ', max:opacity.value }, attr: { hidden: opacity.slider }"></div>';
			
				//list layers
		    	node += '<ul id="layerList" data-bind="foreach: layers">';
		    	node += '<li>';
		    	node += '<input type="checkbox" data-bind="event: { change: $root.changeLayerVisibility, click: $root.changeLayerVisibility }, attr: { title: $root.tpVisible, checked:visibility.check, hidden: visibility.value, value:id }"/>';
		    	node += '<span data-bind="text: label.value"></span>';
		    	node += '<div data-bind="HorizontalSliderDijit: { widget:  ' + '$root.HorizontalSlider' + ', max:opacity.value }, attr:{ hidden: opacity.slider }"></div>';

		    node += '</li></ul>';
		    node += '</li></ul></div>'; 
		
			$legend.append(node);
			return (tblegendVM.initialize($legend, mapid,config));
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);