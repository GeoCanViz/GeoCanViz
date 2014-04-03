/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view model widget
 */
/* global vmArray: false */
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

				_self.init = function() {
					_self.theArray = ko.observableArray(config.items);
					return { controlsDescendantBindings: true };
				};

				_self.changeItemsVisibility = function(selectedItem, event) {
                    var evtTarget = $viz(event.target);
                    loopChildrenVisibility(selectedItem, evtTarget.prop('checked'), _self.mymap,
											evtTarget, loopChildrenVisibility
										);
					event.stopPropagation();
					return true;
				};

				_self.switchRadioButtonVisibility = function(map, id, value) {
					gisLegend.setLayerVisibility(map, id, value);
				};

				_self.changeServiceOpacity = function(map, layerid, opacityValue) {
					var layer = map.getLayer(layerid);
					layer.setOpacity(opacityValue);
				};

				_self.toggleViewService = function(selectedLayer, event) {

					var evtTarget = $viz(event.target);
					evtTarget.children('div#childItems.gcviz-legendHolderDiv').toggle();
					evtTarget.children('.gcviz-legendSymbolDiv').toggle();
					evtTarget.children('div#customImage.gcviz-legendHolderImgDiv').toggle();
					event.stopPropagation(); //prevent toggling of inner nested lists
				};

				_self.init();
			};

			var loopChildrenVisibility = function(itemMaster, e, map, evtTarget) {

				if (itemMaster.items.length > 0) {
					Object.keys(itemMaster.items).forEach(function(key) {
							loopChildrenVisibility(itemMaster.items[key], e, map,
								evtTarget, loopChildrenVisibility
							);
					});
				}
				else {
					//check if each checkbox is checked, only turn layers on if their checkbox is checked.
					var control = evtTarget.find('input#checkbox' + itemMaster.id + '.gcviz-legendCheck');
					if (control) {
						if ((control.context.checked && e === true) || e === false) {
							gisLegend.setLayerVisibility(map, itemMaster.id, e);
						}
					}
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
