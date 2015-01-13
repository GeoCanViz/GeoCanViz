/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar data download and extraction view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-func',
			'gcviz-i18n',
			'gcviz-gisgeo'
	], function($viz, ko, gcvizFunc, i18n, gisgeo) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbarextractViewModel = function($mapElem, mapid) {
				var _self = this,
					len = config.items.length,
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// tooltip and label
				_self.btnLabel = i18n.getDict('%toolbarextract-btnget');

				// hold the larger scale. It will help to do the repojection on map-extent
				// only when we need it. Hold the map scale as well.
				_self.largeScale = 0;
				_self.mapScale = 0;

				// hold the map wkid
				_self.mapWkid = mymap.vWkid;

				// array of user layer. Loop trough the array and add observables
				// hrefData will be set true when extend is good and set href observable
				while (len--) {
					config.items[len].hrefData = ko.observable('');
					config.items[len].isReady = ko.observable(false);
					
					if (_self.largeScale < config.items[len].scale) {
						_self.largeScale = config.items[len].scale;
					}
				}
				_self.itemsArray = ko.observableArray(config.items);

				_self.init = function() {
					mymap.on('extent-change', function(values) {
						var extent = values.extent;

						// set map scale. It will be use in the callback function
						_self.mapScale = mymap.getScale();

						if (_self.mapScale <= _self.largeScale) {
							gisgeo.projectCoords([[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]], _self.mapWkid, 4326, _self.createURL);
						}
					});

					return { controlsDescendantBindings: true };
				};

				_self.createURL = function(extent) {
					var item, query, type,
						scale = _self.mapScale,
						len = _self.itemsArray().length;

					while (len--) {
						item = _self.itemsArray()[len];

						if (scale <= item.scale) {
							item.isReady(true);
							
							query = item.query;
							type = query.type;
							if (type === 'extent') {
								_self.setQueryExtent(item, query.param, extent);
							} else if (type === 'nts') {
								_self.setQueryNTS(item, query.param);
							}
						} else {
							item.isReady(false);
							item.hrefData('');
						}
					}
				};

				_self.setQueryExtent = function(item, query, extent) {
					var min = extent[0],
						max = extent[1],
						extentVal = max.x + ',' + max.y + ','+ min.x + ',' + min.y;

					item.hrefData(item.url + query.replace('XXX', extentVal));
				};

				_self.setQueryNTS = function(item, query) {
					item.hrefData(item.url + query.replace('XXX', '031g02'));
				};

				_self.init();
			};

			vm = new toolbarextractViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
