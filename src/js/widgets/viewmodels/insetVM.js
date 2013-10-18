/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Inset view model widget
 */
/* global mapArray: false, locationPath: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'jqueryslide',
		'lightbox'
	], function($, ko, slidesjs, lightbox) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var insetViewModel = function($mapElem, mapid) {
				var _self = this;
				
				_self.errorHandler = function(error) {
					console.log('error inset view model: ', error);
				};
		
				_self.init = function() {
					var type = $mapElem.vType,
						length;
					
					if (type === 'image') {
						length = $mapElem.vSource.length;
						
						// set src path
						_self.img = [];
						
						while (length--) {
							if ($mapElem.vSource[length].location === 'internet') {
								_self.img[length] = $mapElem.vSource[length].url;
							}
							else {
								_self.img[length] = locationPath + $mapElem.vSource[length].url;
							}
						}
	
						// init slides if more then 1 images
						if ($mapElem.vSource.length > 1) {
							$('#' + $mapElem.attr('id').replace('inset', 'slides')).slidesjs({
								height: 80,
								width: 240,
								navigation: {
									effect: 'fade'
								},
								pagination: {
									effect: 'fade'
								},
								effect: {
									fade: {
										speed: 400
									}
								},
								play: {
									active: true,
									effect: "slide",
									interval: 5000,
									auto: true,
									swap: true,
									pauseOnHover: false,
									restartDelay: 2500
								}
							});
						}
					} else if (type === 'video') {
						length = $mapElem.vSource.length;
						
						// set src path
						_self.vid = [];
						
						while (length--) {
							if ($mapElem.vSource[length].location === 'internet') {
								_self.vid[length] = $mapElem.vSource[length].url;
							} else {
								_self.vid[length] = locationPath + $mapElem.vSource[length].url;
							}
						}
					}
					
					return { controlsDescendantBindings: true };
				};
				
				// // focus
				// _self.FirstName = ko.observable();
				// _self.FirstName.focused = ko.observable();
				// _self.FirstName.focused.subscribe(function(newValue) {
					// if (!newValue) {
						// //do validation logic here and set any validation observables as necessary
						// alert('focusout');
					// } else { alert('focusin');}
				// });
//
				// // handler for mouseover mouseout
				// ko.bindingHandlers.hoverToggle = {
					// update: function(element, valueAccessor) {
						// var css = valueAccessor();
//
				// ko.utils.registerEventHandler(element, "mouseover", function() {
						// //ko.utils.toggleDomNodeCssClass(element, ko.utils.unwrapObservable(css), true);
							// alert('in');
						// });  
//
				// ko.utils.registerEventHandler(element, "mouseout", function() {
							// alert('out');
							// //ko.utils.toggleDomNodeCssClass(element, ko.utils.unwrapObservable(css), false);
						// });   
						// } 
				// };
				
				_self.insetClick = function() {
					//alert('click');
				};
				
				_self.init();
			};
			ko.applyBindings(new insetViewModel($mapElem, mapid), $mapElem[0]); // This makes Knockout get to work
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
