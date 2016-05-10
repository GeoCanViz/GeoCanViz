/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: @gcviz.version@
 *
 */
/* global $: false */
var locationPath;
(function () {
    'use strict';
    var mapsTotal,
        mapsNum;

    define(['jquery-private',
            'gcviz-i18n',
            'gcviz-func',
            'gcviz-v-map',
            'gcviz-v-inset',
            'gcviz-v-help',
            'gcviz-v-wcag',
            'gcviz-v-datagrid',
            'gcviz-v-header',
            'gcviz-v-footer',
            'gcviz-v-tbdraw',
            'gcviz-v-tbnav',
            'gcviz-v-tblegend',
            'gcviz-v-tbdata',
            'gcviz-v-tbextract',
            'gcviz-v-tbslider',
            'gcviz-v-print'
    ], function($viz, i18n, gcvizFunc, map, inset, help, wcag, datagrid, header, footer, tbdraw, tbnav, tblegend, tbdata, tbextract, tbslider, print) {
        var initialize,
            readConfig,
            execConfig,
            setLocationPath,
            setLocalMP,
            setScrollTo,
            inter;

        /*
         * initialize the GCViz application
         */
        initialize = function() {
            var mapElem, body,
                maps = $viz('.gcviz'),
                len = maps.length;

            // extent or private AMD jQuery with the jQuery from outside project to get reference to some dependencies (magnificPopup, jqueryUI, slidesJS)
            // we need to do this because those libraries are not AMD and use the window.jQuery object to initialize themselves.
            // TODO: I put this in comment because no set jquerui as input in my define in the gcviz-config...it seems to solve the problem!
            // The extend seems to corrupt the library...
            //$viz.extend(true, $viz, $);

            // initialize map number and total for the ready event
            mapsTotal = len;
            mapsNum = 0;

            // add the browser class to body element. It will help us to use specific css style for IE
            body = document.getElementsByTagName('body')[0];
            body.className = body.className + ' ' + window.browser;

            // set location path
            setLocationPath();

            // set local for magnificpopup plugin
            // magnificpopup is link with the outside jQuery. Sometimes, the dependencie is not loaded when
            // we try to use it. So we use an interval to try to set it later...
            inter = setInterval(setLocalMP, 1000);

            // set scrollTo function
            setScrollTo();

            // loop trought maps
            while (len--) {
                mapElem = maps[len];

                // read configuration file
                readConfig(mapElem);
            }
        };

        /*
         * read configuration file and start execution
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
                    console.log(i18n.getDict('%msg-configerr') + ': ' + file);
                }
            }); // end ajax
        };

        /*
         * execute the configuration file. add all viewmodel to a master view model. This viewmodel will be store in an array
         * of view models (one for each map)
         */
        execConfig = function(mapElem, config) {
            var $mapSection,
                $mapElem = $viz(mapElem),
                mapframe = config.mapframe,
                mapid = mapframe.id,
                size = mapframe.size,
                width = size.width,
                cfgPrint = config.header.print,
                maxWidth = parseInt($mapElem.parent().css('width'), 10) - (2 * $mapElem.position().left); // get container width;

            // check if the container width is smaller then gcviz. If so, set width to container width
            // if user resize his window to a larger size later, the map will grow to the width
            // specify in the config file.
            if (maxWidth < size.width) {
                width = maxWidth;
            }

            // create section around map. This way we can bind Knockout to the section (height = map + header + footer + wcag)
            $mapElem.wrap('<section id=section' + mapid + ' class="gcviz-section" role="map" style="width:' + width + 'px; height:' + (size.height + 116) + 'px;">');
            $mapSection = $viz(document).find('#section' + mapid);

            // extend the section with configuration file info
            $viz.extend($mapSection, config);

            // create map and add layers
            // save the result of every view model in an array of view models
            map.initialize($mapSection, width);

            // add the WCAG section for keyboard user
            wcag.initialize($mapSection);

            // add header and footer
            header.initialize($mapSection);
            footer.initialize($mapSection);

            // add draw toolbar
            if (config.toolbardraw.enable) {
                tbdraw.initialize($mapSection);
            }

            // add navigation toolbar
            if (config.toolbarnav.enable) {
                tbnav.initialize($mapSection);
            }

            // add legend
            if (config.toolbarlegend.enable) {
                tblegend.initialize($mapSection);
            }

            // add datatable, popup and hover
            if (config.datagrid.enable) {
                datagrid.initialize($mapSection);
            }

            // add data
            if (config.toolbardata.enable) {
                tbdata.initialize($mapSection);
            }

            // add data extraction
            if (config.toolbarextract.enable) {
                tbextract.initialize($mapSection);
            }

            // add time slider
            if (typeof config.toolbarslider !== 'undefined') {
                if (config.toolbarslider.enable) {
                    tbslider.initialize($mapSection);
                }
            }

            // add inset
            if (config.insetframe.enable) {
                inset.initialize($mapSection);
            }

            // add print
            if (cfgPrint.enable && cfgPrint.type !== 3) {
                print.initialize($mapSection);
            }

            // create the help for the map instance
            help.initialize($mapSection);

            // notify the map is ready and increment
            $mapElem.trigger('gcviz-ready');
            mapsNum += 1;

            if (mapsNum === mapsTotal) {
                // TODO have resize by map!
                // set the resize event
                window.onresize = gcvizFunc.debounce(function(event) {
                    var applyW, actualW, oriW,
                        leftMarg, maxWidth,
                        $section, $mapholder,
                        $map, $maproot,
                        isFullScreen,
                        target = event.target;

                    // check if the event is trigger by ui-dialog window. If not, set resize
                    if (target.toString().indexOf('Window') !== -1) {
                        $section = $viz(target.document.getElementsByClassName('gcviz-section')),
                        $mapholder = $section.find('.gcviz'),
                        $map = $section.find('.gcviz-map'),
                        $maproot = $section.find('.gcviz-root'),
                        isFullScreen = $mapholder.hasClass('gcviz-sectionfs');

                        // check if in full screen
                        if (isFullScreen) {
                            maxWidth = window.innerWidth;
                        } else {
                            // set parameters
                            actualW = parseInt($mapSection.css('width'), 10), // actual map width
                            oriW = parseInt($map.attr('gcviz-size').split(';')[1], 10), // original from config map width
                            leftMarg = $section.position().left, //containter left margin
                            maxWidth = parseInt($section.parent().css('width'), 10) - (2 * leftMarg); // get container width
                        }

                        // map cant be smaller then 360px (tools panel width)
                        if (maxWidth < 360) {
                            maxWidth = 360;
                        }

                        // check if we should apply the original width or the maximum possible width
                        if (oriW > maxWidth || isFullScreen) {
                            applyW = maxWidth;
                        } else if (actualW < oriW && maxWidth > oriW) {
                            applyW = oriW;
                        }

                        // set size
                        gcvizFunc.setStyle($section[0], { 'width': applyW + 'px' });
                        gcvizFunc.setStyle($mapholder[0], { 'width': applyW + 'px' });
                        gcvizFunc.setStyle($map[0], { 'width': applyW + 'px' });
                        gcvizFunc.setStyle($maproot[0], { 'width': applyW + 'px' });
                    }

                }, 200, false);
            }
        };

        setLocationPath = function() {
            // get code location from meta tag
            var metas = document.getElementsByTagName('meta'),
            i = metas.length;

            while (i--) {
                if (metas[i].getAttribute('name') === 'gcviz-location') {
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
                if (typeof $.magnificPopup !== 'undefined' && typeof $.magnificPopup.defaults !== 'undefined') {
                    $viz.extend({}, $.magnificPopup.defaults, {
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

                    clearInterval(inter);
                }
        };

        // add scrollTo function to $viz to be able to scroll to open panel
        // http://lions-mark.com/jquery/scrollTo/
        setScrollTo = function() {
            $viz.fn.scrollTo = function(target, options, callback) {
                var settings;

                if (typeof options === 'function' && arguments.length === 2) {
                    callback = options;
                    options = target;
                }
                    settings = $.extend({
                        scrollTarget: target,
                        offsetTop: 26,
                        duration: 500,
                        easing: 'swing'
                    }, options);

                return this.each(function() {
                    var scrollPane = $(this),
                        scrollTarget = (typeof settings.scrollTarget === 'number') ? settings.scrollTarget : $(settings.scrollTarget),
                        scrollY = (typeof scrollTarget === 'number') ? scrollTarget : (scrollTarget.offset().top - scrollPane.offset().top) + scrollPane.scrollTop() - parseInt(settings.offsetTop, 10);

                    scrollPane.animate({ scrollTop : scrollY }, parseInt(settings.duration, 10), settings.easing, function() {
                        if (typeof callback === 'function') {
                            callback.call(this);
                        }
                    });
                });
            };
        };

        return {
            initialize: initialize
        };
    });
}).call(this);
