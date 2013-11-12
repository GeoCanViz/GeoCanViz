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
	], function($, ko, binding, slidesjs, magnificPopup, func, gisM) {
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
				var _self = this;
				_self.mapid = mapid;
				
				_self.init = function() {
					var type = inset.type,
						paths = [locationPath + 'gcviz/images/insetPrevious.png',
								locationPath + 'gcviz/images/insetNext.png',
								locationPath + 'gcviz/images/insetPlay.png',
								locationPath + 'gcviz/images/insetStop.png'];
						
					// keep inset position
					_self.bottom = parseInt($mapElem.css('bottom'), 10);
					_self.left = parseInt($mapElem.css('left'), 10);
					_self.height = parseInt($mapElem.css('height'), 10);
					_self.width = parseInt($mapElem.css('width'), 10);
					_self.size = inset.size;
					
					// inset state in fullscreen
					_self.fullscreen = inset.fullscreen;
					_self.state = 1;

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
				
				_self.insetClick = function() {
					if (event.srcElement.className !== 'gcviz-imginset-button' && event.srcElement.className !== 'active') {
						$mapElem.find('a')[0].click();
					}
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
								ratio = (w/mapWidth);
								css.left = ((left + width) / mapWidth) * (w - width) + 'px';
							}
						}
						
						func.setStyle($mapElem[0], css);
						
						// resize map
						if (typeof _self.map !== 'undefined') { 
							_self.map.resize();
						}
					} else {
						$mapElem.addClass('gcviz-inset-hidden');
					}
				};
				
				_self.exitFullscreen = function() {
					if (_self.fullscreen) {
						func.setStyle($mapElem[0], {'bottom': _self.bottom + 'px', 'left': _self.left + 'px'});
						
						// resize map
						if (typeof _self.map !== 'undefined') { 
							_self.map.resize();
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
				func = { beforeOpen: function() { $lb.find('video').height((window.innerHeight * 0.8));},
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
				func = { beforeOpen: null, close: null};

			if (type === 'text') {
				// set lightbox
				setLightbox('inline', $elem, $lb, id, func);
			} else if (type === 'page') {
				// set lightbox
				func.beforeOpen = function() {
										$lb.height((window.innerHeight * 0.8));
										$lb.width((window.innerWidth * 0.75));
										$lb.find('iframe').height((window.innerHeight * 0.8));
										$lb.find('iframe').width((window.innerWidth * 0.75));
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
				id = '#' + mapid,
				$lb = $(id),
				func = { beforeOpen: function() {
										$lb.addClass('mp-inset');
										$lb.height((window.innerHeight * 0.8));
										mymap.resize();}, 
						close: function() { mymap.resize(); }
						};
						
			// create map	
			mymap = gisM.createMap(mapid, configMap);
						
			// add layers
			layers = layers.reverse();
			while (lenLayers--) {
				var layer = layers[lenLayers];
				gisM.addLayer(mymap, layer.type, layer.url);
			}
				
			// set lightbox	
			setLightbox('inline', $elem, $lb, id, func);
			
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
							func.setStyle($lb, { width: 'auto', height: 'auto' });
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
						enabled: true,
					}
				});
			}
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
