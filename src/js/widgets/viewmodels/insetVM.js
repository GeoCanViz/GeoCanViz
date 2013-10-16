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
		'jqueryslide'
	], function($, ko, jqslide) {
		var initialize;
		
		initialize = function($mapElem, mapid) {

			// data model				
			var insetViewModel = function($mapElem, mapid) {
				var _self = this,
					mymap = mapArray[mapid][0];
				
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
							        // [boolean] Generate the play and stop buttons.
							        // You cannot use your own buttons. Sorry.
							      effect: "slide",
							        // [string] Can be either "slide" or "fade".
							      interval: 5000,
							        // [number] Time spent on each slide in milliseconds.
							      auto: true,
							        // [boolean] Start playing the slideshow on load.
							      swap: true,
							        // [boolean] show/hide stop and play buttons
							      pauseOnHover: false,
							        // [boolean] pause a playing slideshow on hover
							      restartDelay: 2500
							        // [number] restart delay on inactive slideshow
							    }
		      				});
						}
					} else if (type === 'video') {
						length = $mapElem.vSource.length;
						
						// set src path
						_self.vid = [];
						
						while (length--) {
							var lengthSrc = $mapElem.vSource[length].length;
							
							while (lengthSrc--) {
								if ($mapElem.vSource[length][lengthSrc].location === 'internet') {
								_self.vid[length] = $mapElem.vSource[length][lengthSrc].url;
								}
								else {
									_self.vid[length] = locationPath + $mapElem.vSource[length][lengthSrc].url;
								}
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
