/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-gislegend',
			'gcviz-ko'
	], function($viz, ko, i18n, gisLegend) {
		var initialize,
			vm;
		
		initialize = function($mapElem, mapid, config) {
			
			//data model
			var toolbarlegendViewModel = function($mapElem, mapid, config) {
				var _self = this;
				_self.mymap = vmArray[mapid].map.map;
				
				//tooltips
				_self.tpVisible = i18n.getDict('%toolbarlegend-tgvis');
		
				_self.init = function () {
					_self.theArray = ko.observableArray(config.items);
					return { controlsDescendantBindings: true };
				};

				_self.changeItemsVisibility = function(selectedItem, event) {
                    var evtTarget = $viz(event.target);
					loopChildrenVisibility(selectedItem, evtTarget.prop('checked'), _self.mymap, loopChildrenVisibility);
					event.stopPropagation();
					return true;
				};

				_self.changeServiceOpacity = function(map, layerid, opacityValue) {
					var layer = map.getLayer(layerid);
					layer.setOpacity(opacityValue);
				};

				_self.toggleViewService = function(selectedLayer, event) {
					
					var evtTarget = $viz(event.target);
					evtTarget.children('div#childItems.gcviz-legendHolderDiv').toggle();
					evtTarget.children('.gcviz-legendSymbolDiv').toggle();
					event.stopPropagation(); //prevent toggling of inner hested lists
				};

				_self.init();
			};

			var loopChildrenVisibility = function(itemMaster, e, map)
			{
				if(itemMaster.items.length > 0){
					Object.keys(itemMaster.items).forEach(function(key) {
							loopChildrenVisibility(itemMaster.items[key], e, map, loopChildrenVisibility);
					});
				}
				else{
					gisLegend.setLayerVisibility(map, itemMaster.id, e);
				}
			};

			vm = new toolbarlegendViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
