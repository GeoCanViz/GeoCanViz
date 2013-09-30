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
		locationPath,
		language = 'en-min',
		metas,
		i;
	
	if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1) || (url.search(/-fr\./) > -1) || (url.search(/lang=fra/) > -1) || (url.search(/lang=fr/) > -1)) {
		language = 'fr-min';
	} else if ((url.search(/_e\.htm/) > -1) || (url.search(/-eng\./) > -1) || (url.search(/-en\./) > -1) || (url.search(/lang=eng/) > -1) || (url.search(/lang=en/) > -1)) {
		language = 'en-min';
	} else {
		console.log('language not set, English by default');
	}

	// get code location from meta tag
	metas = document.getElementsByTagName('meta'),
	i = metas.length; 

	while(i--) { 
		if (metas[i].getAttribute('property') === 'location') { 
			locationPath = metas[i].getAttribute('content'); 
		} 
	} 
   
	// load the require libraries		
	require({
		async: true,
		parseOnLoad: false,
		aliases: [['text', 'dojo/text']],
		packages: [
			{
				name: 'jquery',
				location: locationPath + '/src/js/dependencies',
				main: 'jquery.min'
			}, {
				name: 'knockout',
				location: locationPath + '/src/js/dependencies',
				main: 'knockout.min'
			}, {
				name: 'gcviz',
				location: locationPath + '/src/js',
				main: 'gcviz'
			}, {
				name: 'gcviz-i18n',
				location: locationPath + '/dist/js',
				main: language
			}, {
				name: 'gcviz-gismap',
				location: locationPath + '/src/js/gistasks',
				main: 'gisMapUtility'
			}, {
				name: 'gcviz-gisgeo',
				location: locationPath + '/src/js/gistasks',
				main: 'gisGeoprocessing'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + '/src/js/gistasks',
				main: 'gisGraphic'
			}, {
				name: 'gcviz-gisnavigation',
				location: locationPath + '/src/js/gistasks',
				main: 'gisNavigation'
			}, {
				name: 'gcviz-v-tbmain',
				location: locationPath + '/src/js/widgets/views',
				main: 'toolbarmainV'
			}, {
				name: 'gcviz-vm-tbmain',
				location: locationPath + '/src/js/widgets/viewmodels',
				main: 'toolbarmainVM'
			}, {
				name: 'gcviz-v-tbfoot',
				location: locationPath + '/src/js/widgets/views',
				main: 'toolbarfootV'
			}, {
				name: 'gcviz-vm-tbfoot',
				location: locationPath + '/src/js/widgets/viewmodels',
				main: 'toolbarfootVM'
			}, {
				name: 'gcviz-v-tbanno',
				location: locationPath + '/src/js/widgets/views',
				main: 'toolbarannoV'
			}, {
				name: 'gcviz-vm-tbanno',
				location: locationPath + '/src/js/widgets/viewmodels',
				main: 'toolbarannoVM'
			}, {
				name: 'gcviz-v-tbnav',
				location: locationPath + '/src/js/widgets/views',
				main: 'toolbarnavV'
			}, {
				name: 'gcviz-vm-tbnav',
				location: locationPath + '/src/js/widgets/viewmodels',
				main: 'toolbarnavVM'
			}, {
				name: 'gcviz-v-map',
				location: locationPath + '/src/js/widgets/views',
				main: 'mapV'
			}, {
				name: 'gcviz-vm-map',
				location: locationPath + '/src/js/widgets/viewmodels',
				main: 'mapVM'
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