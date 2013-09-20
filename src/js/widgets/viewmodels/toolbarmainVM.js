/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar main view model widget
 */
/* global ActiveXObject: false */
(function() {
	'use strict';
	define([
		'jquery',
		'knockout',
		'gcviz-i18n'
	], function($, ko, i18n) {
		var initialize;
		
		initialize = function($mapElem, mapid) {
			
			// data model				
			var toolbarmainViewModel = function($mapElem, mapid) {
				var _self = this,
					pathFullscreen = 'dist/images/mainFullscreen.png',
					pathSmallscreen = 'dist/images/mainSmallscreen.png',
					pathTools = 'dist/images/mainTools.png',
					pathHelp = 'dist/images/mainHelp.png',
					$section = $('#section' + mapid),
					$mapholder = $('#' + mapid),
					$map = $('#' + mapid + '_0');
				
				_self.counter = ko.observable(0);
				
				// images path
				_self.imgFullscreen = ko.observable(pathFullscreen);
				_self.imgTools = pathTools;
				_self.imgHelp = pathHelp;
				
				_self.errorHandler = function(error) {
					console.log('error toolbar main view model: ', error);
				};
		
				_self.init = function() {
					_self.heightSection = $section.css('height');
					_self.widthSection = $section.css('width');
					_self.heightMap = $map.css('height');
					_self.widthMap = $map.css('width');
					
					$(document).on('keyup', function(e) {
						if (e.keyCode === 27) {
							_self.cancelFullScreen(document, mapid);
							_self.imgFullscreen(pathFullscreen);
						}
					});
						
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
				
				_self.toolsClick = function() {
					var tool = $mapholder.find('.toolbars-holder');
					if (tool.hasClass('hidden')) {
						tool.removeClass('hidden');
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
					} else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
						var wscript = new ActiveXObject('WScript.Shell');
						if (wscript !== null) {
							wscript.SendKeys('{F11}');
						}
					}
					
					// set style
					$mapholder.css({'width': _self.widthMap, 'height': _self.heightMap});
					$section.css({'width': _self.widthSection, 'height': _self.heightSection});
					$map.css({'width': _self.widthMap, 'height': _self.heightMap});
				};

				_self.requestFullScreen = function(el, mapid) {
					// Supports most browsers and their versions.
					var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

					if (requestMethod) { // Native full screen.
						requestMethod.call(el);
					} else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
						var wscript = new ActiveXObject('WScript.Shell');
							if (wscript !== null) {
								wscript.SendKeys('{F11}');
							}
					}
					
					// set style
					$mapholder.css({'width': '100%', 'height': '93%'});
					$section.css({'width': '100%', 'height': '100%'});
					$map.css({'width': '100%', 'height': '100%'});
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
