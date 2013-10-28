/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * hold custom Knockout binding
 */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
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
					delay: 250
				},
				position: {
					my: 'right+30 top+5'
				},
				tooltipClass: 'gcviz-tooltip',
				trigger: 'hover, focus'
			}
		};
		
		
		ko.bindingHandlers.disfullscreen = {
			init: function(element, valueAccessor) {
			}
		};
		
	});
}).call(this);