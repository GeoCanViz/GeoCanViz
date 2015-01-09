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
		locationPath, redirectPath,
		language = 'en-min',
		metas,
		i;

	if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1) || (url.search(/-fr\./) > -1) || (url.search(/lang=fra/) > -1) || (url.search(/lang=fr/) > -1)) {
		language = 'fr-min';
		window.langext = 'fra';
	} else if ((url.search(/_e\.htm/) > -1) || (url.search(/-eng\./) > -1) || (url.search(/-en\./) > -1) || (url.search(/lang=eng/) > -1) || (url.search(/lang=en/) > -1)) {
		language = 'en-min';
		window.langext = 'eng';
	} else {
		window.langext = 'eng';
		console.log('language not set, English by default');
	}

	// get code location and redirect path from meta tag
	metas = document.getElementsByTagName('meta'),
	i = metas.length;

	while(i--) {
		if (metas[i].getAttribute('name') === 'gcviz-location') {
			locationPath = metas[i].getAttribute('content');
		}
		if (metas[i].getAttribute('name') === 'gcviz-redirect') {
			redirectPath = metas[i].getAttribute('content');
		}
	}

	// if location path is not set in html set by default at GeoCanViz
	if (typeof locationPath === 'undefined') {
		var starGeo = url.search('GeoCanViz');
		if (starGeo !== -1) {
			locationPath = url.substring(0, url.search('GeoCanViz')) + 'GeoCanViz/';
		} else {
			if (language === 'fr-min') {
				console.log('Définir le meta paramètre "location" ou mettre le site web dans un répertoire nommé "GeoCanViz"');
			} else {
				console.log('Define "location" meta paramter or put web site in a folder called "GeoCanViz"');
			}
		}
	}

	// detect browser (code from http://www.quirksmode.org/)
	// see new version https://github.com/WhichBrowser/WhichBrowser SHOULD IMPLEMENT!!!
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
		{ // for mobile device (phone and tablet)
			string: navigator.userAgent,
			subString: 'Mobile',
			identity: 'Mobile',
			versionSearch: ''
		}, { // for IE mobile device
			string: navigator.userAgent,
			subString: 'IEMobile',
			identity: 'Mobile',
			versionSearch: ''
		}, { // for Kindle mobile device
			string: navigator.userAgent,
			subString: 'Silk',
			identity: 'Mobile',
			versionSearch: ''
		}, { // for Blackberry Playbook
			string: navigator.userAgent,
			subString: 'Tablet',
			identity: 'Mobile',
			versionSearch: ''
		}, {
			string: navigator.userAgent,
			subString: 'Chrome',
			identity: 'Chrome'
		}, {
			string: navigator.vendor,
			subString: 'Apple',
			identity: 'Safari',
			versionSearch: 'Version'
		}, {
			prop: window.opera,
			identity: 'Opera',
			versionSearch: 'Version'
		}, {
			string: navigator.userAgent,
			subString: 'Firefox',
			identity: 'Firefox'
		}, {
			string: navigator.vendor,
			subString: 'Camino',
			identity: 'Camino'
		}, { // for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: 'Netscape',
			identity: 'Netscape'
		}, {
			string: navigator.userAgent,
			subString: 'MSIE',
			identity: 'Explorer',
			versionSearch: 'MSIE'
		}, { // for IE 11
			string: navigator.userAgent,
			subString: 'Windows NT',
			identity: 'Explorer',
			versionSearch: 'rv'
		}, {
			string: navigator.userAgent,
			subString: 'Gecko',
			identity: 'Mozilla',
			versionSearch: 'rv'
		}, { // for older Netscapes (4-)
			string: navigator.userAgent,
			subString: 'Mozilla',
			identity: 'Netscape',
			versionSearch: 'Mozilla'
		}]
	};
	browserDetect.init();

	// if browser not supported, redirect
	if (window.browser !== 'Explorer' && window.browser !== 'Firefox' && window.browser !== 'Chrome' && window.browser !== 'Safari') {
		if (language === 'en-min') {
			alert('Browser not supported: needs to be Chrome, Firefox, Safari or Explorer. You will be redirected to project page.');
		} else {
			alert('Navigateur non pris en charge: doit être Chrome, Firefox, Safari ou Explorer. Vous serez redirigé vers la page de projet');
		}

		window.location = redirectPath;
	} else if (window.browser === 'Explorer' && window.browserversion <= 8) {
		if (language === 'en-min') {
			alert('Browser not supported: Explorer needs to be version 9 or higher. You will be redirected to project page.');
		} else {
			alert('Navigateur non pris en charge: Explorer doit être version 9 ou supérieur. Vous serez redirigé vers la page de projet');
		}

		window.location = redirectPath;
	}

	// load the require libraries
	define.amd.jQuery = true;
	require({
		async: true,
		parseOnLoad: false,
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
				name: 'genfile',
				location: locationPath + 'gcviz/dependencies',
				main: 'generatefile.min'
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
				name: 'cluster',
				location: locationPath + 'gcviz/dependencies',
				main: 'esri.clusterlayer.min'
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
				name: 'gcviz-gisnav',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisNavigation-min'
			}, {
				name: 'gcviz-gisgraphic',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisGraphic-min'
			}, {
				name: 'gcviz-gissymbol',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisSymbol-min'
			}, {
				name: 'gcviz-gislegend',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisLegend-min'
			}, {
				name: 'gcviz-giscluster',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisCluster-min'
			}, {
				name: 'gcviz-gisprint',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisPrint-min'
			}, {
				name: 'gcviz-gisdata',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisData-min'
			}, {
				name: 'gcviz-gisdatagrid',
				location: locationPath + 'gcviz/js/gistasks',
				main: 'gisDatagrid-min'
			}, {
				name: 'gcviz-v-help',
				location: locationPath + 'gcviz/js/views',
				main: 'helpV-min'
			}, {
				name: 'gcviz-vm-help',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'helpVM-min'
			}, {
				name: 'gcviz-v-wcag',
				location: locationPath + 'gcviz/js/views',
				main: 'wcagV-min'
			}, {
				name: 'gcviz-vm-wcag',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'wcagVM-min'
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
				name: 'gcviz-v-tbdata',
				location: locationPath + 'gcviz/js/views',
				main: 'toolbardataV-min'
			},{
				name: 'gcviz-vm-tbdata',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'toolbardataVM-min'
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
			}, {
				name: 'gcviz-v-datagrid',
				location: locationPath + 'gcviz/js/views',
				main: 'datagridV-min'
			}, {
				name: 'gcviz-vm-datagrid',
				location: locationPath + 'gcviz/js/viewmodels',
				main: 'datagridVM-min'
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
