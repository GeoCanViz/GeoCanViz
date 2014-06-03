/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Globals functions
 */
(function () {
	'use strict';
	define(['jquery-private'
	], function($viz) {
		var debounce,
			debounceClick,
			setStyle,
			getFullscreenParam,
			checkObjectValue,
			getUUID,
			setProgressBar,
			destroyProgressBar,
			checkMatch,
			getRandomColor,
			timer;

		debounce = function(func, threshold, execAsap) {
			var timeout;

			return function debounced () {
				var obj = this,
					args = arguments;

				function delayed () {
					if (!execAsap) {
						func.apply(obj, args);
					}
					timeout = null;
				}

				if (timeout) {
					clearTimeout(timeout);
				}
				else if (execAsap) {
					func.apply(obj, args);
				}

				timeout = setTimeout(delayed, threshold || 100);
			};
		};

		debounceClick = function(func, threshold) {
			if (timer) {
				clearTimeout(timer);
			}

			timer = setTimeout(func, threshold);
		};

		setStyle = function(elem, propertyObject) {
			for (var property in propertyObject) {
				if (propertyObject.hasOwnProperty(property)) {
					elem.style[property] = propertyObject[property];
				}
			}
		};

		getFullscreenParam = function(width, height) {
			// get maximal height and width from browser window and original height and width for the map
			var minWW = window.innerWidth,
				minWH = window.innerHeight,
				w, h, ratio;

			// calculate the width, height and ratio with the window
			w = minWW - 50;
			ratio = (w / width);
			h = height * ratio;

			// if the minimum window width is smaller then map height,
			// use height as starting point to calculate dimension
			if (minWH < h) {
				h = minWH - 50;
				ratio = (h / height);
				w = width * ratio;
			}

			return { 'width': w, 'height': h, 'ratio': ratio };
		};

		checkObjectValue = function(obj, key, value) {
			var len,
				myobject;

			// check if it is an array
			if (typeof obj.length !== 'undefined') {
				len = obj.length;

				while (len--) {
					myobject = obj[len];
					if (myobject[key] !== value) { return false; }
				}
			}

			return true;
		};

		// http://slavik.meltser.info/?p=142
		getUUID = function() {
			function _p8(s) {
				var p = (Math.random().toString(16) + '000000000').substr(2,8);
				return s ? '-' + p.substr(0,4) + '-' + p.substr(4,4) : p ;
			}
			return _p8() + _p8(true) + _p8(true) + _p8();
		};

		setProgressBar = function(label) {
			$viz('.gcviz-loadingLabel').text(label);
			$viz('.gcviz-loading').progressbar({ value: false });
		};

		destroyProgressBar = function() {
			$viz('.gcviz-loadingLabel').text('');
			$viz('.gcviz-loading').progressbar('destroy');
		};

		checkMatch = function(array, val) {
			var item,
				len = array.length;

			while (len--) {
				item = array[len];
				if (item.toUpperCase() === val.toUpperCase()) {
					return true;
				}
			}

			return false;
		};

		getRandomColor = function() {
			function c() {
				return Math.floor(Math.random() * 256);
			}
			return [c(), c(), c() ,255];
		};

		return {
			debounce: debounce,
			debounceClick: debounceClick,
			setStyle: setStyle,
			getFullscreenParam: getFullscreenParam,
			checkObjectValue: checkObjectValue,
			getUUID: getUUID,
			setProgressBar: setProgressBar,
			destroyProgressBar: destroyProgressBar,
			checkMatch: checkMatch,
			getRandomColor: getRandomColor
		};
	});
}());
