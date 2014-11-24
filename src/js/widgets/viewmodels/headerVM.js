/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'media',
			'gcviz-gisprint',
			'gcviz-i18n',
			'gcviz-ko',
			'gcviz-func',
			'gcviz-gismap',
			'gcviz-vm-help'
	], function($viz, ko, media, gisPrint, i18n, binding, gcvizFunc, gisM, helpVM) {
		var initialize,
			printSimple,
			vm;

		initialize = function($mapElem, mapid, config) {
			// data model				
			var headerViewModel = function($mapElem, mapid, config) {
				var _self = this,
					configAbout = config.about,
					pathPrint = locationPath + 'gcviz/print/toporamaPrint-' + window.langext + '.html',
					pathHelpBubble = locationPath + 'gcviz/images/helpBubble.png',
					$section = $viz('#section' + mapid),
					$mapholder = $viz('#' + mapid),
					$map = $viz('#' + mapid + '_holder'),
					$maproot = $viz('#' + mapid + '_holder_root'),
					$btnAbout = $mapElem.find('.gcviz-head-about'),
					$menu = $mapElem.find('#gcviz-menu' + mapid),
					$btnFull = $mapElem.find('.gcviz-head-pop'),
					map = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					instrHeight = 36;

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// help bubble
                _self.imgHelpBubble = pathHelpBubble;

				// tools panel settings
				_self.xheightToolsOuter = ko.observable('max-height:100px!important');
				_self.xheightToolsInner = ko.observable('max-height:100px!important');

				// tooltip, text strings
				_self.tpHelp = i18n.getDict('%header-tphelp');
				_self.tpPrint = i18n.getDict('%header-tpprint');
				_self.tpInset = i18n.getDict('%header-tpinset');
                _self.tpAbout = i18n.getDict('%header-tpabout');
                _self.tpFullScreen = i18n.getDict('%header-tpfullscreen');
                _self.lblMenu = i18n.getDict('%header-tools');

				// toolbars name
				_self.legendTitle = i18n.getDict('%toolbarlegend-name');
                _self.legendAlt = i18n.getDict('%toolbarlegend-alt');
				_self.drawTitle = i18n.getDict('%toolbardraw-name');
                _self.drawAlt = i18n.getDict('%toolbardraw-alt');
				_self.navTitle = i18n.getDict('%toolbarnav-name');
                _self.navAlt = i18n.getDict('%toolbarnav-alt');
                _self.dataTitle = i18n.getDict('%toolbardata-name');
                _self.dataAlt = i18n.getDict('%toolbardata-alt');

				// about dialog box
				_self.lblAboutTitle = i18n.getDict('%header-tpabout');
				_self.isAboutDialogOpen = ko.observable(false);
				_self.aboutType = configAbout.type;

				if (_self.aboutType === 1) {
					_self.aboutInfo1 = configAbout.value;
				} else if (_self.aboutType === 2) {
					_self.aboutInfo1 = i18n.getDict('%header-aboutread');
					_self.aboutInfo2 = i18n.getDict('%linkopens');
					_self.aboutURL = configAbout.value;
					_self.aboutURLText = i18n.getDict('%header-abouttitle');
				}

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

				// tools initial setting
				_self.toolsInit = config.tools;

				_self.init = function() {
					var $menuCont = $viz('#gcviz-menu-cont' + mapid);

					// keep map size
					_self.heightSection = parseInt($section.css('height'), 10);
					_self.heightMap = parseInt($map.css('height'), 10);
					_self.widthSection = parseInt($section.css('width'), 10);
					_self.widthMap = parseInt($map.css('width'), 10);
					_self.headerHeight = parseInt($mapElem.css('height'), 10);

					// Set the toolbar container height
                    setTimeout(function() {
						_self.adjustContainerHeight();
					}, 500);

					// set the active toolbar
					$menuCont.on('accordioncreate', function(event) {
						var value,
							items = event.target.getElementsByTagName('div'),
							len = items.length;

						while (len--) {
							value = items[len].getAttribute('gcviz-exp');
							if (value === 'true') {
								$menuCont.accordion('option', 'active', len);
							}
						}

						// if expand is false toggle (open by default)
						if (!_self.toolsInit.expand) {
							// need to be in timeout. If not, doesnt work
							setTimeout(function(){
								$menu.accordion('option', 'active', false);
							}, 0);
						}
					
						$menuCont.off('accordioncreate');
					});

					// initialize full screen with magnific popup
					$btnFull.magnificPopup({
						items: {
							src: '#' + mapid,
							type: 'inline'
						},
						callbacks: {
							beforeOpen: function() {
								_self.requestFullScreen();
							},
							close: function() {
								_self.cancelFullScreen();
							},
							afterClose: function() {
								$viz('#' + mapid).removeClass('mfp-hide');
								gisM.resizeCenterMap(map, 0);
							}
						},
						key: 'map-key',
						showCloseBtn: false,
						closeOnBgClick: false,
						enableEscapeKey: false,
						alignTop: false,
						modal: false,
						mainClass: 'mfp-with-fade'
					});

					return { controlsDescendantBindings: true };
				};

				_self.showBubble = function(key, shift, keyType, id) {
					return helpVM.toggleHelpBubble(key, id);
				};

				_self.fullscreenClick = function() {
					// debounce the click to avoid resize problems
					gcvizFunc.debounceClick(function() {
						if (_self.fullscreenState === 0) {
							$btnFull.magnificPopup('close');
						} else {
							_self.fullscreenState = 0;
						}

						// remove tooltip if there (the tooltip is position before the fullscreen)
						$viz('.gcviz-tooltip').remove();
					}, 1000);
				};

				_self.printClick = function() {
					// Print the map
					// TODO this sample doent work because text, csv and cluster does not work.
					//_self.printInfo.url = 'http://geoappext.nrcan.gc.ca/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';
					//gisPrint.printMap(vmArray[mapid].map.map, _self.printInfo);

					// This is the simple print. It doesn't use esri print task
					printSimple(map, _self.printInfo.template);
				};

				_self.insetClick = function() {
					// trigger the insetVisibility custom binding (debounce the click to avoid resize problems)
					gcvizFunc.debounceClick(function() {
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
					var open = $menu.accordion('option', 'active');

					// Toggle the tools container
					if (open === 0) {
						$menu.accordion('option', 'active', false);
					} else {
						$menu.accordion('option', 'active', 0);
					}
				};

				_self.helpClick = function() {
                    helpVM.toggleHelp();
                };

                _self.aboutClick = function() {
                    _self.isAboutDialogOpen(true);
                };

                _self.dialogAboutOk = function() {
					_self.isAboutDialogOpen(false);
					$btnAbout.focus();
				};

				_self.cancelFullScreen = function() {
					var sectH = _self.heightSection,
						sectW = _self.widthSection,
						mapH = _self.heightMap,
						mapW = _self.widthMap;

					// set style back for the map
					gcvizFunc.setStyle($mapholder[0], { 'width': sectW + 'px', 'height': (sectH - instrHeight) + 'px' }); // remove the keyboard instruction height
					gcvizFunc.setStyle($map[0], { 'width': mapW + 'px', 'height': mapH + 'px' });
					gcvizFunc.setStyle($maproot[0], { 'width': mapW + 'px', 'height': mapH + 'px' });

					// trigger the fullscreen custom binding and set state
					_self.isFullscreen(false);
					_self.fullscreenState = 0;

					// resize map and keep the extent
					gisM.manageScreenState(map, 500, false);

					// set the toolbar container height and focus
                    setTimeout(function() {
						_self.adjustContainerHeight();
						$btnFull.focus();
					}, 500);

					// remove the event that keeps tab in map section
					$mapholder.off('keydown.fs');

					// need to set it to 40px. Link to the bug where we have a workaround in the request
					// full screen function.
					gcvizFunc.setStyle($viz('#ovmapcont' + mapid)[0], { 'bottom': '40px' });
				};

				_self.requestFullScreen = function() {
					// get maximal height and width from browser window and original height and width for the map
					var param = gcvizFunc.getFullscreenParam(),
						w = param.width,
						h = param.height,
						array = $mapholder.find('[tabindex = 0]'),
						height =  (h - (2 * _self.headerHeight));

					// set style for the map
					gcvizFunc.setStyle($mapholder[0], { 'width': w + 'px', 'height': h + 'px' });
					gcvizFunc.setStyle($map[0], { 'width': w + 'px', 'height': height + 'px' });
					gcvizFunc.setStyle($maproot[0], { 'width': w + 'px', 'height': height + 'px' });

					// trigger the fullscreen custom binding and set state
					_self.isFullscreen(true);
					_self.fullscreenState = 1;

					// resize map and keep the extent
					gisM.manageScreenState(map, 1000, true);

					// Set the toolbar container height
                    setTimeout(function() {
						_self.adjustContainerHeight();

						// set focus (cant cache because the class doesn't exist at init)
						// put in a timeout because FireFox wont focus if not.
						$mapElem.find('.gcviz-head-reg').focus();
					}, 500);

					// create keydown event to keep tab in the map section
					_self.first = array[0];
					_self.last = array[array.length - 1];
					$mapholder.on('keydown.fs', function(event) {
						_self.manageTabbingOrder(event);
                    });

                    // this is a workaround. The div for the overview map change when
                    // we first got to full screen. To correct this we reset the bottom value.
                    // after the first time it is ok. In the future we can trap the first full
                    // screen and then do not do this. Or we can try to find the problem.
                    gcvizFunc.setStyle($viz('#ovmapcont' + mapid)[0], { 'bottom': '40px' });
                    
                    var a = $('ui-dialog').clone();
                    $('.mfp-content').append(a);
                    $('ui-dialog').remove();
                };

                _self.adjustContainerHeight = function() {
					var toolbarheight = parseInt(map.height, 10) - 5;
					_self.xheightToolsOuter('max-height:' + toolbarheight + 'px!important');
					_self.xheightToolsInner('max-height:' + (toolbarheight - instrHeight) + 'px!important'); // remove the keyboard instruction height
                };

				_self.manageTabbingOrder = function(evt) {
					var key = evt.which,
						shift = evt.shiftKey,
						node = evt.target.className,
						firstClass = _self.first.className,
						lastClass = _self.last.className,
						firstItem = _self.first,
						lastItem = _self.last;

					if (key === 9 && !shift) {
						if (node === lastClass) {
							// workaround to avoid focus shifting to the next element
							setTimeout(function() { firstItem.focus(); }, 0);
						}
					} else if (key === 9 && shift) {
						if (node === firstClass) {
							// workaround to avoid focus shifting to the previous element
							setTimeout(function() {
								lastItem.focus();
							}, 0);

							// still focus on previous item. If not Chrome will freeze
							if (window.browser === 'Chrome') {
								lastItem.focus();
							}
						}
					}
				};

				_self.init();
			};

			vm = new headerViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		printSimple = function(map, template) {
			var center = {},
				mapid = map.vIdName,
				node = $viz('#' + mapid + '_holder'),
				arrow = $viz('#arrow' + mapid),
				scale = $viz('#scaletool' + mapid),
				scalebar = $viz('#scalebar' + mapid),
				height = node.css('height'),
				width = node.css('width');

			// get center map
			center.point = gisM.getMapCenter(map);

			// set map size to fit the print page
			gcvizFunc.setStyle(node[0], { 'width': '10in', 'height': '5.25in' });
			gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': '10in', 'height': '5.25in' });

			// resize map and center to keep scale
			center.interval = 1500;
			gisM.resizeCenterMap(map, center);

			// open the print page here instead of timemeout because if we do so, it will act as popup.
			// It needs to be in a click event to 
			window.open(template);

			// set the local storage
			setTimeout(function() {
				localStorage.setItem('gcvizPrintNode', node[0].outerHTML);
				localStorage.setItem('gcvizArrowNode', arrow[0].outerHTML);
				localStorage.setItem('gcvizScaleNode', scale[0].outerHTML);
				localStorage.setItem('gcvizScalebarNode', scalebar[0].outerHTML);
			}, 3500);

			// set map size to previous values
			setTimeout (function() {
				gcvizFunc.setStyle(node[0], { 'width': width, 'height': height });
				gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': width, 'height': height });
				gisM.resizeCenterMap(map, center);
			}, 7000);
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
