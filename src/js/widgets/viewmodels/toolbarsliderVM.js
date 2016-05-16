/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar slider view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n'
	], function($viz, ko, i18n) {
		var initialize,
			vm = {};

		initialize = function($mapElem, mapid, config) {

			// data model
			var toolbarSliderViewModel = function($mapElem, mapid) {
				var _self = this,
					mapVM;

				_self.init = function() {
                    // there is a problem with the define. The gcviz-vm-map is not able to be set.
    				// We set the reference to gcviz-vm-map (hard way)
    				require(['gcviz-vm-map'], function(vmMap) {
                        vmMap.startTimeSlider(mapid, config);
    				});


					return { controlsDescendantBindings: true };
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new toolbarSliderViewModel($mapElem, mapid);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
