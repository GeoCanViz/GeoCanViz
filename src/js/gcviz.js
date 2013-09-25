/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
var mapArray = {},
	locationPath;
(function() {
	'use strict';
	var mapsTotal,
		mapsNum;

	define(['jquery',
			'gcviz-v-map',
			'gcviz-v-tbmain',
			'gcviz-v-tbfoot',
			'gcviz-v-tbanno',
			'gcviz-v-tbnav'], function($, map, toolbarmain, toolbarfoot, toolbaranno, toolbarnav) {
		var initialize,
			readConfig,
			execConfig;

		/*
		 *  initialize the GCViz application
		 */
		initialize = function() {
			var maps = $('.gcviz'),
				mapElem,
				len = maps.length;
			
			// initialize map number and total for the ready event
			mapsTotal = len;
			mapsNum = 0;	
			
			// get code location from meta tag
			var metas = document.getElementsByTagName('meta'),
				i = metas.length; 
		
			while(i--) { 
				if (metas[i].getAttribute('property') === 'location') { 
					locationPath = metas[i].getAttribute('content'); 
				} 
			} 

			// loop trought maps
			while (len--) {
				mapElem = maps[len];
				
				// read configuration file
				readConfig(mapElem);
			}	
		};
		
		/*
		 *  read configuration file and start execution
		 */
		readConfig = function(mapElem) {
			
			// ajax call to get the config file info
			$.ajax({
				url: mapElem.getAttribute('data-gcviz'),
				dataType: 'json',
				async: false,					
				success: function(config) {
					// add the id of map container and execute the configuration
					config.gcviz.mapframe.id = mapElem.getAttribute('id');
					execConfig(mapElem, config.gcviz);
					console.log('config file read');
				},
				error: function() {
					console.log('error loading config file');
				}
			}); // end ajax
		};
		
		/*
		 *  execute the configuration file
		 */
		execConfig = function(mapElem, config) {
			var $mapSection,
				$mapElem = $(mapElem),
				mapid = config.mapframe.id,
				size = config.mapframe.size;
			
			// create section around map. This way we can bind Knockout to the section
			$mapElem.wrap('<section id=section' + mapid + ' class="gcviz-section" style="width: ' + size.width + 'px; height: ' + size.height + 'px;">');
			$mapSection = $(document).find('#section' + mapid);
			
			// extend the section with configuration file info
			$.extend($mapSection, config);

			// create map and add layers (save result in the mapArray)
			mapArray[mapid] = map.initialize($mapSection);
			mapArray[mapid].reverse();
			
			// add main toolbar and footer
			toolbarmain.initialize($mapSection);
			toolbarfoot.initialize($mapSection);
			
			// add annotation toolbar
			if (config.toolbaranno.enable) {
				toolbaranno.initialize($mapSection);
			}
			
			// add navigation toolbar
			if (config.toolbarnav.enable) {
				toolbarnav.initialize($mapSection);
			}
			
			mapsNum += 1;
			
			// if all maps are there, trigger the ready event
			if (mapsNum === mapsTotal) {
				$.event.trigger('gcviz-ready');
			}
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);