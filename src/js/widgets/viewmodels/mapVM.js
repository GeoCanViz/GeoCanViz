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
		'knockout',
		'gcviz-gismap'
	], function(ko, gisM) {
		var initialize;

		initialize = function($mapElem) {
			var map;

			// data model				
			var mapViewModel = function($mapElem) {
				var _self = this,
					mapframe = $mapElem.mapframe,
					mapid = mapframe.id,
					config = mapframe.map;
		
				_self.init = function() {
					var layers = config.layers,
						lenLayers = layers.length,
						$map = $('#' + mapid + '_holder'),
						$root,
						$container;
						
					// create map	
					map = gisM.createMap(mapid + '_holder', config, mapframe.extent);
						
					// add layers
					layers = layers.reverse();
					while (lenLayers--) {
						var layer = layers[lenLayers];
						gisM.addLayer(map, layer.type, layer.url);
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
					
					// set class and remove cursor for container
					$root = $('#' + mapid + '_holder_root');
					$container = $('#' + mapid + '_holder_container');
					$map.addClass('gcviz-map');
					$root.addClass('gcviz-root');
					$container.addClass('gcviz-container');
						
					_self.focus();

					return { controlsDescendantBindings: true };
				};

				_self.focus = function() {
					// focus
					_self.mapfocus = ko.observable();
					_self.mapfocus.focused = ko.observable();
					_self.mapfocus.focused.subscribe(function(newValue) {
						if (!newValue) {
							var test = 'test';
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
