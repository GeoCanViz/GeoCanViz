/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Inset view model widget
 */
/* global locationPath: false, tbHeight: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'gcviz-ko',
		'jqueryslide',
		'lightbox',
		'gcviz-func'
	], function($, ko, binding, slidesjs, lightbox, func) {
		var initialize,
			vm;
					
		initialize = function($mapElem, mapid, inset) {

			// data model				
			var insetViewModel = function($mapElem, mapid) {
				var _self = this;
					_self.mapid = mapid;
				
				_self.init = function() {
					var type = $mapElem.vType,
						pathPrevious = locationPath + 'gcviz/images/insetPrevious.png',
						pathNext = locationPath + 'gcviz/images/insetNext.png',
						pathPlay = locationPath + 'gcviz/images/insetPlay.png',
						pathStop = locationPath + 'gcviz/images/insetStop.png',
						length,
						elems, elem, $elem;
						
					// keep inset position
					_self.bottom = parseInt($mapElem.css('bottom'), 10);
					_self.left = parseInt($mapElem.css('left'), 10);
					_self.height = parseInt($mapElem.css('height'), 10);
					_self.width = parseInt($mapElem.css('width'), 10);
					_self.type = inset.size;
					
					// inset state in fullscreen
					_self.fullscreen = inset.fullscreen;
					_self.state = 1;
					
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
					
					// remove anchor from tabindex if not part of navigation. If part of navigation add tabindex and images
					elems = $mapElem.find('a');
					length = elems.length;
					while (length--) {
						elem = elems[length];
						$elem = $(elem);
						if (!$elem.hasClass('slidesjs-navigation')) {
							elem.tabIndex = -1;
						} else {
							elem.tabIndex = 1;
							elem.innerText = '';
							elem.innerHTML = '';
							$elem.addClass('gcviz-inset-button');
							if ($elem.hasClass('slidesjs-previous')) {
								$elem.append('<img class="gcviz-imginset-button" src="' + pathPrevious + '" />');
							} else if ($elem.hasClass('slidesjs-next')) {
								$elem.append('<img class="gcviz-imginset-button" src="' + pathNext + '" />');
							} else if ($elem.hasClass('slidesjs-play')) {
								$elem.append('<img class="gcviz-imginset-button" src="' + pathPlay + '" />');
							} else if ($elem.hasClass('slidesjs-stop')) {
								$elem.append('<img class="gcviz-imginset-button" src="' + pathStop + '" />');
							}
						}
					}
					
					return { controlsDescendantBindings: true };
				};
				
				_self.insetClick = function() {
					$mapElem.find('a')[0].click();
				};
				
				_self.enterFullscreen = function(mapWidth, mapHeight) {
					// check if inset can be open in full screen
					if (_self.fullscreen) {
						// get maximal height and width from browser window and original height and width for the map
						var param = func.getFullscreenParam(mapWidth, mapHeight),
							w = param.width,
							h = param.height,
							ratio = param.ratio,
							css = {},
							bottom = _self.bottom,
							left = _self.left,
							height = _self.height,
							width = _self.width;
							
						// check if px or %
						if (_self.type === '%') {
							if (bottom !== tbHeight) {
								css.bottom  = ((bottom * ratio) + ((tbHeight * ratio) - tbHeight)) + 'px';
							}
							if (left !== 0) {
								css.left = (left * ratio) + 'px';
							}
						} else {
							if (bottom !== tbHeight) {
								ratio = (h / mapHeight);
								css.bottom = ((bottom + height + tbHeight) / mapHeight) * (h - tbHeight - height) + 'px';
							}
							if (left !== 0) {
								ratio = (w/mapWidth);
								css.left = ((left + width) / mapWidth) * (w - width) + 'px';
							}
						}
						
						func.setStyle($mapElem[0], css);
					} else {
						$mapElem.addClass('gcviz-inset-hidden');
					}
				};
				
				_self.exitFullscreen = function() {
					if (_self.fullscreen) {
						func.setStyle($mapElem[0], {'bottom': _self.bottom + 'px', 'left': _self.left + 'px'});
					} else {
						$mapElem.removeClass('gcviz-inset-hidden');
					}
				};
				
				_self.init();
			};
			
			vm = new insetViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
