/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
var mapArray = {},
	vmArray = {},
	locationPath,
	tbHeight;
(function() {
	'use strict';
	var mapsTotal,
		mapsNum;

	// there is a conflict between jQuery in gcviz and in WET. For this reason, we define jquery only when a dependency needs it like in inset.
	define(['gcviz-i18n',
			'gcviz-func',
			'gcviz-v-map',
			'gcviz-v-inset',
			'gcviz-v-tbmain',
			'gcviz-v-tbfoot',
			'gcviz-v-tbanno',
			'gcviz-v-tbnav'], function(i18n, func, map, inset, toolbarmain, toolbarfoot, toolbaranno, toolbarnav) {
		var initialize,
			readConfig,
			execConfig,
			setLocationPath,
			setLocalMP;

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
			
			// set location path
			setLocationPath();
			
			// set local for magnificpopup plugin
			setLocalMP();

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
				crossDomain: true,
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
			$mapElem.wrap('<section id=section' + mapid + ' class="gcviz-section" role="map" style="width:' + size.width + 'px; height:' + size.height + 'px;">');
			$mapSection = $(document).find('#section' + mapid);
			
			// extend the section with configuration file info
			$.extend($mapSection, config);

			// create map and add layers (save result in the mapArray)
			mapArray[mapid] = map.initialize($mapSection);
			mapArray[mapid].reverse();
			
			// add main toolbar and footer
			vmArray[mapid] = {};
			vmArray[mapid].tbmain = toolbarmain.initialize($mapSection);
			vmArray[mapid].tbfoot = toolbarfoot.initialize($mapSection);
			
			// add annotation toolbar
			if (config.toolbaranno.enable) {
				toolbaranno.initialize($mapSection);
			}
			
			// add navigation toolbar
			if (config.toolbarnav.enable) {
				toolbarnav.initialize($mapSection);
			}
			
			// add inset
			if (config.insetframe.enable) {
				vmArray[mapid].insets = inset.initialize($mapSection);
			}
					
			mapsNum += 1;
			
			if (mapsNum === mapsTotal) {
				// if all maps are there, trigger the ready event
				$.event.trigger('gcviz-ready');
				
				// set the resize event
				window.onresize = func.debounce(function (evt) {

				}, 500, false);
			}
		};
		
		setLocationPath = function() {
			// get code location from meta tag
			var metas = document.getElementsByTagName('meta'),
			i = metas.length; 
		
			while(i--) {
				if (metas[i].getAttribute('property') === 'location') { 
					locationPath = metas[i].getAttribute('content'); 
				} 
			} 
		
			// if location path is not set in html set by default at GeoCanViz
			if (typeof locationPath === 'undefined') {
				var url = window.location.toString(),
					starGeo = url.search('GeoCanViz');
				if (starGeo !== -1) {
					locationPath = url.substring(0, url.search('GeoCanViz')) + 'GeoCanViz/';
				}
			}
		};
		
		setLocalMP = function() {
			$.extend(true, $.magnificPopup.defaults, {
				tClose: i18n.getDict('%mp-close'), // Alt text on close button
				tLoading: i18n.getDict('%mp-load'), // Text that is displayed during loading. Can contain %curr% and %total% keys
				gallery: {
					tPrev: i18n.getDict('%mp-prev'), // Alt text on left arrow
					tNext: i18n.getDict('%mp-next'), // Alt text on right arrow
					tCounter: i18n.getDict('%mp-count') // Markup for "1 of 7" counter
				},
				image: {
					tError: i18n.getDict('%mp-error') // Error message when image could not be loaded
				},
			});
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);