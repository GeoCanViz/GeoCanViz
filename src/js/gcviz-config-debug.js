/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
/* global alert: false, $: false */
(function() {
    'use strict';
    // get the language
    var lang, metas, i,
        out$, outJQuery,
        url = window.location.toString(),
        locationPath, redirectPath,
        language = 'en-min';

    // set language
    if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1) || (url.search(/-fr\./) > -1) || (url.search(/lang=fra/) > -1) || (url.search(/lang=fr/) > -1)) {
        language = 'fr-min';
        window.langext = 'fra';
    } else if ((url.search(/_e\.htm/) > -1) || (url.search(/-eng\./) > -1) || (url.search(/-en\./) > -1) || (url.search(/lang=eng/) > -1) || (url.search(/lang=en/) > -1)) {
        language = 'en-min';
        window.langext = 'eng';
    } else {
        // check if lang-gcviz is set for the first map. All maps needs to have the same language.
        lang = $('.gcviz')[0].getAttribute('lang-gcviz');

        if (lang !== null) {
            if (lang === 'fra') {
                window.langext = 'fra';
                language = 'fr-min';
            } else if (lang === 'eng') {
                window.langext = 'eng';
                language = 'en-min';
            } else {
                window.langext = 'eng';
                console.log('language not set, English by default');
            }
        } else {
            window.langext = 'eng';
            console.log('language not set, English by default');
        }
    }

    // get code location and redirect page from meta tag
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

    // check if there is a version of jquery attach to window object
    if (typeof window.jQuery !== 'undefined') {
        window.flag$ = true;
        out$ = $;
        outJQuery = jQuery;
    } else {
        window.flag$ = false;
    }

    // detect browser (code from http://www.quirksmode.org/)
    // see new version https://github.com/WhichBrowser/WhichBrowser SHOULD IMPLEMENT!!!
    var browserDetect = {
        init: function() {
            window.browser = this.searchString(this.dataBrowser) || 'unknown';
            window.browserversion = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'unknown';
            window.browserOS = navigator.platform.match(/(Win)/i) ? 'win' : 'mac';

            // add a class to document to specify it is IE 10
            if (window.browser === 'Explorer' && window.browserversion <= 10) {
                document.documentElement.setAttribute('data-useragent', 'IE10');
            }
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
        },{
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
    if (window.browser !== 'Explorer' && window.browser !== 'Firefox' && window.browser !== 'Chrome' && window.browser !== 'Safari' && window.browser !== 'Mobile') {
        if (language === 'en-min') {
            alert('Browser not supported: needs to be Chrome, Firefox, Safari or Explorer. You will be redirected to project page. If you are a Internet Explorer user. Make sure “Browser Mode” is “Internet Explorer 10” or above and “Document Mode is “Standards”. To access those settings, press F12 to open “developer “tools”.');
        } else {
            alert('Navigateur non pris en charge: doit être Chrome, Firefox, Safari ou Explorer. Vous serez redirigé vers la page de projet. Si vous êtes un utilisateur d\'Internet Explorer. Vérifiez que le « Mode navigateur » est « Internet Explorer 10 » ou plus haut et que le « Mode document » est « normes ». Pour accéder à ces réglages, appuyez sur F12 pour ouvrir les « outils de développement ».');
        }

        window.location = redirectPath;
    } else if (window.browser === 'Explorer' && window.browserversion < 10) {
        if (language === 'en-min') {
            alert('Browser not supported: Explorer needs to be version 10 or higher. You will be redirected to project page. If you are a Internet Explorer user. Make sure “Browser Mode” is “Internet Explorer 10” or above and “Document Mode is “Standards”. To access those settings, press F12 to open “developer tools”.');
        } else {
            alert('Navigateur non pris en charge: Explorer doit être version 10 ou supérieur. Vous serez redirigé vers la page de projet. Si vous êtes un utilisateur d\'Internet Explorer. Vérifiez que le « Mode navigateur » est « Internet Explorer 10 » ou plus haut et que le « Mode document » est « normes ». Pour accéder à ces réglages, appuyez sur F12 pour ouvrir les « outils de développement ».');
        }

        window.location = redirectPath;
    }

    // load the require libraries
    define.amd = { },
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
                name: 'proj4js',
                    location: locationPath + 'src/js/dependencies',
                    main: 'proj4'
            }, {
                name: 'gcviz',
                location: locationPath + 'src/js',
                main: 'gcviz'
            }, {
                name: 'gcviz-i18n',
                location: locationPath + 'gcviz/js',
                main: language
            }, {
                name: 'jqueryui-i18n',
                location: locationPath + 'gcviz/dependencies',
                main: 'datepicker-fr.min'
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
                name: 'gcviz-gissymbol',
                location: locationPath + 'src/js/gistasks',
                main: 'gisSymbol'
            }, {
                name: 'gcviz-gislegend',
                location: locationPath + 'src/js/gistasks',
                main: 'gisLegend'
            }, {
                name: 'gcviz-giscluster',
                location: locationPath + 'src/js/gistasks',
                main: 'gisCluster'
            }, {
                name: 'gcviz-gisprint',
                location: locationPath + 'src/js/gistasks',
                main: 'gisPrint'
            }, {
                name: 'gcviz-gisdata',
                location: locationPath + 'src/js/gistasks',
                main: 'gisData'
            }, {
                name: 'gcviz-gisdatagrid',
                location: locationPath + 'src/js/gistasks',
                main: 'gisDatagrid'
            }, {
                name: 'gcviz-v-help',
                location: locationPath + 'src/js/widgets/views',
                main: 'helpV'
            }, {
                name: 'gcviz-vm-help',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'helpVM'
            }, {
                name: 'gcviz-v-wcag',
                location: locationPath + 'src/js/widgets/views',
                main: 'wcagV'
            }, {
                name: 'gcviz-vm-wcag',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'wcagVM'
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
                name: 'gcviz-v-tbdata',
                location: locationPath + 'src/js/widgets/views',
                main: 'toolbardataV'
            },{
                name: 'gcviz-vm-tbdata',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'toolbardataVM'
            }, {
                name: 'gcviz-v-tbextract',
                location: locationPath + 'src/js/widgets/views',
                main: 'toolbarextractV'
            },{
                name: 'gcviz-vm-tbextract',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'toolbarextractVM'
            }, {
                name: 'gcviz-v-tbslider',
                location: locationPath + 'src/js/widgets/views',
                main: 'toolbarsliderV'
            },{
                name: 'gcviz-vm-tbslider',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'toolbarsliderVM'
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
            }, {
                name: 'gcviz-v-datagrid',
                location: locationPath + 'src/js/widgets/views',
                main: 'datagridV'
            }, {
                name: 'gcviz-vm-datagrid',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'datagridVM'
            }, {
                name: 'gcviz-v-print',
                location: locationPath + 'src/js/widgets/views',
                main: 'printV'
            }, {
                name: 'gcviz-vm-print',
                location: locationPath + 'src/js/widgets/viewmodels',
                main: 'printVM'
            }
        ]
    });

    // delay the start to let outside init finish. If we are in a WET template, there is confluct between the 2 jQuery.
    setTimeout(function() {
        // start the process with a private jquery. If we dont, it creates a conflict because we laod jQuery and it is different then the one loaded by WET
        define('jquery-private', ['jquery'], function ($viz) {
            // if there is no jQuery loaded, the window jquery will be the one from this project
            // Otherwise keep the outside one because it is use
            if (window.flag$) {
                require(['jqueryui', 'genfile'], function(ui, file) {
                    $viz.noConflict(true);

                    window.jQuery = outJQuery;
                    window.$ = out$;
                });
            }

            return $viz;
        });

        // launch gcviz
        require(['jquery-private', 'gcviz'], function($viz, gcviz) {
            return $viz(document).ready(function() {
                return gcviz.initialize();
            });
        });
    }, 1000);

}).call(this);
