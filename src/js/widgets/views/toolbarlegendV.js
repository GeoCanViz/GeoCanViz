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
			'gcviz-i18n',
			'dijit/Tree'
	], function(tblegendVM, dojotitle, i18n, tree) {
		var initialize;
		
		initialize = function($mapElem) {
			var $legend,
				config = $mapElem.toolbarlegend,
				mapid = $mapElem.mapframe.id,
				tp,
				node = '';
			
			tp = new dojotitle({id: 'tbleg' + mapid, title: i18n.getDict('%toolbarlegend-name'), content: '<div class="gcviz-tbleg-content gcviz-tbcontent-nobkg"></div>', open: config.expand});
			$mapElem.find('.gcviz-tbholder').append(tp.domNode);
			tp.startup();
			
			// add tabinndex
			tp.domNode.getElementsByClassName('dijitTitlePaneTitleFocus')[0].setAttribute('tabindex', '0');
			
			// find toolbar and start to add items
			$legend = $mapElem.find('.gcviz-tbleg-content');

			node += '<div class="gcviz-legendDiv" id="legendDiv' + mapid +'"  data-bind="foreach: theArray">';
				 node += '<ul id="serviceList" class="gcviz-legendUl" >';
				  node += '<li class="gcviz-legendLi" data-bind="LegendServiceUL:{expanded: expand}, click: $root.toggleViewService">';
				  	node += '<div class="gcviz-legendHolderDiv" data-bind="if: visibility.enable"><input class="gcviz-legendCheck" type="checkbox" data-bind="click: $root.changeServiceVisibility, attr:{title: $root.tpVisible, checked:visibility.initstate}"/></div>';
				  	node += '<div class="gcviz-legendHolderDiv" data-bind="HorizontalSliderDijit: {widget:  '+ '$root.HorizontalSlider' + ',extent:opacity.minmax, value: opacity.initstate}, if: opacity.enable "></div>';
				  	node += '<div class="gcviz-legendHolderDiv" data-bind="if:metadata.enable"><span><a class = "gcviz-legendLink" target="_blank" data-bind="attr:{href:metadata.value, title:metadata.alttext, alt:metadata.alttext},  text:label.value"></a></span></div>';
				  	node += '<div class="gcviz-legendHolderDiv" data-bind="ifnot:metadata.enable"><span data-bind ="text: label.value "></span></div>';
				  	node += '<div class="gcviz-legendHolderDiv" data-bind="if: customimage.enable"><img class="gcviz-legendImg" data-bind="attr:{src:customimage.url,title:customimage.alttext,alt:customimage.alttext}"></img></div>'; 
				  		
				  		//list layers
				  		 	 node += '<ul id="layerList" class="gcviz-legendlayersUl" data-bind="foreach: layers">';
				  			

				  			 node += '<li id="layerlistli" class="gcviz-legendLiLayer" data-bind="LegendLayersUL:{expanded: expand, id:id, numLayers:$parent.layers.length}, click: $root.toggleViewLayers">';
				  			 	node +='<div id="layerlistparentdiv" class="gcviz-layerlistparentdiv" data-bind="visible: $parent.displaylayer && $parent.layers.length > 1 ">';  //if there is only one child layer, hide and use service properties, still need to be created..don't switch to if
				  			 	
				  			 		node += '<div id="layerlistdiv" class="gcviz-legendHolderDiv" data-bind="if: visibility.enable && $parent.type === 1"><input name="lyndatest" type="checkbox" data-bind="event:{change: $root.changeLayerVisibility, click: $root.changeLayerVisibility}, attr:{title: $root.tpVisible, checked:visibility.initstate,value:id}"/></div>';
				  			 		node += '<div id="layerlistdiv" class="gcviz-legendHolderDiv" data-bind="if: visibility.enable && $parent.type === 2"><input name="lyndatest" type="radio" data-bind="event:{change: $root.changeLayerVisibility, click: $root.changeLayerVisibility}, attr:{title: $root.tpVisible, checked:visibility.initstate,value:id}"/></div>';
				  			 		node += '<div id="layerlistdiv" class="gcviz-legendHolderDiv" data-bind="HorizontalSliderDijit: {widget:  '+ '$root.HorizontalSlider' + ',extent:opacity.minmax,value: opacity.initstate}, if: opacity.enable  "></div>';
				  			 		node += '<div class="gcviz-legendHolderDiv" data-bind="if:metadata.enable"><span><a target="_blank" data-bind="attr:{href:metadata.value, alt:metadata.alttext, title:metadata.alttext},  text:label.value"></a></span></div>';
				  			 		node += '<div id="layerlistdiv" class="gcviz-legendHolderDiv" data-bind="ifnot:metadata.enable"><span  data-bind="text: label.value" ></span></div>';
				  			 		node += '<br>';
				  			 	node +='</div>';

				  			

				  			 	 //keep symbology separate, when not displaying layerlist because of only 1 layer, still need symbology/customimage
				  			 	 node += '<div class="gcviz-legendSymbolDiv" data-bind="visible:$parent.displaylayer && symbology, attr: {id: \'featureLayerSymbol\'+id}"> </div>';
				  			 	 node += '<div class="gcviz-legendSymbolDiv" data-bind="if: customimage.enable"><img class="gcviz-legendImg" data-bind="attr:{src:customimage.url,title:customimage.alttext, alt:customimage.alttext}"></img></div>';
				  			 node += '</li>';
				  		
				  			 
				  node +='</ul></li>';
			node += '<ul><div>';

			$legend.append(node);
			return (tblegendVM.initialize($legend, mapid,config));
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);