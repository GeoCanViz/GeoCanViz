/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * hold custom Knockout binding
 */
/* global vmArray: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'dijit/form/HorizontalSlider'
	], function($, ko, slider) {
    
    ko.bindingHandlers.tooltip = {
		init: function(element, valueAccessor) {
			var local = ko.utils.unwrapObservable(valueAccessor()),
				options = {};
					
			ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
			ko.utils.extend(options, local);
				
			$(element).attr('title', options.content);
			$(element).tooltip(options);
					
			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$(element).tooltip('destroy');
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
				};
				
				return true;
			});
		}         
	};

	ko.bindingHandlers.HorizontalSliderDijit = {
    	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				widget;

			$(element).attr('Visible', options.visible);
			widget = new slider({
				name: "slider",
				minimum: 0,
				maximum: options.max,
				intermediateChanges: true,
				value:options.max
			}).placeAt(element);

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

	});
}).call(this);