/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
(function() {
	'use strict';
	// get the language
	var url = window.location.toString(),
		pathRegex = new RegExp(/\/[^\/]+$/),
		locationPath = window.location.pathname.replace(pathRegex, ''),
		language = 'en-min';
	
	if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1) || (url.search(/-fr\./) > -1) || (url.search(/lang=fra/) > -1) || (url.search(/lang=fr/) > -1)) {
		language = 'fr-min';
	} else if ((url.search(/_e\.htm/) > -1) || (url.search(/-eng\./) > -1) || (url.search(/-en\./) > -1) || (url.search(/lang=eng/) > -1) || (url.search(/lang=en/) > -1)) {
		language = 'en-min';
	} else {
		console.log('language not set, English by default');
	}

	// load the require libraries		
	require({
		async: true,
		parseOnLoad: false,
		aliases: [['text', 'dojo/text']],
		packages: [
			{
				name: 'jquery',
				location: locationPath + '/dist/dependencies',
				main: 'jquery.min'
			}, {
				name: 'knockout',
				location: locationPath + '/dist/dependencies',
				main: 'knockout.min'
			}, {
				name: 'gcviz',
				location: locationPath + '/dist',
				main: 'gcviz-min'
			}, {
				name: 'gcviz-i18n',
				location: locationPath + '/dist/js',
				main: language
			}, {
				name: 'gcviz-gismap',
				location: locationPath + '/dist/js/gistasks',
				main: 'gisMapUtility-min'
			}, {
				name: 'gcviz-gisgeo',
				location: locationPath + '/dist/js/gistasks',
				main: 'gisGeoprocessing-min'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + '/dist/js/gistasks',
				main: 'gisGraphic-min'
			}, {
				name: 'gcviz-gisnavigation',
				location: locationPath + '/dist/js/gistasks',
				main: 'gisNavigation-min'
			}, {
				name: 'gcviz-v-tbmain',
				location: locationPath + '/dist/js/views',
				main: 'toolbarmainV-min'
			}, {
				name: 'gcviz-vm-tbmain',
				location: locationPath + '/dist/js/viewmodels',
				main: 'toolbarmainVM-min'
			}, {
				name: 'gcviz-v-tbfoot',
				location: locationPath + '/dist/js/views',
				main: 'toolbarfootV-min'
			}, {
				name: 'gcviz-vm-tbfoot',
				location: locationPath + '/dist/js/viewmodels',
				main: 'toolbarfootVM-min'
			}, {
				name: 'gcviz-v-tbanno',
				location: locationPath + '/dist/js/views',
				main: 'toolbarannoV'
			}, {
				name: 'gcviz-vm-tbanno',
				location: locationPath + '/dist/js/viewmodels',
				main: 'toolbarannoVM'
			}, {
				name: 'gcviz-v-tbnav',
				location: locationPath + '/dist/js/views',
				main: 'toolbarnavV'
			}, {
				name: 'gcviz-vm-tbnav',
				location: locationPath + '/dist/js/viewmodels',
				main: 'toolbarnavVM'
			}, {
				name: 'gcviz-v-map',
				location: locationPath + '/dist/js/views',
				main: 'mapV-min'
			}, {
				name: 'gcviz-vm-map',
				location: locationPath + '/dist/js/viewmodels',
				main: 'mapVM-min'
			}
		]
	});

	define.amd.jQuery = true;
	
	require(['jquery', 'gcviz'], function($, gcviz) {
		return $(document).ready(function() {
			return gcviz.initialize();
		});
	});

}).call(this);