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
			getArrayLen,
			getElemValueVM,
			setElemValueVM,
			setVM,
			subscribeTo,
			getTextWidth,
			focusMap,
			padDigits,
			parseLonLat,
			timer,
			vmObject = { };

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

		getFullscreenParam = function() {
			// get maximal height and width from browser window and original height and width for the map
			var w, h,
				minWW = window.innerWidth,
				minWH = window.innerHeight;

			// calculate the width and height with the window.
			w = minWW;
			h = minWH;

			return { 'width': w, 'height': h };
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
			$viz('.gcviz-loading').progressbar({ value: false }).removeClass('gcviz-hidden');
		};

		destroyProgressBar = function() {
			$viz('.gcviz-loading').addClass('gcviz-hidden');
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

		getArrayLen = function(len) {
			var arr = [];

			len += 1;
			while (len--) {
				arr.push(len);
			}

			return arr;
		};

		getElemValueVM = function(name, elements, type) {
			var val,
				len = elements.length;

			if (len === 1) {
				val = vmObject[name][elements[0]];
			} else if (len === 2) {
				val = vmObject[name][elements[0]][elements[1]];
			} else if (len === 3) {
				val = vmObject[name][elements[0]][elements[1]][elements[2]];
			}

			if (type === 'ko') {
				val = val();
			}
			return val;
		};

		setElemValueVM = function(vm, name, element, val) {
			return vmObject[vm][name][element](val);
		};

		setVM = function(name, vm) {
			vmObject[name] = vm;
		};

		subscribeTo = function(name, vm, value, funct) {
			vmObject[name][vm][value].subscribe(funct);
		};

		// Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
		// http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
		getTextWidth = function(text, font) {
			var metric,
				canvas = document.createElement('canvas'),
				context = canvas.getContext('2d');

			context.font = font;
			metric = context.measureText(text);
			return metric.width;
		};

		focusMap = function(map) {
			document.getElementById(map.vIdName + '_holder').focus();
		};

		padDigits = function(number, digits) {
			return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
		};
		
		parseLonLat = function(input) {
	        var x, y, lonlat,
	        	ddregex = /^(-?\d{2,3}(\.\d*)?),?\s*(-?\d{2,3}(\.\d*)?)\s*$/g,
	        	dd = ddregex.exec(input),
	        	dmsregex = /(-)?(\d{2,3})([:°d|\s+])\s*([0-5][0-9])([:\'m]|\s*)(\s*([0-5][0-9])([\.,](\d+))?([\"s]|\s*))?\s*([NnWwOo])?[ |,]\s*(-)?(\d{2,3})([:°d|\s+])\s*([0-5][0-9])([:\'m]|\s*)(\s*([0-5][0-9])([\.,](\d+))?([\"s]|\s*))?\s*([NnWwOo])?/g,
				dms = dmsregex.exec(input);
	
			if (dd && dd.length == 5) {
				x = Number(dd[1]);
				y = Number(dd[3]);

				if (y < x) {
					lonlat = [y, x];
				} else {
					lonlat = [x, y];
				}
			} else if (dms) {
				x = parseDMS(dms[2], dms[4], dms[7], dms[9]);
				y = parseDMS(dms[13], dms[15], dms[18], dms[20]);

				if (dms[1]) {
					x = -x;
				}
				if (dms[12]) {
					y = -y;
				}
				
				if (dms[11] == 'N' || dms[11] == 'n' || dms[22] == 'W' || dms[22] == 'w' || dms[22] == 'O' || dms[22] == 'o') {
					if (y > 0.0) {
						y = -y;
					}
					lonlat = [y, x];
				} else if (dms[11] == 'W' || dms[11] == 'w' || dms[11] == 'O' || dms[11] == 'o' || dms[22] == 'N' || dms[22] == 'n') {
					if (x > 0.0) {
						x = -x;
					}
					lonlat = [x, y];
				} else if (y < x) {
					lonlat = [y, x];
				} else {                
					if (x > 0.0) {
						x = -x;
					}
                	lonlat = new [x, y];
				}
			}

        return lonlat;    
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
			getRandomColor: getRandomColor,
			getArrayLen: getArrayLen,
			getElemValueVM: getElemValueVM,
			setElemValueVM: setElemValueVM,
			setVM: setVM,
			subscribeTo: subscribeTo,
			getTextWidth: getTextWidth,
			focusMap: focusMap,
			padDigits: padDigits,
			parseLonLat: parseLonLat
		};
	});
}());
