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
			'gcviz-gisgeo',
			'gcviz-gislegend',
			'gcviz-gisdatagrid',
			'gcviz-gisgeo',
			'gcviz-gisnav'
	], function($viz, ko, gcvizFunc, i18n, gisgeo, gisLeg, gisDG, gisGeo, gisNav) {
		var initialize,
			showGrid,
			gridId,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbarextractViewModel = function($mapElem, mapid) {
				var _self = this,
					item, lenQuery,
					clickNTS,
					len = config.items.length,
					$menu = $viz('#gcviz-menu' + mapid),
					$container = $viz('#' + mapid + '_holder_layers'),
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// tooltip and label
				_self.btnLabel = i18n.getDict('%toolbarextract-btnget');

				// set the grid id if specified
				gridId = config.grid;

				// hold the larger scale. It will help to do the reprojection on map-extent
				// only when we need it. Hold the map scale as well.
				_self.largeScale = -1;
				_self.mapScale = 0;

				// hold the map wkid
				_self.mapWkid = mymap.vWkid;

				// array of user layer. Loop trough the array and add observables
				// hrefData will be set true when extend is good and set href observable
				while (len--) {
					item = config.items[len];

					// loop trought query and set the href observable
					lenQuery = item.query.length;
					while (lenQuery--) {
						item.query[lenQuery].hrefData = ko.observable('');
					}

					// set the is ready observable to know if we are in the scale range
					item.isReady = ko.observable(false);

					// set the larger scale
					if (_self.largeScale < item.scale || item.scale === -1) {
						_self.largeScale = item.scale;
					}
				}
				_self.itemsArray = ko.observableArray(config.items);

				// variable to hold the url for nts selection
				_self.hrefNTS = '';

				// url for select nts button
				_self.urlNTS = i18n.getDict('%gisurlnts');

				// WCAG
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 50, max: 130 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.isWCAG = ko.observable(false);
				_self.isDialogWCAG = ko.observable(false);
				_self.wcagok = false;

				_self.init = function() {
					mymap.on('extent-change', function(values) {
						var len,
							largeScale = _self.largeScale, 
							extent = values.extent;

						// set map scale. It will be use in the callback function
						_self.mapScale = mymap.getScale();

						if (_self.mapScale <= largeScale || largeScale === -1) {
							gisgeo.projectCoords([[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]], _self.mapWkid, 4326, _self.createURL);
						} else {
							len = _self.itemsArray().length;
							while (len--) {
								_self.itemsArray()[len].isReady(false);
							}
						}
					});

					return { controlsDescendantBindings: true };
				};

				_self.createURL = function(extent) {
					var item, query, lenQuery, type,
						itemScale,
						len = _self.itemsArray().length;

					while (len--) {
						item = _self.itemsArray()[len];
						itemScale = item.scale;
						lenQuery = item.query.length;

						if (_self.mapScale <= itemScale || itemScale === -1) {
							item.isReady(true);

							// loop trought query to set href
							while (lenQuery--) {
								query = item.query[lenQuery];
								type = query.type;

								if (type === 'extent') {
									_self.setQueryExtent(query, item.url, query.param, extent);
								} else if (type === 'nts') {
									_self.setQueryNTS(query, item.url, query.param);
								}
							}
						} else {
							item.isReady(false);

							// loop trought query for the item to reset href
							while (lenQuery--) {
								item.query[lenQuery].hrefData('');
							}
						}
					}
				};

				_self.setQueryExtent = function(item, url, query, extent) {
					var min = extent[0],
						max = extent[1],
						extentVal = max.x + ',' + max.y + ','+ min.x + ',' + min.y;

					item.hrefData(url + query.replace('XXX', extentVal));
				};

				_self.setQueryNTS = function(item, url, query) {
					item.hrefData(url + query);
				};

				_self.clickNTS = function(hrefData) {
					// set the href
					_self.hrefNTS = hrefData;

					// close menu
					$menu.accordion('option', 'active', false);

					// set event for the toolbar
					$menu.on('accordionbeforeactivate', function() {
						$menu.off();
						_self.endNTS();
					});

					// check if WCAG mode is enable, if so use dialog box instead)
					if (!_self.isWCAG()) {
						// Set the cursor
						$container.css('cursor', '');
						$container.addClass('gcviz-nav-cursor-pos');

						// remove popup event
						gisDG.removeEvtPop();

						// get user to click on map and capture event
						clickNTS = mymap.on('click', function(evt) {
							gisGeo.projectPoints([evt.mapPoint], 4326, _self.selectNTS);
						});
					} else {
						_self.isDialogWCAG(true);
					}

					// focus the map. We need to specify this because when you use the keyboard to
					// activate the tool, the focus sometimes doesnt go to the map.
					gcvizFunc.focusMap(mymap);
				};

				_self.dialogWCAGOk = function() {
					var x = _self.xValue() * -1,
						y = _self.yValue();

					gisGeo.projectCoords([[x, y]], mymap.vWkid, 4326, _self.selectNTS);
					_self.isDialogWCAG(false);
					_self.wcagok = true;
				};

				_self.dialogWCAGCancel = function() {
					_self.isDialogWCAG(false);
				};

				_self.dialogWCAGClose = function() {
					_self.isDialogWCAG(false);

					// if not ok press, open tools
					if (!_self.wcagok) {
						$menu.accordion('option', 'active', 0);
						_self.endNTS();
					}
				};

				_self.selectNTS = function(outPoint) {
					var lati = outPoint[0].y,
						longi = outPoint[0].x;

					// Get the NTS location using a deferred object and listen for completion
					gisNav.getNTS(lati, longi, _self.urlNTS)
						.done(function(data) {
							var name,
								nts = data.nts;

							if (nts.length === 2) {
								name = nts[1].properties.identifier;
							} else if (nts.length === 1) {
								name = nts[0].properties.identifier;
							}

						// open the link
						window.open(_self.hrefNTS.replace('XXX', name), '_blank');
					});

					_self.endNTS();
				};

				_self.endNTS = function() {
					// Reset cursor
					$container.removeClass('gcviz-nav-cursor-pos');

					// set popup event
					gisDG.addEvtPop();

					// remove click event
					if (typeof clickNTS !== 'undefined') {
						clickNTS.remove();
					}

					$menu.on('accordionactivate', function() {
						$menu.off('accordionactivate');

						// bug with jQueryUI, focus does not work when menu open
						setTimeout(function() {
							// TODO: focus last active tool

						}, 1000);
					});

					// open menu
					$menu.accordion('option', 'active', 0);
				};

				_self.init();
			};

			vm = new toolbarextractViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		showGrid = function(map, val) {
			var chk,
				control = $viz('#checkbox' + gridId)[0];
			
			// to see if control exist
			if (typeof control !== 'undefined') {
				// if layer is already selected, do nothing
				chk = control.checked;
				if (!chk) {
					gisLeg.setLayerVisibility(map, gridId, val);
				}
			}
		};

		return {
			initialize: initialize,
			showGrid: showGrid
		};
	});
}).call(this);
