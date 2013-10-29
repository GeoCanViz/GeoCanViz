/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Map view model widget
 */
(function() {
	'use strict';
	define([
		'jquery',
		'dojo/dom',
		'dojo/dom-style',
		'knockout',
		'gcviz-gismap'
	], function($, dom, domStyle, ko, gisM) {
		var initialize;

		initialize = function($mapElem) {
			var map = [];

			// data model				
			var mapViewModel = function($mapElem) {
				var _self = this,
					config = $mapElem.mapframe,
					mymap;
		
				_self.init = function() {
					var len = config.map.length,
						mapid = $mapElem.mapframe.id;
					
					while (len--) {
						var configMap = config.map[len],
							lenLayers = configMap.layers.length,
							layers = configMap.layers,
							$map = $('#' + mapid + '_' + len),
							$root,
							$container;
						
						// create map	
						mymap = gisM.createMap(mapid + '_' + len, configMap);
						
						// add layers
						layers = layers.reverse();
						while (lenLayers--) {
							var layer = layers[lenLayers];
							gisM.addLayer(mymap, layer.type, layer.url);
						}
						
						// set events (mouseover mouseout focusin focusout)
						$map.on('mouseenter mouseleave focusin focusout', function(e) {
							var type = e.type;
							if (type === 'mouseenter' || type === 'focusin') {
								this.focus();
							} else if (type === 'mouseleave' || type === 'focusout') {
								this.blur();
							}
						});
						
						// resize the map on load to ensure everything is set corretcly. if we dont do this, every maps after
						// the first one are not set properly
						mymap.on('load', function(e) {
							e.map.resize();
							
							// enable navigation
							mymap.enableScrollWheelZoom();
							mymap.enableKeyboardNavigation();
							mymap.isZoomSlider = false;
						});
						
						// set class and remove cursor for container
						$root= $('#' + mapid + '_' + len + '_root');
						$container= $('#' + mapid + '_' + len + '_container');
						$map.addClass('gcviz-map');
						$root.addClass('gcviz-root');
						$container.addClass('gcviz-container');
						$container.css('cursor', '');
						
						_self.focus();
							
						map.push(mymap);
					}

					return { controlsDescendantBindings: true };
				};

				_self.focus = function() {
					// focus
					_self.mapfocus = ko.observable();
					_self.mapfocus.focused = ko.observable();
					_self.mapfocus.focused.subscribe(function(newValue) {
						if (!newValue) {
							// call link map
							//$map[0].fireEvent("on" + event.eventType, event);
						}
					});
				};
				
				_self.init();
			};
			ko.applyBindings(new mapViewModel($mapElem), $mapElem[0]); // This makes Knockout get to work
			
			return map;
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
