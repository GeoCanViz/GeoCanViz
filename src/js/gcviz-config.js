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

	// if location path is not set in html set by default at GeoCanViz
	if (typeof locationPath === 'undefined') {
		var starGeo = url.search('GeoCanViz');
		if (starGeo !== -1) {
			locationPath = url.substring(0, url.search('GeoCanViz')) + 'GeoCanViz/';
		} else {
			if  (language === 'fr-min') {
				console.log('Définir le meta paramètre "location" ou mettre le site web dans un répertoire nommé "GeoCanViz"');
			} else {
				console.log('Define "location" meta paramter or put web site in a folder called "GeoCanViz"');
			}
		}
	} 
	
	// detect browser (code from http://www.quirksmode.org/)
	var browserDetect = {
		init: function() {
			window.browser = this.searchString(this.dataBrowser) || 'unknown';
			window.browserversion = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'unknown';
	},
	searchString: function(data) {
		var length = data.length,
			i = 0,
			dataString,
			dataProp;
		
		while (length--) {
			dataString = data[i].string;
			dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			
			if (dataString) {
				if (dataString.indexOf(data[i].subString) !== -1) {
					return data[i].identity;
				}
			}
			else if (dataProp) {
				return data[i].identity;
			}
			i++;
		}
	},
	searchVersion: function(dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index === -1) {
			return;
		} else {
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		}
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: 'Chrome',
			identity: 'Chrome'
		},
		{
			string: navigator.vendor,
			subString: 'Apple',
			identity: 'Safari',
			versionSearch: 'Version'
		},
		{
			prop: window.opera,
			identity: 'Opera',
			versionSearch: 'Version'
		},
		{
			string: navigator.userAgent,
			subString: 'Firefox',
			identity: 'Firefox'
		},
		{
			string: navigator.vendor,
			subString: 'Camino',
			identity: 'Camino'
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: 'Netscape',
			identity: 'Netscape'
		},
		{
			string: navigator.userAgent,
			subString: 'MSIE',
			identity: 'Explorer',
			versionSearch: 'MSIE'
		},
		{
			string: navigator.userAgent,
			subString: 'Gecko',
			identity: 'Mozilla',
			versionSearch: 'rv'
		},
		{	// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: 'Mozilla',
			identity: 'Netscape',
			versionSearch: 'Mozilla'
		}]
	};
	browserDetect.init();
	
	// if browser not supported, redirect
	if (window.browser === 'MSIE' && window.browserversion <= 10) {
		window.location = 'http://www.google.com/';
	}
	
	// load the require libraries		
	require({
		async: true,
		parseOnLoad: false,
		aliases: [['text', 'dojo/text']],
		packages: [
			{
				name: 'jquery',
				location: locationPath + 'dist/dependencies',
				main: 'jquery.min'
			}, {
				name: 'knockout',
				location: locationPath + 'dist/dependencies',
				main: 'knockout.min'
			}, {
				name: 'jqueryui',
				location: locationPath + '/dist/dependencies',
				main: 'jqueryui.min'
			}, {
				name: 'jqueryslide',
				location: locationPath + '/dist/dependencies',
				main: 'jquery.slides.min'
			}, {
				name: 'lightbox',
				location: locationPath + '/dist/dependencies',
				main: 'lightbox.min'
			}, {
				name: 'gcviz',
				location: locationPath + 'dist',
				main: 'gcviz-min'
			}, {
				name: 'gcviz-i18n',
				location: locationPath + 'dist/js',
				main: language
			}, {
				name: 'gcviz-gismap',
				location: locationPath + 'dist/js/gistasks',
				main: 'gisMapUtility-min'
			}, {
				name: 'gcviz-gisgeo',
				location: locationPath + 'dist/js/gistasks',
				main: 'gisGeoprocessing-min'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + 'dist/js/gistasks',
				main: 'gisGraphic-min'
			}, {
				name: 'gcviz-gisnavigation',
				location: locationPath + 'dist/js/gistasks',
				main: 'gisNavigation-min'
			}, {
				name: 'gcviz-v-tbmain',
				location: locationPath + 'dist/js/views',
				main: 'toolbarmainV-min'
			}, {
				name: 'gcviz-vm-tbmain',
				location: locationPath + 'dist/js/viewmodels',
				main: 'toolbarmainVM-min'
			}, {
				name: 'gcviz-v-tbfoot',
				location: locationPath + 'dist/js/views',
				main: 'toolbarfootV-min'
			}, {
				name: 'gcviz-vm-tbfoot',
				location: locationPath + 'dist/js/viewmodels',
				main: 'toolbarfootVM-min'
			}, {
				name: 'gcviz-v-tbanno',
				location: locationPath + 'dist/js/views',
				main: 'toolbarannoV-min'
			}, {
				name: 'gcviz-vm-tbanno',
				location: locationPath + 'dist/js/viewmodels',
				main: 'toolbarannoVM-min'
			}, {
				name: 'gcviz-v-tbnav',
				location: locationPath + 'dist/js/views',
				main: 'toolbarnavV-min'
			}, {
				name: 'gcviz-vm-tbnav',
				location: locationPath + 'dist/js/viewmodels',
				main: 'toolbarnavVM-min'
			}, {
				name: 'gcviz-v-map',
				location: locationPath + 'dist/js/views',
				main: 'mapV-min'
			}, {
				name: 'gcviz-vm-map',
				location: locationPath + 'dist/js/viewmodels',
				main: 'mapVM-min'
			}, {
				name: 'gcviz-v-inset',
				location: locationPath + 'dist/js/views',
				main: 'insetV-min'
			}, {
				name: 'gcviz-vm-inset',
				location: locationPath + 'dist/js/viewmodels',
				main: 'insetVM-min'
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