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
		'knockout'
	], function($, ko) {
    
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
				vm = vmArray[mapid].tbmain;
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
				vm = vmArray[mapid].tbmain;
			vm.isInsetVisible.subscribe(manageInsetVisibility);
			
			function manageInsetVisibility(visible) {
					viewModel.setVisibility(visible);
			}
		}
	};

	ko.bindingHandlers.enterkey = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var allBindings = allBindingsAccessor(),
				keyCode, target;
			$(element).on('keypress', function (e) {
				keyCode = e.which || e.keyCode;
				if (keyCode !== 13 && keyCode !== 32) {
					return true;
				}
				
				target = e.target;
				target.blur();
				allBindings.enterkey.call(viewModel, viewModel, target, element);
				return false;
			});
		}
	};

	});
}).call(this);