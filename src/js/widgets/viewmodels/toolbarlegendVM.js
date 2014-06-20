/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Legend view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gislegend',
			'gcviz-ko'
	], function($viz, ko, i18n, gcvizFunc, gisLegend) {
		var initialize,
			loopChildrenVisibility,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model
			var toolbarlegendViewModel = function($mapElem, mapid, config) {
				var _self = this;
				_self.mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// tooltips
				_self.tpVisible = i18n.getDict('%toolbarlegend-tgvis');

				_self.init = function() {
					_self.layersArray = ko.observableArray(config.items);
					_self.basesArray = ko.observableArray(config.basemaps);

					// set initial visibility state
					setTimeout(function() {
						_self.changeItemsVisibility();
					}, 1000);
					return { controlsDescendantBindings: true };
				};

				// determine which CSS class to use on an item
				_self.determineCSS = function(parentItem, liItem) {
					// Determine if we have a top level item
					if (parentItem.mymap !== undefined) {
							if (liItem.expand) {
								return 'gcviz-legendLiLayerOpen';
							} else {
								return 'gcviz-legendLiLayer';
							}
					// Determine if this is the last child
					} else if (liItem.last === true) {
						if (liItem.displaychild.enable) {
							return 'gcviz-legendLiLayerOpen';
						} else {
							return 'gcviz-legendLiLayer';
						}
					// Else, we have something in the middle
					} else {
						if (liItem.expand) {
							return 'gcviz-legendLiLayerOpen';
						} else {
							return 'gcviz-legendLiLayer';
						}
					}
				};

				// needs this function because the a tag inside li tag doesn't work.
				_self.openMetadata = function(node) {
					var href = node.href;

					if (href !== '') {
						window.open(href, '_blank');
					}
				};

				_self.createSymbol = function(data, node) {
					if (data.displaychild.enable && typeof data.displaychild.symbol !== 'undefined') {
						gisLegend.getFeatureLayerSymbol(data.displaychild.symbol, node, data.graphid);
					}
				};

				_self.changeItemsVisibility = function(selectedItem, event) {
					var item,
						lenBases = _self.basesArray().length,
						lenLayers = _self.layersArray().length;

					// loop trought items (we use event when the check box is clicked) event is
					// undefined at initialization
					if (typeof event !== 'undefined') {
						selectedItem.visibility.initstate = event.target.checked;
					}

					// always loop trought all the layers. If we just do child of event trigger,
					// it could show a layer even if parent visibility is false
					while (lenBases--) {
						item = _self.basesArray()[lenBases];
						loopChildrenVisibility(_self.mymap, item, item.visibility.initstate, loopChildrenVisibility);
					}
					while (lenLayers--) {
						item = _self.layersArray()[lenLayers];
						loopChildrenVisibility(_self.mymap, item, item.visibility.initstate, loopChildrenVisibility);
					}

					// Knockout doesn't prevent the default click action.
					return true;
				};

				_self.switchRadioButtonVisibility = function(map, selectedItem, value) {
					selectedItem.visibility.initstate = value;
					gisLegend.setLayerVisibility(map, selectedItem.id, value);

					// call changeItemsVisibility that will loop trought the legend
					// because if we change radio button layer and parent layer is of,
					// the radio layer appears.
					_self.changeItemsVisibility();
				};

				_self.changeServiceOpacity = function(layerid, opacityValue) {
					gisLegend.setLayerOpacity(_self.mymap, layerid, opacityValue);
				};

				_self.toggleViewService = function(selectedLayer, event) {
					var evtTarget = $viz(event.target);
					if (evtTarget[0].className === 'gcviz-legendLiLayer') {
						evtTarget.removeClass('gcviz-legendLiLayer');
						evtTarget.addClass('gcviz-legendLiLayerOpen');
					} else {
						evtTarget.removeClass('gcviz-legendLiLayerOpen');
						evtTarget.addClass('gcviz-legendLiLayer');
					}
					evtTarget.children('div#childItems.gcviz-legendHolderDiv').toggle();
					evtTarget.children('.gcviz-legendSymbolDiv').toggle();
					evtTarget.children('div#customImage.gcviz-legendHolderImgDiv').toggle();
					event.stopPropagation(); // prevent toggling of inner nested lists
				};

				_self.init();
			};

			loopChildrenVisibility = function(map, itemMaster, isCheck) {
				var items = itemMaster.items;

				// if value is false, set isCheck to false for all children
				if (!itemMaster.visibility.initstate) {
					isCheck = false;
				}

				if (items.length > 0) {
					Object.keys(items).forEach(function(key) {
						loopChildrenVisibility(map, items[key], isCheck, loopChildrenVisibility);
					});
				}
				else {
					gisLegend.setLayerVisibility(map, itemMaster.id, isCheck);
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
