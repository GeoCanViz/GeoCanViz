/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
var vmArray = {},
	locationPath;
(function() {
	'use strict';
	var mapsTotal,
		mapsNum;

	define(['jquery-private',
			'magnificpopup',
			'jqueryui',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-v-map',
			'gcviz-v-inset',
			'gcviz-v-header',
			'gcviz-v-footer',
			'gcviz-v-tbdraw',
			'gcviz-v-tbnav',
			'gcviz-v-tblegend'], function($viz, mp, jqui, i18n, func, map, inset, header, footer, tbdraw, tbnav, tblegend) {
		var initialize,
			readConfig,
			execConfig,
			setLocationPath,
			setLocalMP;
			
		/*
		 *  initialize the GCViz application
		 */
		initialize = function() {
			var maps = $viz('.gcviz'),
				mapElem,
				len = maps.length;
			
			// extent or private AMD jQuery with the jQuery from outside project to get reference to some dependencies (magnificPopup, jqueryUI, slidesJS)
			// we need to do this because those libraries are not AMD and use the window.jQuery object to initialize themselves.
			$viz.extend(true, $viz, $);
			
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
			var file = mapElem.getAttribute('data-gcviz');
			
			// ajax call to get the config file info
			$viz.support.cors = true; // force cross-site scripting for IE9
			$viz.ajax({
				url: file,
				crossDomain: true,
				dataType: 'json',
				async: false,					
				success: function(config) {
					// add the id of map container and execute the configuration
					config.gcviz.mapframe.id = mapElem.getAttribute('id');
					execConfig(mapElem, config.gcviz);
					console.log(i18n.getDict('%msg-configread'));
				},
				error: function() {
					console.log(i18n.getDict('%msg-configerr')  + ': ' + file);
				}
			}); // end ajax
		};
		
		/*
		 *  execute the configuration file. add all viewmodel to a master view model. This viewmodel will be store in an array
		 *  of view models (one for each map)
		 */
		execConfig = function(mapElem, config) {
			var $mapSection,
				$mapElem = $viz(mapElem),
				mapframe = config.mapframe,
				mapid = mapframe.id,
				size = mapframe.size,
				customLen = config.customwidgets.length;
			
			// // create section around map. This way we can bind Knockout to the section
			$mapElem.wrap('<section id=section' + mapid + ' class="gcviz-section" role="map" style="width:' + size.width + 'px; height:' + size.height + 'px;">');
			$mapSection = $viz(document).find('#section' + mapid);
			
			// extend the section with configuration file info
			$viz.extend($mapSection, config);

			// create map and add layers
			// save the result of every view model in an array of view models
			vmArray[mapid] = {};
			vmArray[mapid].map = map.initialize($mapSection);
			
			// add header and footer
			vmArray[mapid].header = header.initialize($mapSection);
			vmArray[mapid].footer = footer.initialize($mapSection);
			
			// add draw toolbar
			if (config.toolbardraw.enable) {
				vmArray[mapid].draw = tbdraw.initialize($mapSection);
			}
			
			// add navigation toolbar
			if (config.toolbarnav.enable) {
				vmArray[mapid].nav = tbnav.initialize($mapSection);
			}
			
			//add legend
			if (config.toolbarlegend.enable) {
				vmArray[mapid].legend = tblegend.initialize($mapSection);
			}
			
			// add inset
			if (config.insetframe.enable) {
				vmArray[mapid].insets = inset.initialize($mapSection);
			}
			
			// add custom widgets
			//while (customLen--) {
			//	
			//}
			
			mapsNum += 1;
			
			if (mapsNum === mapsTotal) {
				// if all maps are there, trigger the ready event
				$viz.event.trigger('gcviz-ready');
				
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
			// keep $ because $viz wont work
			$viz.extend(true, $.magnificPopup.defaults, {
				tClose: i18n.getDict('%mp-close'), // Alt text on close button
				tLoading: i18n.getDict('%mp-load'), // Text that is displayed during loading. Can contain %curr% and %total% keys
				gallery: {
					tPrev: i18n.getDict('%mp-prev'), // Alt text on left arrow
					tNext: i18n.getDict('%mp-next'), // Alt text on right arrow
					tCounter: i18n.getDict('%mp-count') // Markup for "1 of 7" counter
				},
				image: {
					tError: i18n.getDict('%mp-error') // Error message when image could not be loaded
				}
			});
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);