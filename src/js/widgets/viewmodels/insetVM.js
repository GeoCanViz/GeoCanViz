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
		'magnificpopup',
		'gcviz-func',
		'gcviz-gismap'
	], function($, ko, binding, slidesjs, magnificPopup, gcvizfunc, gisM) {
		var initialize,
			vm,
			setImage,
			setVideo,
			setHtml,
			setMap,
			setLightbox;
					
		initialize = function($mapElem, mapid, inset) {
			
			// data model				
			var insetViewModel = function($mapElem, mapid, inset) {
				var _self = this,
					paths = [locationPath + 'gcviz/images/insetPrevious.png',
							locationPath + 'gcviz/images/insetNext.png',
							locationPath + 'gcviz/images/insetPlay.png',
							locationPath + 'gcviz/images/insetStop.png'];
				
				// keep inset position, size and type
				_self.bottom = parseInt($mapElem.css('bottom'), 10);
				_self.left = parseInt($mapElem.css('left'), 10);
				_self.height = parseInt($mapElem.css('height'), 10);
				_self.width = parseInt($mapElem.css('width'), 10);
				_self.size = inset.size;
				_self.type = inset.type;
					
				// inset state in fullscreen
				_self.fullscreen = inset.fullscreen;
				_self.VisibleState = true;
				_self.fullscreenState = false;
			
				// keep id
				_self.mapid = mapid;

				_self.init = function() {
					var type = _self.type;

					if (type === 'image') {
						setImage($mapElem, _self, paths);
					} else if (type === 'video') {
						setVideo($mapElem, _self);
					} else if (type === 'map') {
						_self.map = setMap($mapElem, inset);
					} else if (type === 'html') {
						setHtml($mapElem, inset);
					}

					return { controlsDescendantBindings: true };
				};

				_self.insetClick = function(data, event) {
					if (event.currentTarget.className !== 'gcviz-imginset-button' && event.currentTarget.className !== 'active') {
						$mapElem.find('a')[0].click();
					}
				};
				
				_self.setVisibility = function(visible) {
					var height,
						mymap = _self.map;
						
					if (visible) {
						$mapElem.removeClass('gcviz-hidden');
						_self.VisibleState = true;
						
						if (_self.type === 'map') {
							if (_self.fullscreenState) {
								height = _self.fullscreenHeight;
							} else {
								height = _self.height;
							}
							$mapElem.find('#' + $mapElem[0].id + 'm').css({ 'height': height - 20 });
							gisM.manageScreenState(_self.map);
						}
					} else {
						$mapElem.addClass('gcviz-hidden');
						_self.VisibleState = false;
					}
				};
				
				_self.enterFullscreen = function(mapWidth, mapHeight) {
					_self.fullscreenState = true;
					
					// check if inset can be open in full screen
					if (_self.fullscreen) {
						// get maximal height and width from browser window and original height and width for the map
						var param = gcvizfunc.getFullscreenParam(mapWidth, mapHeight),
							w = param.width,
							h = param.height,
							ratio = param.ratio,
							css = {},
							bottom = _self.bottom,
							left = _self.left,
							height = _self.height,
							width = _self.width,
							options;
							
						// check if px or %
						if (_self.size === '%') {
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
								ratio = (w / mapWidth);
								css.left = ((left + width) / mapWidth) * (w - width) + 'px';
							}
						}
						
						_self.fullscreenHeight = height * ratio;
						
						gcvizfunc.setStyle($mapElem[0], css);
						
						// resize map
						if (_self.type === 'map' && _self.VisibleState) {
							// if the inset is visible resize. If not wait until the inset is made visible
							// if resize is set to hidden element, it breaks the map.
							$mapElem.find('#' + $mapElem[0].id + 'm').css({ 'height': (height * ratio) - 20 });
							gisM.manageScreenState(_self.map);
						}
					} else {
						$mapElem.addClass('gcviz-inset-hidden');
					}
				};
				
				_self.exitFullscreen = function() {
					_self.fullscreenState = false;
					
					if (_self.fullscreen) {
						var options;
						
						gcvizfunc.setStyle($mapElem[0], { 'bottom': _self.bottom + 'px', 'left': _self.left + 'px' });
						
						// resize map
						if (_self.type === 'map' && _self.VisibleState) {	
							// if the inset is visible resize. If not wait until the inset is made visible
							// if resize is set to hidden element, it breaks the map.
							$mapElem.find('#' + $mapElem[0].id + 'm').css({ 'height': _self.height - 20 });
							gisM.manageScreenState(_self.map);
						}
					} else {
						$mapElem.removeClass('gcviz-inset-hidden');
					}
				};
				
				_self.init();
			};
			
			vm = new insetViewModel($mapElem, mapid, inset);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		setImage = function($elem, _self, paths) {
			var source = $elem.vSource,
				length = source.length,
				lbId,
				elems, elem, $el;
						
			// set src path
			_self.img = [];
						
			while (length--) {
				if (source[length].location === 'internet') {
					_self.img[length] = source[length].url;
				} else {
					_self.img[length] = locationPath + source[length].url;
				}
			}

			// init slides if more then 1 images
			if (source.length > 1) {
				lbId = '.slidesjs-container';
				$('#' + $elem.attr('id').replace('inset', 'slides')).slidesjs({
					height: _self.height - 50,
					width: _self.width,
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
						effect: 'slide',
						interval: 5000,
						auto: true,
						swap: true,
						pauseOnHover: false,
						restartDelay: 2500
					}
				});
			} else {
				lbId = '.' + $elem.attr('id');
			}
			
			// set lightbox
			setLightbox('image', $elem, null, lbId, null);
			
			// remove anchor from tabindex if not part of navigation. If part of navigation add tabindex and images
			elems = $elem.find('a');
			length = elems.length;
			while (length--) {
				elem = elems[length];
				$el = $(elem);
				if (!$el.hasClass('slidesjs-navigation')) {
					elem.tabIndex = -1;
				} else {
					elem.tabIndex = 1;
					elem.innerText = '';
					elem.innerHTML = '';
					$el.addClass('gcviz-inset-button');
					if ($el.hasClass('slidesjs-previous')) {
						$el.append('<img class="gcviz-imginset-button" src="' + paths[0] + '" />');
					} else if ($el.hasClass('slidesjs-next')) {
						$el.append('<img class="gcviz-imginset-button" src="' + paths[1] + '" />');
					} else if ($el.hasClass('slidesjs-play')) {
						$el.append('<img class="gcviz-imginset-button" src="' + paths[2] + '" />');
					} else if ($el.hasClass('slidesjs-stop')) {
						$el.append('<img class="gcviz-imginset-button" src="' + paths[3] + '" />');
					}
				}
			}
		};
		
		setVideo = function($elem, _self) {
			var source = $elem.vSource,
				length = source.length,
				id = '#' + $elem[0].id + 'v',
				$lb = $(id),
				func = { beforeOpen: function() { $lb.find('video').height((window.innerHeight * 0.8)); },
						close: null};

			// set src path
			_self.vid = [];
						
			while (length--) {
				if (source[length].location === 'internet') {
					_self.vid[length] = source[length].url;
				} else {
					_self.vid[length] = locationPath + source[length].url;
				}
			}
			
			// set lightbox
			setLightbox('inline', $elem, $lb, id, func);
		};
		
		setHtml = function($elem, inset) {
			var type = inset.inset.type,
				id = '#' + $elem[0].id + 'h',
				$lb = $(id),
				$iframe = $lb.find('iframe'),
				height = window.innerHeight * 0.8,
				width = window.innerWidth * 0.75,
				func = { beforeOpen: null, close: null };


			if (type === 'text') {
				// set lightbox
				setLightbox('inline', $elem, $lb, id, func);
			} else if (type === 'page') {
				// set lightbox
				func.beforeOpen = function() {																				
										$lb.height(height);
										$lb.width(width);
										$iframe.height(height);
										$iframe.width(width);

									};
				setLightbox('inline', $elem, $lb, id, func);
			}
		};
		
		setMap = function($elem, inset) {
			var configMap = inset.inset,
				lenLayers = configMap.layers.length,
				layers = configMap.layers,
				mymap,
				mapid = $elem[0].id + 'm',
				height = window.innerHeight * 0.8,
				point,
				id = '#' + mapid,
				$lb = $(id),
				initHeight;
						
			// create map	
			mymap = gisM.createInset(mapid, configMap);
						
			// add layers
			layers = layers.reverse();
			while (lenLayers--) {
				var layer = layers[lenLayers];
				gisM.addLayer(mymap, layer.type, layer.url);
			}

			// set lightbox
			$elem.find('.mp-link').magnificPopup({
				items: {
					src: id,
					type: 'inline'
				},
				callbacks: {
					beforeOpen: function() {
						initHeight = $elem.find(id).css('height');
						point = gisM.getMapCenter(mymap);
						$lb.addClass('mp-inset');
						$lb.height(height);
					},
					open: function() {
						gisM.resizeMap(mymap);
						var options = { point: point, interval: 700 };
						gisM.resizeCenterMap(mymap, options);
					},
					close: function() {
						$elem.find(id).css({ 'height': initHeight });
						var options = { interval: 700 };
						gisM.resizeCenterMap(mymap, options);
					},
					afterClose: function() {
						$lb.removeClass('mfp-hide');
						$lb.removeClass('mp-inset');
					}
				},
				key: 'map-key',
				mainClass: 'mfp-with-fade'
			});
			
			// get map center
			mymap.vMapCenter = gisM.getMapCenter(mymap);
			
			return mymap;
		};
		
		setLightbox = function(type, $elem, $lb, id, func) {
			
			if (type === 'inline') {
				$elem.find('.mp-link').magnificPopup({
					items: {
						src: id,
						type: 'inline'
					},
					callbacks: {
						beforeOpen: func.beforeOpen,
						open: function() {
							$lb.addClass('mp-inset');
						},
						close: func.close,
						afterClose: function() {
							$lb.removeClass('mfp-hide');
							$lb.removeClass('mp-inset');
							gcvizfunc.setStyle($lb[0], { 'width': 'auto', 'height': 'auto' });
						}
					},
					key: 'inline-key',
					mainClass: 'mfp-with-fade'
				});
			} else {
				$elem.find(id).magnificPopup({
					delegate: 'a',
					type: 'image',
					key: 'image-key',
					mainClass: 'mfp-with-fade',
					closeOnContentClick: true,
					gallery: {
						enabled: true
					}
				});
			}
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
