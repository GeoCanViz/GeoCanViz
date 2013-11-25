/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar main view model widget
 */
/* global mapArray: false, locationPath: false, tbHeight: false */
(function() {
	'use strict';
	define([
		'knockout',
		'gcviz-i18n',
		'gcviz-ko',
		'gcviz-func',
		'gcviz-gismap'
	], function(ko, i18n, binding, func, gisM) {
		var initialize,
			vm;
		
		initialize = function($mapElem, mapid) {
			
			// data model				
			var toolbarmainViewModel = function($mapElem, mapid) {
				var _self = this,
					pathFullscreen = locationPath + 'gcviz/images/mainFullscreen.png',
					pathShowInset = locationPath + 'gcviz/images/mainShowInset.png',
					pathSmallscreen = locationPath + 'gcviz/images/mainSmallscreen.png',
					pathTools = locationPath + 'gcviz/images/mainTools.png',
					pathHelp = locationPath + 'gcviz/images/mainHelp.png',
					$section = $('#section' + mapid),
					$mapholder = $('#' + mapid),
					$map = $('#' + mapid + '_holder'),
					$maproot = $('#' + mapid + '_holder_root');

				// images path
				_self.imgFullscreen = ko.observable(pathFullscreen);
				_self.imgShowInset = pathShowInset;
				_self.imgTools = pathTools;
				_self.imgHelp = pathHelp;
				
				// tooltip
				_self.tpHelp = i18n.getDict('%toolbarmain-tphelp');
				_self.tpTools = i18n.getDict('%toolbarmain-tptools');
				_self.tpInset = i18n.getDict('%toolbarmain-tpinset');
				_self.tpFullScreen = i18n.getDict('%toolbarmain-tpfullscreen');
				
				// fullscreen
				_self.isFullscreen = ko.observable(false);
				_self.isInsetVisible = ko.observable(true);
				_self.insetState = true;
				_self.fullscreenState = 0;
				
				_self.init = function() {
					// keep map size
					_self.heightSection = parseInt($section.css('height'), 10);
					_self.widthSection = parseInt($section.css('width'), 10);
					_self.heightMap = parseInt($map.css('height'), 10);
					_self.widthMap = parseInt($map.css('width'), 10);
					tbHeight = parseInt($mapElem.css('height'), 10);
         
					return { controlsDescendantBindings: true };
				};
					
				_self.fullscreenClick = function() {
					if (_self.fullscreenState) {
						_self.cancelFullScreen();
					} else {
						_self.requestFullScreen();
					}
				};
				
				_self.insetClick = function() {
					// trigger the insetVisibility custom binding
					_self.insetState = !_self.insetState;
					_self.isInsetVisible(_self.insetState);
				};
				
				_self.toolsClick = function() {
					var tool = $mapholder.find('.gcviz-tbholder');
					if (tool.hasClass('gcviz-hidden')) {
						tool.removeClass('gcviz-hidden');
						
						// set focus on the first element
						$section.find('.dijitTitlePaneTitleFocus')[0].focus();
					} else {
						tool.addClass('gcviz-hidden');
					}
				};
				
				_self.helpClick = function() {
					alert(i18n.getDict('%toolbarmain-help'));
				};
				
				_self.cancelFullScreen = function() {
					// set style back for the map
					func.setStyle($section[0], {'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px'});
					func.setStyle($mapholder[0], {'width': _self.widthSection + 'px', 'height': _self.heightSection + 'px'});
					func.setStyle($map[0], {'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px'});
					func.setStyle($maproot[0], {'width': _self.widthMap + 'px', 'height': _self.heightMap + 'px'});
					$section.removeClass('gcviz-sectionfs');
					
					// trigger the fullscreen custom binding and set state and image
					_self.isFullscreen(false);
					_self.imgFullscreen(pathFullscreen);
					_self.fullscreenState = 0;
					
					// resize map and keep the extent
					gisM.manageScreenState(mapArray[mapid], 500, false);
				};

				_self.requestFullScreen = function() {				
					// get maximal height and width from browser window and original height and width for the map
					var param = func.getFullscreenParam(_self.widthSection, _self.heightSection),
						w = param.width,
						h = param.height;
					
					// set style for the map
					func.setStyle($section[0], {'width': screen.width + 'px', 'height': screen.height + 'px'});
					func.setStyle($mapholder[0], {'width': w + 'px', 'height': h + 'px'});
					func.setStyle($map[0], {'width': w + 'px', 'height': (h - (2 * tbHeight)) + 'px'});
					func.setStyle($maproot[0], {'width': w + 'px', 'height': (h - (2 * tbHeight)) + 'px'});
					$section.addClass('gcviz-sectionfs');
					
					// trigger the fullscreen custom binding and set state and image
					_self.isFullscreen(true);
					_self.imgFullscreen(pathSmallscreen);
					_self.fullscreenState = 1;
					
					// resize map ans keep the extent
					gisM.manageScreenState(mapArray[mapid], 1000, true);
				};
				
				_self.init();
			};
			
			vm = new toolbarmainViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
