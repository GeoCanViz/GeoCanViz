/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
/* global alert: false */
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
		{	// for newer Netscapes (6+)
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
		packages: [
			{
				name: 'jquery',
				location: locationPath + 'src/js/dependencies',
				main: 'jquery.min'
			}, {
				name: 'knockout',
				location: locationPath + 'src/js/dependencies',
				main: 'knockout.min'
			}, {
				name: 'jqueryui',
				location: locationPath + 'src/js/dependencies',
				main: 'jqueryui.min'
			}, {
				name: 'genfile',
				location: locationPath + 'src/js/dependencies',
				main: 'generatefile.min'
			}, {
				name: 'jqueryslide',
				location: locationPath + 'src/js/dependencies',
				main: 'jquery.slides.min'
			}, {
				name: 'magnificpopup',
				location: locationPath + 'src/js/dependencies',
				main: 'magnificpopup.min'
            }, {
                name: 'kineticpanning',
                location: locationPath + 'src/js/dependencies',
                main: 'kineticpanning.min'
            }, {
                name: 'cluster',
                location: locationPath + 'src/js/dependencies',
                main: 'esri.clusterlayer.min'
            }, {
                name: 'media',
                location: locationPath + 'src/js/dependencies',
                main: 'jquery.media.min'
			}, {
				name: 'gcviz',
				location: locationPath + 'src/js',
				main: 'gcviz'
			}, {
				name: 'gcviz-i18n',
				location: locationPath + 'gcviz/js',
				main: language
			}, {
				name: 'gcviz-ko',
				location: locationPath + 'src/js/custom',
				main: 'gcviz-ko-binding'
			}, {
				name: 'gcviz-func',
				location: locationPath + 'src/js/custom',
				main: 'gcviz-functions'
			}, {
				name: 'gcviz-gismap',
				location: locationPath + 'src/js/gistasks',
				main: 'gisMapUtility'
			}, {
				name: 'gcviz-gisgeo',
				location: locationPath + 'src/js/gistasks',
				main: 'gisGeoprocessing'
			}, {
				name: 'gcviz-gisnav',
				location: locationPath + 'src/js/gistasks',
				main: 'gisNavigation'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + 'src/js/gistasks',
				main: 'gisGraphic'
			}, {
				name: 'gcviz-gislegend',
				location: locationPath + 'src/js/gistasks',
				main: 'gisLegend'
			}, {
				name: 'gcviz-giscluster',
				location: locationPath + 'src/js/gistasks',
				main: 'gisCluster'
			}, {
				name: 'gcviz-v-header',
				location: locationPath + 'src/js/widgets/views',
				main: 'headerV'
			}, {
				name: 'gcviz-vm-header',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'headerVM'
			}, {
				name: 'gcviz-v-footer',
				location: locationPath + 'src/js/widgets/views',
				main: 'footerV'
			}, {
				name: 'gcviz-vm-footer',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'footerVM'
			}, {
				name: 'gcviz-v-tbdraw',
				location: locationPath + 'src/js/widgets/views',
				main: 'toolbardrawV'
			}, {
				name: 'gcviz-vm-tbdraw',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'toolbardrawVM'
			}, {
				name: 'gcviz-v-tbnav',
				location: locationPath + 'src/js/widgets/views',
				main: 'toolbarnavV'
			}, {
				name: 'gcviz-vm-tbnav',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'toolbarnavVM'
			}, {
				name: 'gcviz-v-tblegend',
				location: locationPath + 'src/js/widgets/views',
				main: 'toolbarlegendV'
			},{
				name: 'gcviz-vm-tblegend',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'toolbarlegendVM'
			}, {
				name: 'gcviz-v-map',
				location: locationPath + 'src/js/widgets/views',
				main: 'mapV'
			}, {
				name: 'gcviz-vm-map',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'mapVM'
			}, {
				name: 'gcviz-v-inset',
				location: locationPath + 'src/js/widgets/views',
				main: 'insetV'
			}, {
				name: 'gcviz-vm-inset',
				location: locationPath + 'src/js/widgets/viewmodels',
				main: 'insetVM'
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
