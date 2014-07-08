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
			'dijit/registry'
	], function($viz, ko, media, gisPrint, i18n, binding, gcvizFunc, gisM, dijit) {
		var initialize,
			printSimple,
			vm;

		initialize = function($mapElem, mapid, config) {
			// data model				
			var headerViewModel = function($mapElem, mapid, config) {
				var _self = this,
					configAbout = config.about,
					pathPrint = locationPath + 'gcviz/print/',
					$section = $viz('#section' + mapid),
					$mapholder = $viz('#' + mapid),
					$map = $viz('#' + mapid + '_holder'),
					$maproot = $viz('#' + mapid + '_holder_root'),
					$btnHelp = $mapElem.find('.gcviz-head-help'),
					$btnAbout = $mapElem.find('.gcviz-head-about'),
					$btnFull = $mapElem.find('.gcviz-head-fs'),
					map = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// tools panel settings
				_self.xheightToolsOuter = ko.observable('max-height:100px!important');
				_self.xheightToolsInner = ko.observable('max-height:100px!important');
				_self.widthheightTBholder =  ko.observable('max-height:390px!important;max-width:340px!important');

				// tooltip, text strings
				_self.tpHelp = i18n.getDict('%header-tphelp');
				_self.tpTools = i18n.getDict('%header-tptools');
				_self.tpPrint = i18n.getDict('%header-tpprint');
				_self.tpInset = i18n.getDict('%header-tpinset');
                _self.tpAbout = i18n.getDict('%header-tpabout');
                _self.tpFullScreen = i18n.getDict('%header-tpfullscreen');
				_self.tpRegScreen = i18n.getDict('%header-tpfullscreen');

				// help dialog box
				_self.lblHelpTitle = i18n.getDict('%header-help');
				_self.helpInfo1 = i18n.getDict('%header-helpdownload');
				_self.helpInfo2 = i18n.getDict('%linkopens');
				_self.helpURL = i18n.getDict('%header-urlhelp');
				_self.helpURLText = i18n.getDict('%header-helpmanual');
				_self.isHelpDialogOpen = ko.observable(false);

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

				_self.init = function() {
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

					return { controlsDescendantBindings: true };
				};

				_self.fullscreenClick = function() {
					// debounce the click to avoid resize problems
					gcvizFunc.debounceClick(function() {
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
					// Toggle the tools container
					var tc = dijit.byId('tbTools' + mapid);
					tc.toggle();
				};

				_self.helpClick = function() {
                    _self.isHelpDialogOpen(true);
                };

				_self.dialogHelpOk = function() {
					_self.isHelpDialogOpen(false);
					$btnHelp.focus();
				};

                _self.aboutClick = function() {
                    _self.isAboutDialogOpen(true);
                };

                _self.dialogAboutOk = function() {
					_self.isAboutDialogOpen(false);
					$btnAbout.focus();
				};

				_self.cancelFullScreen = function() {
					// set style back for the map
					gcvizFunc.setStyle($section[0], { 'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px' });
					gcvizFunc.setStyle($mapholder[0], { 'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px' });
					gcvizFunc.setStyle($map[0], { 'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px' });
					gcvizFunc.setStyle($maproot[0], { 'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px' });
					$section.removeClass('gcviz-sectionfs');

					// trigger the fullscreen custom binding and set state
					_self.isFullscreen(false);
					_self.fullscreenState = 0;

					// resize map and keep the extent
					gisM.manageScreenState(map, 500, false);

					// Set the toolbar container height
                    setTimeout(function() {
						_self.adjustContainerHeight();
					}, 500);

					// set focus
					$btnFull.focus();

					// remove the event that keeps tab in map section
					$section.off('keydown.fs');
				};

				_self.requestFullScreen = function() {
					// get maximal height and width from browser window and original height and width for the map
					var param = gcvizFunc.getFullscreenParam(_self.widthSection, _self.heightSection),
						w = param.width,
						h = param.height,
						array = $section.find('[tabindex = 0]');

					// set style for the map
					gcvizFunc.setStyle($section[0], { 'width': screen.width + 'px', 'height': screen.height + 'px' });
					gcvizFunc.setStyle($mapholder[0], { 'width': w + 'px', 'height': h + 'px' });
					gcvizFunc.setStyle($map[0], { 'width': w + 'px', 'height': (h - (2 * _self.headerHeight)) + 'px' });
					gcvizFunc.setStyle($maproot[0], { 'width': w + 'px', 'height': (h - (2 * _self.headerHeight)) + 'px' });
					$section.addClass('gcviz-sectionfs');

					// trigger the fullscreen custom binding and set state
					_self.isFullscreen(true);
					_self.fullscreenState = 1;

					// resize map ans keep the extent
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
					$section.on('keydown.fs', function(event) {
						_self.manageTabbingOrder(event);
                    });
                };

                _self.adjustContainerHeight = function() {
					var toolbarheight = parseInt(map.height, 10) - 15;
					_self.xheightToolsOuter('max-height:' + toolbarheight + 'px!important');
					_self.xheightToolsInner('max-height:' + toolbarheight + 'px!important');
					toolbarheight -= 25;
					_self.widthheightTBholder('max-height:' + toolbarheight + 'px!important;max-width:340px!important');
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
							setTimeout(function() { lastItem.focus(); }, 0);
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
			var node = $viz('#' + map.vIdName + '_holder').clone();

			// set the local storage then open page
			localStorage.setItem('gcvizPrintNode', node[0].outerHTML);
			window.open(template + 'defaultPrint.html');
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
