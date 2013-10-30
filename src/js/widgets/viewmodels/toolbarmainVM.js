/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar main view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define([
		'knockout',
		'gcviz-i18n',
		'gcviz-ko'
	], function(ko, i18n, binding) {
		var initialize;
		
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
					$map = $('#' + mapid + '_0');
				
				_self.counter = ko.observable(0);
				
				// images path
				_self.imgFullscreen = ko.observable(pathFullscreen);
				_self.imgShowInset = pathShowInset;
				_self.imgTools = pathTools;
				_self.imgHelp = pathHelp;
				
				// enable/disable
				_self.enableViewInset = ko.observable(true);
				
				// tooltip
				_self.tpHelp = i18n.getDict('%toolbarmain-tphelp');
				_self.tpTools = i18n.getDict('%toolbarmain-tptools');
				_self.tpInset = i18n.getDict('%toolbarmain-tpinset');
				_self.tpFullScreen = i18n.getDict('%toolbarmain-tpfullscreen');

				_self.init = function() {
					// keep map size
					_self.heightSection = $section.css('height');
					_self.widthSection = $section.css('width');
					_self.heightMap = $map.css('height');
					_self.widthMap = $map.css('width');
					
					// keep state
					_self.insetState = '';
				
					// full screen event
					$section[0].addEventListener('fullscreenchange', function () {
						if (!document.fullscreen) {
							_self.cancelFullScreen(document, mapid);
							_self.imgFullscreen(pathFullscreen);
						}
					}, false);
 
					$section[0].addEventListener('mozfullscreenchange', function () {
						if (!document.mozFullScreen) {
							_self.cancelFullScreen(document, mapid);
							_self.imgFullscreen(pathFullscreen);
						}
					}, false);
 
					$section[0].addEventListener('webkitfullscreenchange', function () {
						if (!document.webkitIsFullScreen) {
							_self.cancelFullScreen(document, mapid);
							_self.imgFullscreen(pathFullscreen);
						}
					}, false);

					return { controlsDescendantBindings: true };
				};
					
				_self.fullscreenClick = function() {
					
					var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen);

					if (isInFullScreen) {
						_self.cancelFullScreen(document, mapid);
						_self.imgFullscreen(pathFullscreen);
					} else {
						_self.requestFullScreen($section[0], mapid);
						_self.imgFullscreen(pathSmallscreen);
					}
				};
				
				_self.insetClick = function(force) {
					var tool = $mapholder.find('.gcviz-inset' + mapid);
					if (force === 'hidden') {
						tool.addClass('hidden');
					} else if (tool.hasClass('hidden')) {
						tool.removeClass('hidden');
					} else {
						tool.addClass('hidden');
					}
				};
				
				_self.toolsClick = function() {
					var tool = $mapholder.find('.gcviz-tbholder');
					if (tool.hasClass('hidden')) {
						tool.removeClass('hidden');
						
						// set focus on the first element
						$section.find('.dijitTitlePaneTitleFocus')[0].focus();
					} else {
						tool.addClass('hidden');
					}
				};
				
				_self.helpClick = function() {
					_self.counter(_self.counter() + 1);
					alert(i18n.getDict('%toolbarmain-help') + ': ' + _self.counter());
				};
				
				_self.cancelFullScreen = function(el, mapid) {
					var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen;
					
					if (requestMethod) { // cancel full screen.
						requestMethod.call(el);
					}

					// set style
					$section.css({'width': _self.widthSection, 'height': _self.heightSection});
					$mapholder.css({'width': _self.widthSection, 'height': _self.heightSection});
					$map.css({'width': _self.widthMap, 'height': _self.heightMap});
					
					// set back inset state and enable button
					_self.insetClick(_self.insetState);
					_self.enableViewInset(true);
				};

				_self.requestFullScreen = function(el, mapid) {
					
					// supports most browsers and their versions
					var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

					if (requestMethod) { // Native full screen.
						requestMethod.call(el);
					}
					
					// set style
					el.setAttribute('style','width: 100%; height: 100%;');
					el.getElementsByClassName('gcviz')[0].setAttribute('style','width: 100%; height: 93%;');
					el.getElementsByClassName('gcviz-map')[0].setAttribute('style','width: 100%; height: 100%;');
					
					// hide inset
					if ($mapholder.find('.gcviz-inset' + mapid).hasClass('hidden')) {
						_self.insetState = 'hidden';
					} else {
						_self.insetState = '';
					}
					_self.insetClick('hidden');
					
					// disable show inset button
					_self.enableViewInset(false);
				};
				
				_self.init();
			};
			ko.applyBindings(new toolbarmainViewModel($mapElem, mapid), $mapElem[0]); // This makes Knockout get to work
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);
