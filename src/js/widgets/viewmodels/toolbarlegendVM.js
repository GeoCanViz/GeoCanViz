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
			addLegend,
			removeLegend,
			getLegendParam,
			getURL,
			innerAddLegend,
			innerRemoveLegend,
			innerGetLegendParam,
			loopGetURL,
			loopChildrenVisibility,
			vm = [];

		initialize = function($mapElem, mapid, config) {

			// data model
			var toolbarlegendViewModel = function($mapElem, mapid, config) {
				var _self = this;

				// get map reference
				_self.mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// basemap and theme group title
				_self.base = i18n.getDict('%toolbarlegend-base');
				_self.theme = i18n.getDict('%toolbarlegend-theme');

				_self.init = function() {
					var idmap, legend, lenLegend, legendParams,
						basemaps = config.basemaps,
						layers = config.items,
						combLayers = basemaps.concat(layers);

					// for wich map
					idmap = gcvizFunc.getURLParameter(window.location.toString(), 'id');

					// check if there is a url to load
					// leged param can be like this:
					// legend=9b8bed21-127f-5f51-d75d-2dfdfd0c628a,1,0,0.55;
					// first the id, the expand state, the visibiity state and the opacity value
					legend = gcvizFunc.getURLParameter(window.location.toString(), 'legend');

					if (legend !== null && idmap === mapid) {
						// update config file from legend parameters
						legendParams = legend.split(';');
						lenLegend = legendParams.length;

						while (lenLegend--) {
							_self.updateConfig(legendParams[lenLegend], combLayers);
						}
					}

					_self.layersArray = ko.observableArray(layers);
					_self.basesArray = ko.observableArray(basemaps);

					// concat all layers to access in determineTextCSS
					_self.allLayers = _self.layersArray().concat(_self.basesArray());

					// subscribe to fullscreen so we cant change the max height
					gcvizFunc.subscribeTo(_self.mapid, 'header', 'isFullscreen', _self.setHeight);

					// set max height for legend container (related to menu max height)
					_self.setHeight();

					// set initial visibility state
					setTimeout(function() {
						_self.changeItemsVisibility();
					}, 1000);
					return { controlsDescendantBindings: true };
				};

				_self.updateConfig = function(item, layers) {
					var layer,
						lenLayers = layers.length,
						params = item.split(',');

					while (lenLayers--) {
						layer = layers[lenLayers];

						if (params[0] === layer.graphid) {
							layer.expand = params[1] === '1' ? true : false;
							layer.visibility.initstate = params[2] === '1' ? true : false;
							layer.opacity.initstate = parseFloat(params[3], 10);
						} else if (layer.items.length > 0) {
							_self.updateConfig(item, layer.items);
						}
					}
				};

				_self.setHeight = function() {
					setTimeout(function() {
						var tb, height;

						// find the maximum height for legend content
						// (max container height - nb of toolbar + 1 for menu - the bottom spaces and margin)
						tb = (($viz('.gcviz-tbcontent').length + 2) * 37) + 25;
						height = parseInt($viz('.gcviz-toolsholder').css('max-height'), 10) - tb;
						$viz('.gcviz-tbcontent-leg').css('max-height', height + 'px');
					}, 1000);
				};

				// determine which CSS class to use on an item on load
				_self.determineCSS = function(parentItem, liItem) {
					// Determine if this is the last child
					if (liItem.last === true) {
						if ((liItem.displaychild.enable || liItem.customimage.enable) && liItem.expand) {
							return 'gcviz-leg-imgliopen';
						} else {
							return 'gcviz-leg-imgli';
						}
					// else, we have something in the middle or at the top
					} else {
						if (liItem.expand) {
							return 'gcviz-leg-imgliopen';
						} else {
							return 'gcviz-leg-imgli';
						}
					}
				};

				_self.determineTextCSS = function(item) {
					var layer,
						graphId = item.graphid,
						className = 'gcviz-leg-span',
						len = _self.allLayers.length,
						count = 0;

					// loop trought layers to find a match
					while (len--) {
						layer = _self.allLayers[len];

						if (graphId === layer.graphid) {
							count = 1;
						}
					}

					count = (count === 0) ? 2 : 1;

					// if it is a custom layer added by the user, specify class
					if (graphId !== 'custom') {
						className += count;
					} else {
						className = 'gcviz-leg-custom';
					}

					return className;
				};

				_self.createSymbol = function(data, node) {
					var child = data.displaychild;

					if (child.enable && typeof child.symbol !== 'undefined') {
						gisLegend.getFeatureLayerSymbol(child.symbol, node, data.graphid);
					}

					// to close the symbol if not expanded
					if (!data.expand) {
						$viz(node).toggle();
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
					var opa = parseFloat(opacityValue.toFixed(2), 10);

					// set opacity
					gisLegend.setLayerOpacity(_self.mymap, layerid, opacityValue);

					// set value in layers array to retrieve to save legend
					_self.assignOpacityValue(_self.allLayers, layerid, opa);
				};

				_self.toggleViewService = function(selectedLayer, event) {
					var keyCode = 32,
						evtTarget = $viz(event.target),
						evtTargetLi = evtTarget.parent().parent(),
						className = evtTarget[0].className;

					// we use keyup instead of keypress because FireFox wont work with keypress
					if (event.type !== 'keyup' || (event.type === 'keyup' && event.keyCode === keyCode)) {
						if (className === 'gcviz-leg-imgli') {
							evtTarget.removeClass('gcviz-leg-imgli');
							evtTarget.addClass('gcviz-leg-imgliopen');

							// set value in layers array to retrieve to save legend
							selectedLayer.expand = true;
						} else if (className === 'gcviz-leg-imgliopen') {
							evtTarget.removeClass('gcviz-leg-imgliopen');
							evtTarget.addClass('gcviz-leg-imgli');

							// set value in layers array to retrieve to save legend
							selectedLayer.expand = false;
						}
						evtTargetLi.children('div#childItems.gcviz-legendHolderDiv').toggle();
						evtTargetLi.children('.gcviz-legendSymbolDiv').toggle();
						evtTargetLi.children('div#customImage.gcviz-legendHolderImgDiv').toggle();
						event.stopPropagation(); // prevent toggling of inner nested lists
					}
				};

				_self.assignOpacityValue = function(layers, id, value) {
					var layer,
						len = layers.length;

					while (len--) {
						layer = layers[len];

						// loop trought inner items to set the value
						if (layer.items.length > 0) {
							_self.assignOpacityValue(layer.items, id, value);
						}

						if (layer.id === id) {
							layer.opacity.initstate = parseFloat(value, 10);
						} else {
							
						}
					}			
				};

				innerAddLegend = function(config) {
					_self.layersArray.push(config);

					// concat all layers to access in determineTextCSS
					_self.allLayers = _self.layersArray().concat(_self.basesArray());
				};

				innerRemoveLegend = function(id) {
					_self.layersArray.remove(function(layer) {
						return layer.id == id;
					});

					// concat all layers to access in determineTextCSS
					_self.allLayers = _self.layersArray().concat(_self.basesArray());
				};

				innerGetLegendParam = function(id) {
					return gisLegend.getLayerParam(_self.mymap, id);
				};

				_self.getURL = function() {
					var layer,
						returnURL = [],
						layers = _self.allLayers,
						len = layers.length;

					while (len--) {
						layer = layers[len];
						returnURL = loopGetURL(_self.mymap, [layer], returnURL, loopGetURL);
					}

					// join the array and add legend type
					if (returnURL.length > 0) {
						returnURL = '&legend=' + returnURL.join(';');
					} else {
						returnURL = '';
					}

					return returnURL;
				};

				loopGetURL = function(map, items, url) {
					var layer, graphid,
						isCheck, opa, vis, exp,
						layers = items,
						len = layers.length;

					while (len--) {
						layer = layers[len];
						graphid = layer.graphid;

						// get the checkbox/radio button state
						isCheck = $mapElem.find('#checkbox' + layer.id + mapid).prop('checked');

						if (graphid !== 'custom') {
							// first the graphid, the expand state, the visibiity state, the opacity value
							exp = layer.expand ? 1 : 0;
							vis = isCheck ? 1 : 0;
							opa = layer.opacity.initstate;
							url.push(layer.graphid + ',' + exp + ',' + vis  + ',' + opa);

							// if not the last item, loop trought children to get all layers
							if (!layer.last) {
								url = loopGetURL(map, layer.items, url, loopGetURL);
							}
						}
					}

					return url;
				};

				_self.init();
			};

			loopChildrenVisibility = function(map, itemMaster, isCheck) {
				var items = itemMaster.items;

				// if value is false, set isCheck to false for all children because if parent
				// is not visible, children should not be visible either
				if (!itemMaster.visibility.initstate) {
					isCheck = false;
				}

				// if there is children, loop in them. otherwise, it is the last item, apply value.	
				if (items.length > 0) {
					Object.keys(items).forEach(function(key) {
						loopChildrenVisibility(map, items[key], isCheck, loopChildrenVisibility);
					});
				}
				else {
					gisLegend.setLayerVisibility(map, itemMaster.id, isCheck);
				}
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new toolbarlegendViewModel($mapElem, mapid, config);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		addLegend = function(config) {
			// TODO: redo
			//innerAddLegend(config);
		};

		removeLegend = function(id) {
			// TODO: redo
			//innerRemoveLegend(id);
		};

		getLegendParam = function(id) {
			return innerGetLegendParam(id);
		};

		getURL = function(mapid) {
			var url = '',
				viewModel = vm[mapid];

			// link to view model to call the function inside
			if (typeof viewModel !== 'undefined') {
				url = viewModel.getURL();
			}

			return url;
		};
		
		return {
			initialize: initialize,
			addLegend: addLegend,
			removeLegend: removeLegend,
			getLegendParam: getLegendParam,
			getURL: getURL
		};
	});
}).call(this);
