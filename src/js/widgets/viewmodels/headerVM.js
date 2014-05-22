/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'media',
			'gcviz-gisprint',
			'gcviz-i18n',
			'gcviz-ko',
			'gcviz-func',
			'gcviz-gismap'
	], function($viz, ko, media, gisPrint, i18n, binding, func, gisM) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

            // Setup the help dialog box
            $viz('#divHelp').dialog({
                autoOpen: false,
                closeText: i18n.getDict('%close'),
                show: {effect: 'fade', speed: 1000},
                hide: {effect: 'fade', speed: 1000},
                title: i18n.getDict('%header-help'),
                resizable: false,
                height: 400,
                width: 950
            });

			//TODO: Look at custum bindings
            // Setup the about dialog box
            $viz('#divAbout').dialog({
                autoOpen: false,
                closeText: i18n.getDict('%close'),
                show: {effect: 'fade', speed: 1000},
                hide: {effect: 'fade', speed: 1000},
                title: i18n.getDict('%header-tpabout'),
                resizable: false,
                height: 400,
                width: 950
            });

			// data model				
			var headerViewModel = function($mapElem, mapid) {
				var _self = this,
                    pathAbout = locationPath + 'gcviz/images/headAbout.png',
					pathFullscreen = locationPath + 'gcviz/images/headFullscreen.png',
					pathShowInset = locationPath + 'gcviz/images/headShowInset2.png',
					pathSmallscreen = locationPath + 'gcviz/images/headSmallscreen.png',
                    pathClosedTools = locationPath + 'gcviz/images/headToolsClosed.png',
                    pathOpenTools = locationPath + 'gcviz/images/headToolsOpen.png',
					pathHelp = locationPath + 'gcviz/images/headHelp.png',
					pathPrint = locationPath + 'gcviz/print/',
					$section = $viz('#section' + mapid),
					$mapholder = $viz('#' + mapid),
					$map = $viz('#' + mapid + '_holder'),
					$maproot = $viz('#' + mapid + '_holder_root'),
					map = vmArray[mapid].map.map;

				_self.xpositionHelp = ko.observable();
				_self.xpositionAbout = ko.observable();
				_self.xpositionInset = ko.observable();
				_self.xpositionLink = ko.observable();
				_self.xpositionTools = ko.observable();
				_self.xpositionPrint = ko.observable();
				_self.xpositionFull = ko.observable();
				_self.positionHelp = 0,
				_self.positionAbout = 0,
				_self.positionInset = 0,
				_self.positionLink = 0,
				_self.positionTools = 0,
				_self.positionPrint = 0,
				_self.positionFull = 0;

				// Determine the position of the icons
				if (config.fullscreen) {
					_self.positionHelp += 34;
					_self.positionAbout += 35;
					_self.positionInset += 35;
					_self.positionLink += 35;
					_self.positionTools += 35;
					_self.positionPrint += 35;
				}
				if (config.print.enable) {
					_self.positionHelp += 34;
					_self.positionAbout += 35;
					_self.positionInset += 35;
					_self.positionLink += 35;
					_self.positionTools += 35;
				}
				if (config.tools) {
					_self.positionHelp += 34;
					_self.positionAbout += 35;
					_self.positionInset += 35;
					_self.positionLink += 35;
				}
				if (config.link.enable) {
					_self.positionHelp += 34;
					_self.positionAbout += 35;
					_self.positionInset += 35;
				}
				if (config.inset) {
					_self.positionHelp += 34;
					_self.positionAbout += 35;
				}
				if (config.about.enable) {
					_self.positionHelp += 34;
				}
				_self.xpositionHelp('right:' + _self.positionHelp.toString() + 'px!important');
				_self.xpositionAbout('right:' + _self.positionAbout.toString() + 'px!important');
				_self.xpositionInset('right:' + _self.positionInset.toString() + 'px!important');
				_self.xpositionLink('right:' + _self.positionLink.toString() + 'px!important');
				_self.xpositionTools('right:' + _self.positionTools.toString() + 'px!important');
				_self.xpositionPrint('right:' + _self.positionPrint.toString() + 'px!important');
				_self.xpositionFull('right:' + _self.positionFull.toString() + 'px!important');

				// images path
                _self.imgAbout = ko.observable(pathAbout);
				_self.imgFullscreen = ko.observable(pathFullscreen);
				_self.imgShowInset = pathShowInset;
                _self.imgTools = ko.observable(pathClosedTools);
				_self.imgHelp = pathHelp;

				// tooltip
				_self.tpHelp = i18n.getDict('%header-tphelp');
				_self.tpTools = i18n.getDict('%header-tptools');
				_self.tpPrint = i18n.getDict('%header-tpprint');
				_self.tpInset = i18n.getDict('%header-tpinset');
                _self.tpAbout = i18n.getDict('%header-tpabout');
				_self.tpFullScreen = i18n.getDict('%header-tpfullscreen');

				// print info
				_self.printInfo = {
					url: i18n.getDict('%header-printurl'),
					copyright: i18n.getDict('%header-printcopyright'),
					template: pathPrint
				};

				// fullscreen
				_self.isFullscreen = ko.observable(false);
				_self.isInsetVisible = ko.observable(true);
				_self.insetState = true;
				_self.fullscreenState = 0;
                _self.opencloseToolsState = 0;

				_self.init = function() {
					// keep map size
					_self.heightSection = parseInt($section.css('height'), 10);
					_self.heightMap = parseInt($map.css('height'), 10);
					_self.widthSection = parseInt($section.css('width'), 10);
					_self.widthMap = parseInt($map.css('width'), 10);
					_self.headerHeight = parseInt($mapElem.css('height'), 10);

					return { controlsDescendantBindings: true };
				};

				_self.fullscreenClick = function() {
					// debounce the click to avoid resize problems
					func.debounceClick(function() {
						if (_self.fullscreenState) {
							_self.cancelFullScreen();
						} else {
							_self.requestFullScreen();
						}

						// remove tooltip if there (the tooltip is position before the fullscreen)
						$viz('.gcviz-tooltip').remove();
					}, 1000);
				};

				_self.printClick = function() {
					// Print the map
					gisPrint.printMap(map, _self.printInfo);
				};

				_self.insetClick = function() {
					// trigger the insetVisibility custom binding (debounce the click to avoid resize problems)
					func.debounceClick(function() {
						var array;

						_self.insetState = !_self.insetState;
						_self.isInsetVisible(_self.insetState);

						// change first and last item for section tab if inset are visible or not
						if (_self.insetState) {
							array = $section.find('[tabindex = 0]');
							_self.first = array[0];
							_self.last = array[array.length - 1];
						} else {
							array = $section.find('[tabindex = 0]').not('.gcviz-inset-button');
							_self.first = array[0];
							_self.last = array[array.length - 1];
						}
					}, 1000);
				};

				_self.toolsClick = function() {
                    var tool = $mapholder.find('.gcviz-tbcontainer');
                    tool.slideToggle('slow');
                    if (_self.opencloseToolsState === 0) {
                        _self.opencloseToolsState = 1;
                        _self.imgTools(pathOpenTools);
                    } else {
                        _self.opencloseToolsState = 0;
                        _self.imgTools(pathClosedTools);
                    }
                    setTimeout(function() {
                        if (tool.hasClass('gcviz-hidden')) {
                            // set focus on the first element
                            $section.find('.dijitTitlePaneTitleFocus')[0].focus();
                        } else {
                            // set focus back on button
                            $viz('#btnTools' + mapid).focus();
                        }
                    }, 1000);
				};

				_self.helpClick = function() {
                    var html = '';
					// Open the Help dialog box
                    $viz('#divHelp').dialog('open');
                    //Open PDF in media player
                    html = '<a class="media" href="'+i18n.getDict('%header-urlhelp')+'" tabindex="0" title="'+i18n.getDict('%header-helptitle')+'F"></a>';
                    $viz('#divHelpContent').html(html);
                    $viz('.media').media({ width:900,height:300 });
                };

                _self.aboutClick = function() {
                    var html = '';
                    // Open the About dialog box
                    $viz('#divAbout').dialog('open');
                    //Open PDF in media player
                    html = '<a class="media" href="'+i18n.getDict('%header-urlabout')+'" tabindex="0" title="'+i18n.getDict('%header-abouttitle')+'F"></a>';
                    $viz('#divAboutContent').html(html);
                    $viz('.media').media({ width:900,height:300 });
                };

				_self.cancelFullScreen = function() {
					// set style back for the map
					func.setStyle($section[0], { 'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px' });
					func.setStyle($mapholder[0], { 'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px' });
					func.setStyle($map[0], { 'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px' });
					func.setStyle($maproot[0], { 'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px' });
					$section.removeClass('gcviz-sectionfs');

					// trigger the fullscreen custom binding and set state and image
					_self.isFullscreen(false);
					_self.imgFullscreen(pathFullscreen);
					_self.fullscreenState = 0;

					// resize map and keep the extent
					gisM.manageScreenState(map, 500, false);

					// remove the event that keeps tab in map section
					$section.off('keydown.fs');
				};

				_self.requestFullScreen = function() {
					// get maximal height and width from browser window and original height and width for the map
					var param = func.getFullscreenParam(_self.widthSection, _self.heightSection),
						w = param.width,
						h = param.height,
						array = $section.find('[tabindex = 0]');

					// set style for the map
					func.setStyle($section[0], {'width': screen.width + 'px', 'height': screen.height + 'px'});
					func.setStyle($mapholder[0], {'width': w + 'px', 'height': h + 'px'});
					func.setStyle($map[0], {'width': w + 'px', 'height': (h - (2 * _self.headerHeight)) + 'px'});
					func.setStyle($maproot[0], {'width': w + 'px', 'height': (h - (2 * _self.headerHeight)) + 'px'});
					$section.addClass('gcviz-sectionfs');

					// trigger the fullscreen custom binding and set state and image
					_self.isFullscreen(true);
					_self.imgFullscreen(pathSmallscreen);
					_self.fullscreenState = 1;

					// resize map ans keep the extent
					gisM.manageScreenState(map, 1000, true);

					// create keydown event to keep tab in the map section
					_self.first = array[0];
					_self.last = array[array.length - 1];
					$section.on('keydown.fs', function(event) {
						_self.manageTabbingOrder(event);
                    });
                };

				_self.manageTabbingOrder = function(evt) {
					var key = evt.which,
						shift = evt.shiftKey,
						node = evt.target,
						firstItem = _self.first,
						lastItem = _self.last;

					if (key === 9 && !shift) {
						if (node === lastItem) {
							// workaround to avoid focus shifting to the next element
							setTimeout(function() { firstItem.focus(); }, 0);
						}
					} else if (key === 9 && shift) {
						if (node === firstItem) {
							// workaround to avoid focus shifting to the previous element
							setTimeout(function() { lastItem.focus(); }, 0);
						}
					}
				};

				_self.init();
			};

			vm = new headerViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
