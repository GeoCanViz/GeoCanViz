/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * hold custom Knockout binding
 */
/* global vmArray: false */
/* global dojo: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'dijit/form/HorizontalSlider',
			'jqueryui'
			], function($viz, ko, slider) {
    
    ko.bindingHandlers.tooltip = {
		init: function(element, valueAccessor) {
			var local = ko.utils.unwrapObservable(valueAccessor()),
				options = {},
				$element = $viz(element);
					
			ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
			ko.utils.extend(options, local);
				
			$element.attr('title', options.content);
			$element.tooltip(options);
					
			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$element.tooltip('destroy');
				});
			},
			options: {
				show: {
					effect: 'slideDown',
					delay: 2000
				},
				hide: {
					effect: 'slideUp',
					delay: 100
				},
				position: {
					my: 'right+30 top+5'
				},
				tooltipClass: 'gcviz-tooltip',
				trigger: 'hover, focus'
			}
	};
		
	ko.bindingHandlers.fullscreen = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var mapid = viewModel.mapid,
				vm = vmArray[mapid].header;
			vm.isFullscreen.subscribe(manageFullscreen);
			
			function manageFullscreen(fullscreen) {
				if (fullscreen) {
					viewModel.enterFullscreen(vm.widthSection, vm.heightSection);
				} else {
					viewModel.exitFullscreen();
				}
			}
		}
	};
	
	ko.bindingHandlers.insetVisibility = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var mapid = viewModel.mapid,
				vm = vmArray[mapid].header;
			vm.isInsetVisible.subscribe(manageInsetVisibility);
			
			function manageInsetVisibility(visible) {
				viewModel.setVisibility(visible);
			}
		}
	};

	ko.bindingHandlers.enterkey = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			// get function name to call from the binding
			var func = valueAccessor().func,
				keyType = valueAccessor().keyType;

			ko.utils.registerEventHandler(element, keyType, function(event) {
				if (viewModel[func](event.which, event.shiftKey, event.type)) {
					event.preventDefault();
					return false;
				}

				return true;
			});
		}         
	};

	ko.bindingHandlers.HorizontalSliderDijit = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				widget;

			$viz(element).attr('Visible', options.visible);
			widget = new slider({
				name: "slider",
                minimum: options.extent[0],
                maximum: options.extent[1],
                intermediateChanges: true,
                value: options.value,
                showButtons: false
			}).placeAt(element);
			
			dojo.addClass(widget.domNode, 'gcviz-legendSlider');

			widget.on('Change', function(e) {
				if (viewModel.layers) {
					Object.keys(viewModel.layers).forEach(function(key) {
						bindingContext.$parent.changeServiceOpacity(bindingContext.$parent.mymap,viewModel.layers[key].id, e);
					});
				} else {
					bindingContext.$parentContext.$parent.changeServiceOpacity(bindingContext.$parentContext.$parent.mymap,viewModel.id, e);
				}
			});
		}
	};

	ko.bindingHandlers.LegendServiceUL = {
		init: function(element, valueAccessor) {
			var options = valueAccessor(),
				$element = $viz(element);
			$element.parent().find('ul').toggle(options.expanded);
		}
	};

	ko.bindingHandlers.LegendLayersUL = {
		init: function(element, valueAccessor) {
			var options = valueAccessor(),
				$element = $viz(element);
			if(options.numLayers > 1){ //don't want arrow when only 1 layer, service will collapase it
				$element.children('div.gcviz-legendSymbolDiv').toggle(options.expanded);
			}
				
			
		}
	};

	});
}).call(this);