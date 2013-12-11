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
			'gcviz-ko',
			'esri/request'
	], function($viz, ko, i18n, gisLegend, Request, binding) {
		var initialize,
			vm, 
			getServiceList, 
			getLayerList;
		
		initialize = function($mapElem, mapid, config) {
			
			//data model
			var toolbarlegendViewModel = function($mapElem, mapid, config) {
				var _self = this;
				_self.mymap = vmArray[mapid].map.map;
				
				//tooltips
				_self.tpVisible = i18n.getDict('%toolbarlegend-tgvis');
		
				_self.init = function () {
					$viz.each(config.service, function(index, service) {
						$viz.each(service.layers, function(index2, layers) {
							//if(layers.id !=='basemap')
							//	gisLegend.getFeatureLayerSymbol(mymap, layers.id);
						});
					});

					_self.theArray = ko.observableArray(config.service);
				
					return { controlsDescendantBindings: true };
				};

			
				_self.changeLayerVisibility = function(selectedLayer, event) {
					gisLegend.setLayerVisibility(_self.mymap, selectedLayer.id, $viz(event.target).prop('checked'));
					return true;
				};

				_self.changeServiceVisibility = function(selectedLayer, event) {
					$viz.each($viz(event.target).siblings().find(':checkbox'), function(key, obj) {
						$viz(obj).prop('checked', event.target.checked);
							gisLegend.setLayerVisibility(_self.mymap, obj.value, $viz(event.target).prop('checked'));
					});
					return true;
				};

				_self.changeServiceOpacity = function(map, layerid, opacityValue) {
					var layer = map.getLayer(layerid);
					layer.setOpacity(opacityValue);
				};
      	
				_self.init();
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
