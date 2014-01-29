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
	if (window.browser !== 'Explorer' && window.browser !== 'Firefox' && window.browser !== 'Chrome' && window.browser !== 'Safari') {
		alert('Browser not suported: needs to be Chrome, Firefox, Safari or Explorer');
		//window.location = 'http://www.google.com/';
	} else if (window.browser === 'Explorer' && window.browserversion <= 8) {
		alert('Browser not suported: Explorer needs to b version 9 and higher');
		//window.location = 'http://www.google.com/';
	}
	
	// load the require libraries
	define.amd.jQuery = true;		
	require({
		async: true,
		parseOnLoad: false,
		aliases: [['text', 'dojo/text']],
		packages: [
			{
				name: 'jquery',
				location: locationPath + 'gcviz/dependencies',
				main: 'jquery.min'
			}, {
				name: 'knockout',
				location: locationPath + 'gcviz/dependencies',
				main: 'knockout.min'
			}, {
				name: 'jqueryui',
				location: locationPath + 'gcviz/dependencies',
				main: 'jqueryui.min'
			}, {
				name: 'jqueryslide',
				location: locationPath + 'gcviz/dependencies',
				main: 'jquery.slides.min'
			}, {
				name: 'magnificpopup',
				location: locationPath + 'gcviz/dependencies',
				main: 'magnificpopup.min'
            }, {
				name: 'kineticpanning',
				location: locationPath + 'gcviz/dependencies',
				main: 'kineticpanning.min'
            }, {
                name: 'media',
                location: locationPath + 'gcviz/dependencies',
                main: 'jquery.media.min'
			}, {
				name: 'gcviz',
				location: locationPath + 'gcviz',
				main: 'gcviz-min'
			}, {
				name: 'gcviz-i18n',
				location: locationPath + 'gcviz/js',
				main: language
			}, {
				name: 'gcviz-ko',
				location: locationPath + 'gcviz/js/custom',
				main: 'gcviz-ko-binding-min'
			}, {
				name: 'gcviz-func',
				location: locationPath + 'gcviz/js/custom',
				main: 'gcviz-functions-min'
			}, {
				name: 'gcviz-gismap',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisMapUtility-min'
			}, {
				name: 'gcviz-gisgeo',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisGeoprocessing-min'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisGraphic-min'
			}, {
				name: 'gcviz-gisnavigation',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisNavigation-min'
			}, {
				name: 'gcviz-gislegend',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisLegend-min'
			}, {
				name: 'gcviz-v-header',
				location: locationPath + 'gcviz/js/views',
				main: 'headerV-min'
			}, {
				name: 'gcviz-vm-header',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'headerVM-min'
			}, {
				name: 'gcviz-v-footer',
				location: locationPath + 'gcviz/js/views',
				main: 'footerV-min'
			}, {
				name: 'gcviz-vm-footer',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'footerVM-min'
			}, {
				name: 'gcviz-v-tbdraw',
				location: locationPath + 'gcviz/js/views',
				main: 'toolbardrawV-min'
			}, {
				name: 'gcviz-vm-tbdraw',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'toolbardrawVM-min'
			}, {
				name: 'gcviz-v-tbnav',
				location: locationPath + 'gcviz/js/views',
				main: 'toolbarnavV-min'
			}, {
				name: 'gcviz-vm-tbnav',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'toolbarnavVM-min'
			}, {
				name: 'gcviz-v-tblegend',
				location: locationPath + 'gcviz/js/views',
				main: 'toolbarlegendV-min'
			},{
				name: 'gcviz-vm-tblegend',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'toolbarlegendVM-min'
			}, {
				name: 'gcviz-v-map',
				location: locationPath + 'gcviz/js/views',
				main: 'mapV-min'
			}, {
				name: 'gcviz-vm-map',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'mapVM-min'
			}, {
				name: 'gcviz-v-inset',
				location: locationPath + 'gcviz/js/views',
				main: 'insetV-min'
			}, {
				name: 'gcviz-vm-inset',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'insetVM-min'
			}
		]
	});
	
	// start the process with a private jquery. If we dont, it creates a conflict because we laod jQuery and it is different then the one loaded by WET
	define('jquery-private', ['jquery'], function ($viz) {
        var noConflict = $viz.noConflict(true);

        // if there is no jQuery loaded, set the window jquery to be the one from this project. Otherwise keep the outside one because it is use
        // by script outside this project.
        window.jQuery = !(window.jQuery) ? window.$ = $viz : window.jQuery;

        return noConflict;
	});
	
	require(['jquery-private', 'gcviz'], function($viz, gcviz) {
		return $viz(document).ready(function() {
			return gcviz.initialize();
		});
	});

}).call(this);