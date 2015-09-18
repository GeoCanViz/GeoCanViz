/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gisgeo',
			'gcviz-gisnav'
	], function($viz, ko, i18n, gcvizFunc, gisGeo, gisNav) {
		var initialize,
			endGetCoordinates,
			vm = {};

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
					mapVM,
					ovMapWidget,
					clickPosition,
					geolocation = config.geolocation,
					overview = config.overview,
					scaledisplay = config.scaledisplay.enable,
					inMapField = $mapElem.find('#inGeoLocation' + mapid),
					btnClickMap = $mapElem.find('#btnClickMap' + mapid),
					$container = $viz('#' + mapid + '_holder_layers'),
					$ovMap = $viz('#ovmapcont' + mapid),
					$scaleMap = $viz('#scaletoolmap' + mapid),
					$scaleMapSpan = $scaleMap.children()[0],
					$menu = $viz('#gcviz-menu' + mapid),
					$panel = $viz('#gcviz-menu-cont' + mapid),
					$posDiag = $mapElem.find('#gcviz-pos' + mapid),
					autoCompleteArray = [{ minx: 0 , miny: 0, maxx: 0, maxy: 0, title: 'ddd' }];

				// there is a problem with the define. The gcviz-vm-map is not able to be set.
				// We set the reference to gcviz-vm-map (hard way)
				require(['gcviz-vm-map'], function(vmMap) {
					mapVM = vmMap;
				});

				// viewmodel mapid to be access in tooltip and wcag custom binding
				_self.mapid = mapid;

				// know if overview widget has been started
				_self.OVMapStart = false;

				// get language code for scale formating
				_self.langCode = i18n.getDict('%lang-code');
				_self.langSep = _self.langCode === 'en' ? ',' : ' ';

				// tooltips, text strings and other things from dictionary
				_self.cancel = i18n.getDict('%cancel');
				_self.close = i18n.getDict('%close');
				_self.cursorTarget = i18n.getDict('%cursor-target');
				_self.geoLocLabel = i18n.getDict('%toolbarnav-lblgeoloc');
				_self.geoLocUrl = i18n.getDict('%gisurllocate');
				_self.OVLabel = i18n.getDict('%toolbarnav-lblov');
				_self.OVDisplayLabel = i18n.getDict('%toolbarnav-lblovdisplay');
				_self.infoLabel = i18n.getDict('%toolbarnav-lblinfo');
				_self.info = i18n.getDict('%toolbarnav-info');
				_self.infoAltitude = i18n.getDict('%toolbarnav-infoaltitude');
				_self.infoDecDeg = i18n.getDict('%toolbarnav-infodecdeg');
				_self.infoDMS = i18n.getDict('%toolbarnav-infodms');
				_self.infoLat = i18n.getDict('%lat');
				_self.infoLong = i18n.getDict('%long');
				_self.infoNTS = i18n.getDict('%toolbarnav-infonts');
				_self.infoTopoCoord = i18n.getDict('%toolbarnav-infotopocoord');
				_self.infoUTM = i18n.getDict('%toolbarnav-infoutm');
				_self.infoUTMeast = i18n.getDict('%toolbarnav-infoutmeast');
				_self.infoUTMnorth = i18n.getDict('%toolbarnav-infoutmnorth');
				_self.infoUTMz = i18n.getDict('%toolbarnav-infoutmz');
				_self.insKeyboard = i18n.getDict('%toolbarnav-inskeyboard');
				_self.tpGetLocInfo = i18n.getDict('%toolbarnav-info');
				_self.tpOverview = i18n.getDict('%toolbarnav-ovdrag');
				_self.lblWest = i18n.getDict('%west');
				_self.lblLocTitle = i18n.getDict('%toolbarnav-info');
				_self.lblScale = ko.observable(i18n.getDict('%toolbarnav-scale'));
				_self.ScaleLabel = _self.lblScale();
				_self.zoomGrp = i18n.getDict('%toolbarnav-zoomgrp');
				_self.mapInfoGrp = i18n.getDict('%toolbarnav-mapinfogrp');
				_self.zoomScaleMin = i18n.getDict('%toolbarnav-zoomscalemin');
				_self.zoomScaleMax = i18n.getDict('%toolbarnav-zoomscalemax');
				_self.zoomScale = i18n.getDict('%toolbarnav-zoomscale');
				_self.zoomScalePre = i18n.getDict('%toolbarnav-scalepre');
				_self.zoomScaleDyna = i18n.getDict('%toolbarnav-zoomscaledyna');

				// WCAG
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.xValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 150 } } });
				_self.yValue = ko.observable().extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.isWCAG = ko.observable(false);
				_self.isDialogWCAG = ko.observable(false);
				_self.wcagok = false;

				// autocomplete default
				_self.defaultAutoComplText = i18n.getDict('%toolbarnav-geolocsample');
				_self.geoLocSample = i18n.getDict('%toolbarnav-geolocsample');

				// overviewmap checked to see if user wants it on map
				_self.isOVShowMap = ko.observable(false);

				// observables for localisation info window
				_self.infoLatDD = ko.observable();
				_self.infoLatDMS = ko.observable();
				_self.infoLongDD = ko.observable();
				_self.infoLongDMS = ko.observable();
				_self.isToolsOpen = ko.observable(false);
				_self.spnAltitude = ko.observable();
				_self.spnNTS250 = ko.observable();
				_self.spnNTS50 = ko.observable();
				_self.spnUTMzone = ko.observable();
				_self.spnUTMeast = ko.observable();
				_self.spnUTMnorth = ko.observable();
				_self.isLocDialogOpen = ko.observable(false);

				// url for position info box
				_self.urlNTS = i18n.getDict('%gisurlnts');
				_self.urlUTM = i18n.getDict('%gisurlutm');
				_self.urlAlti = i18n.getDict('%gisurlalti');

				// projection objects
				_self.outSR = gisGeo.getOutSR(config.mapwkid);

				// set active tool
				_self.activeTool = ko.observable('');

				_self.init = function() {
					_self.theAutoCompleteArray = ko.observableArray(autoCompleteArray);

					// See if user wanted an overview map. If so, initialize it here
					if (overview.enable) {
						ovMapWidget = mapVM.setOverviewMap(mapid, overview);

						// event to know when the panel is open for the first time to start
						// the overview map
						$panel.on('accordionactivate', function(event, ui) {
							var menu, panel;

							// start the dijiit if not already started
							menu = $viz(event.target.parentElement.getElementsByTagName('h3')[0]).hasClass('ui-state-active'),
							panel = ui.newPanel.hasClass('gcviz-tbnav-content');

							// the menu and the panel needs to be active
							if (panel && menu) {
								ovMapWidget[0].startup();

								// because IE will tab svg tag we need to set them focusable = false
								$mapElem.find('svg').attr('tabindex', -1).attr('focusable', false);

								// remove the events
								$panel.off('accordionactivate');
								$menu.off('accordionactivate');
							}
						});

						// if the panel is open but not the menu we need to have another way
						// to trigger the overview startup
						$menu.on('accordionactivate', function(event) {
							var panel,
								menu = $viz(event.target.getElementsByTagName('h3')[0]).hasClass('ui-state-active'),
								panels = event.target.getElementsByTagName('h3'),
								len = panels.length;

							if (menu) {
								while (len--) {
									panel = $viz(panels[len]);
									if (panel.hasClass('gcviz-nav-panel') && panel.hasClass('ui-state-active')) {
										ovMapWidget[0].startup();

										// because IE will tab svg tag we need to set them focusable = false
										$mapElem.find('svg').attr('tabindex', -1).attr('focusable', false);

										// remove the events
										$panel.off('accordionactivate');
										$menu.off('accordionactivate');
									}
								}
							}
						});
					}

					if (scaledisplay) {
						// set on extent-change event to display scale
						mapVM.registerEvent(mapid, 'extent-change', _self.displayScale);
					}

					return { controlsDescendantBindings: true };
				};

				_self.displayScale = function() {
					var formatScale,
						currentScale;

					// get scale
					currentScale = Math.round(mapVM.getScaleMap(mapid)).toString();

					// set formating
					formatScale = currentScale.split('').reverse().join('');
					formatScale = formatScale.replace(/(\d{3})(?=\d)/g, '$1' + ' ');
					formatScale = formatScale.split('').reverse().join('');

					// update scale
					_self.lblScale(_self.ScaleLabel + _self.zoomScalePre + formatScale);
					$scaleMapSpan.textContent = _self.ScaleLabel + _self.zoomScalePre + formatScale;
				};

				_self.endPosition = function() {
					// Reset cursor
					$container.removeClass('gcviz-nav-cursor-pos');

					// set popup event
					mapVM.addPopupEvent(mapid);

					// enable zoom extent button on map
					mapVM.disableZoomExtent(mapid, false);

					// remove click event
					if (typeof clickPosition !== 'undefined') {
						clickPosition.remove();
					}

					// close dialog box
					$posDiag.dialog('close');

					require(['gcviz-vm-header'], function(headerVM) {
						headerVM.toggleMenu(mapid);
					});

					$menu.on('accordionactivate', function() {
						$menu.off('accordionactivate');

						// bug with jQueryUI, focus does not work when menu open
						setTimeout(function() {
							// focus last active tool
							btnClickMap.focus();

							// reset active tool
							_self.activeTool('');
						}, 700);
					});
				};

				// Clear the input field on focus if it contains the default text
				inMapField.focus(function() {
					inMapField.val('');
				});

				// Set the input field has an autocomplete field and define the source and events for it
				inMapField.autocomplete({
					source: function(request, response) {
						var term = request.term,
							lonlat = gcvizFunc.parseLonLat(term),
							scale = gcvizFunc.parseScale(term);

						// reset the array (need to set a dummy value if not it is not reset)
						autoCompleteArray = [{ minx: 0, miny: 0, maxx: 0, maxy: 0, title: 'ddd' }];

						if (typeof lonlat !== 'undefined') {
							// if response is a coordinnate
							lonlat = [lonlat[0] + ';' + lonlat[1] + ';' + lonlat[2]];
							response($viz.map(lonlat, function(item) {
								var pt1, pt2, add, value,
									miny, maxy, minx, maxx,
									geomType = 'point',
									lonlat = item.split(';'),
									bufVal = 0.01799856; // 2km = 0.01799856 degrees

								pt1 = parseFloat(lonlat[1], 10);
								pt2 = parseFloat(lonlat[0], 10);
								miny = pt1 - bufVal;
								maxy = pt1 + bufVal;
								minx = pt2 - bufVal;
								maxx = pt2 + bufVal;

								// add dms and dd representation
								add = gcvizFunc.convertDdToDms(pt2, pt1, 0);
								value = add.y.join().replace(/,/g,'') + ' ' + add.x.join().replace(/,/g,'');
								value += ' | ' + pt1.toFixed(3) + ' ' + pt2.toFixed(3);
								autoCompleteArray.push({ minx: minx, miny: miny, maxx: maxx, maxy: maxy, coords: lonlat, type: geomType, title: value });

								return {
									label: value,
									value: value
								};
							}));
						} else if (typeof scale !== 'undefined') {
							// if response is a scale
							response($viz.map([scale], function() {
								var value = scale,
									parts = scale.split(':'),
									geomType = 'scale';

								autoCompleteArray.push({ minx: 0, miny: 0, maxx: 0, maxy: 0, coords: parts[1], type: geomType, title: value });

								return {
									label: value,
									value: value
								};
							}));
						} else {
							// if not, call the api because it is a name, NTS or postal FSA
							$viz.ajax({
								url: _self.geoLocUrl,
								cache: false,
								dataType: 'jsonp', // jsonp because it is cross domain
								data: {
									q: term + '*'
								},
								success: function(data) {
									response($viz.map(data, function(item) {
										var geom, coords, pt1, pt2, geomType,
											miny, maxy, minx, maxx,
											txtLabel, valItem,
											bbox = item.bbox,
											bufVal = 0.01799856; // 2km = 0.01799856 degrees

										if (typeof bbox === 'object') {
											geomType = 'polygon';
											coords = item.geometry.coordinates;
											geom = bbox;
											miny = geom[1];
											maxy = geom[3];
											minx = geom[0];
											maxx = geom[2];
										} else {
											// convert the lat/long to a bbox with 2km width
											geomType = 'point';
											geom = item.geometry.coordinates;
											coords = geom;
											pt1 = geom[1];
											pt2 = geom[0];
											miny = pt1 - bufVal;
											maxy = pt1 + bufVal;
											minx = pt2 - bufVal;
											maxx = pt2 + bufVal;
										}

										txtLabel = item.title;
										valItem = item.title;
										autoCompleteArray.push({ minx: minx, miny: miny, maxx: maxx, maxy: maxy, coords: coords, type: geomType, title: item.title });

										return {
											label: txtLabel,
											value: valItem
										};
									}));
								}
							});
						}
					},
					minLength: 3,
					select: function(event, ui) {
						var acai, title;

						// find selection and zoom to it
						for (var i = 0; i < autoCompleteArray.length; i++) {
							acai = autoCompleteArray[i],
							title = acai.title;

							if (ui.item.label === title) {
								_self.selectAutoComplete(acai);
							}
						}

						// put focus back on input field
						inMapField.focus();
					},
					open: function() {
							$viz(this).removeClass('ui-corner-all').addClass('ui-corner-top');
						},
					close:
						function() {
							$viz(this).removeClass('ui-corner-top').addClass('ui-corner-all');
						},
					position: {
						collision: 'fit',
						within: '#' + mapid
					}
				}).keypress(function (e) {
					if (e.keyCode === 13) {
						// check if there is more then 1 item. The first one is just place holder.
						if (autoCompleteArray.length > 1) {
							_self.selectAutoComplete(autoCompleteArray[1]);
						}
						e.preventDefault();
					}
				});

				_self.selectAutoComplete = function(acai) {
					var anchor, geometry, output, scaleOut, scaleType,
						title = acai.title,
						infotitle = title, // need this because title will be reset before the timeout
						coords = acai.coords,
						minx = acai.minx,
						miny = acai.miny,
						maxx = acai.maxx,
						maxy = acai.maxy,
						type = acai.type;

					// remove previous info window if there is one.
					mapVM.hideInfoWindow(mapid, 'location');

					if (type !== 'scale') {
						// zoom to location
						mapVM.zoomLocation(mapid, minx, miny, maxx, maxy, _self.outSR);

						// add graphic representation
						if (geolocation.graphic && acai.type === 'point') {
							geometry = { 'x': coords[0], 'y': coords[1] };
							mapVM.addGraphic(mapid, 'point', geometry, { title: title }, 4326, 'location');
						} else {
							geometry = { 'polygon': [[[minx, miny],
												[maxx, miny],
												[maxx, maxy],
												[minx, maxy],
												[minx, miny]]] };
							mapVM.addGraphic(mapid, 'polygon', geometry, { title: title }, 4326, 'location');
						}

						anchor = 'location';
					} else {
						output = mapVM.setScaleMap(mapid, coords);
						scaleType = output[0];

						if (scaleType === 'cache') {
							scaleOut = _self.zoomScale + output[1] + '.';
						} else if (scaleType === 'cache-min') {
							scaleOut = _self.zoomScaleMin + output[1] + '.';
						} else if (scaleType === 'cache-max') {
							scaleOut = _self.zoomScaleMax + output[1] + '.';
						} else {
							scaleOut = _self.zoomScaleDyna + title;
						}

						infotitle = scaleOut;
					}

					// reset the array (need to set a dummy value if not it is not reset)
					autoCompleteArray = [{ minx: 0, miny: 0, maxx: 0, maxy: 0, coords: 0, type: '', title: 'ddd' }];

					// show info window
					if (geolocation.info) {
						setTimeout(function() {
							mapVM.showInfoWindow(mapid, 'Location', infotitle, anchor, 12, 0);
						}, 1000);
					}
				};

				_self.getMapClick = function() {
					// close menu
					require(['gcviz-vm-header'], function(headerVM) {
						headerVM.toggleMenu(mapid);
					});

					// set event for the toolbar
					$menu.on('accordionbeforeactivate', function() {
						$menu.off();
						_self.endPosition();
					});

					// check if WCAG mode is enable, if so use dialog box instead)
					if (!_self.isWCAG()) {
						// Set the cursor
						$container.css('cursor', '');
						$container.addClass('gcviz-nav-cursor-pos');

						// remove popup event
						mapVM.removePopupEvent(mapid);

						// disable zoom extent button on map
						mapVM.disableZoomExtent(mapid, true);

						// Get user to click on map and capture event
						clickPosition = mapVM.registerEvent(mapid, 'click', _self.projectMapClick);
					} else {
						_self.isDialogWCAG(true);
					}

					// set active tool
					_self.activeTool('position');

					// focus the map. We need to specify this because when you use the keyboard to
					// activate the tool, the focus sometimes doesnt go to the map.
					mapVM.focusMap(mapid, false);
				};

				_self.projectMapClick = function(evt) {
					gisGeo.projectPoints([evt.mapPoint], 4326, _self.displayInfo);
				};

				_self.dialogWCAGOk = function() {
					var x = _self.xValue() * -1,
						y = _self.yValue();

					gisGeo.projectCoords([[x, y]], mapVM.getSR(mapid), 4326, _self.displayInfo);
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
						_self.isLocDialogOpen(false);
						$menu.accordion('option', 'active', 0);
						_self.endPosition();
					}
				};

				_self.displayInfo = function(outPoint) {
					var dms, alti,
						utmZone = '',
						lati = outPoint[0].y,
						longi = outPoint[0].x;

					// Get lat/long in DD
					_self.infoLatDD(' ' + lati);
					_self.infoLongDD(' ' + longi);

					// Calculate lat/long in DMS
					dms = gcvizFunc.convertDdToDms(longi, lati, 3);
					_self.infoLatDMS(' ' + dms.y.join(' '));
					_self.infoLongDMS(' ' + dms.x.join(' '));

					// Get the NTS location using a deferred object and listen for completion
					gisNav.getNTS(lati, longi, _self.urlNTS)
						.done(function(data) {
							var prop,
								nts = data.nts;

							if (nts.length === 3) {
								prop = nts[1].properties;
								_self.spnNTS250(prop.identifier + ' - ' + prop.name);

								prop = nts[2].properties;
								_self.spnNTS50(prop.identifier + ' - ' + prop.name);
							} else if (nts.length === 2) {
								prop = nts[1].properties;
								_self.spnNTS250(prop.identifier + ' - ' + prop.name);
								_self.spnNTS50('');
							} else {
								_self.spnNTS250('');
								_self.spnNTS50('');
							}
					});

					// Get the UTM zone information using a deferred object and listen for completion
					_self.spnUTMeast('');
					_self.spnUTMnorth('');
					gisNav.getUTMzone(lati, longi, _self.urlUTM)
						.done(function(data) {
							utmZone = data.zone;
							_self.spnUTMzone(utmZone);

							gisGeo.getUTMEastNorth(lati, longi, gcvizFunc.padDigits(utmZone, 2), _self.spnUTMeast, _self.spnUTMnorth);
					});

					// Get the altitude
					gisNav.getAltitude(lati, longi, _self.urlAlti)
						.done(function(data) {
							alti = '0';
							if (data.altitude !== null) {
								alti = data.altitude;
							}
							_self.spnAltitude(alti + ' m');
						});

					// open the results dialog
					_self.isLocDialogOpen(true);
				};

				_self.dialogLocOk = function() {
					_self.isLocDialogOpen(false);

					// if wcag mode is enable, open tools
					if (_self.wcagok) {
						$menu.accordion('option', 'active', 0);
						_self.endPosition();
						_self.wcagok = false;
					}
				};

				_self.showOVMap = function() {
					var show = _self.isOVShowMap();

					// overview map
					if (typeof ovMapWidget !== 'undefined') {
						// move content from tools to map
						if (show) {
							ovMapWidget[0].show();
							ovMapWidget[1].hide();
							$ovMap.removeClass('gcviz-ov-border');
						} else {
							// start the dijiit if not already started
							if (!_self.OVMapStart) {
								ovMapWidget[1].startup();
								_self.OVMapStart = true;
							}

							ovMapWidget[1].show();
							ovMapWidget[0].hide();
							$ovMap.addClass('gcviz-ov-border');
						}
					}

					// scale
					if (!show && scaledisplay) {
						$scaleMap.removeClass('gcviz-hidden');
					} else {
						$scaleMap.addClass('gcviz-hidden');
					}

					return true;
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new toolbarnavViewModel($mapElem, mapid);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		endGetCoordinates = function(mapid) {
			var flag = false,
				viewModel = vm[mapid];

			// link to view model to call the function inside
			if (typeof viewModel !== 'undefined') {
				if (viewModel.activeTool() === 'position') {
					viewModel.endPosition();
					flag = true;
				}
			}

			return flag;
		};

		return {
			initialize: initialize,
			endGetCoordinates: endGetCoordinates
		};
	});
}).call(this);
