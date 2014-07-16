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
            'gcviz-gisnav',
            'dijit/registry'
	], function($viz, ko, i18n, gcvizFunc, gisgeo, gisnav, dijit) {
		var initialize,
			calcDDtoDMS,
			getDMS,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
					overview = config.overview,
					scalebar = config.scalebar,
					scaledisplay = config.scaledisplay,
                    clickPosition,
                    inMapField = $viz('#inGeoLocation' + mapid),
                    btnClickMap = $viz('#btnClickMap' + mapid),
                    $container = $viz('#' + mapid + '_holder_layers'),
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
                    autoCompleteArray = [ { minx: 0 , miny: 0, maxx: 0, maxy: 0, title: 'ddd' } ];

                // tooltips, text strings and other things from dictionary
                _self.cancel = i18n.getDict('%cancel');
                _self.close = i18n.getDict('%close');
                _self.cursorTarget = i18n.getDict('%cursor-target');
                _self.geoLocLabel = i18n.getDict('%toolbarnav-geoloclabel');
                _self.geoLocUrl = i18n.getDict('%gisurllocate');
                _self.info = i18n.getDict('%toolbarnav-info');
                _self.infoAltitude = i18n.getDict('%toolbarnav-infoaltitude');
                _self.infoAltitudeUrl = i18n.getDict('%toolbarnav-infoaltitudeurl');
                _self.infoClickMap = i18n.getDict('%toolbarnav-infoclickmap');
                _self.infoDecDeg = i18n.getDict('%toolbarnav-infodecdeg');
                _self.infoDMS = i18n.getDict('%toolbarnav-infodms');
                _self.infoGetInfo = i18n.getDict('%toolbarnav-infogetinfo');
                _self.infoGetLocInfo = i18n.getDict('%toolbarnav-infogetlocinfo');
                _self.infoLat = i18n.getDict('%toolbarnav-infolat');
                _self.infoLong = i18n.getDict('%toolbarnav-infolong');
                _self.infoNTS = i18n.getDict('%toolbarnav-infonts');
                _self.infoOption1 = i18n.getDict('%toolbarnav-infooption1');
                _self.infoOption2 = i18n.getDict('%toolbarnav-infooption2');
                _self.infoTopoCoord = i18n.getDict('%toolbarnav-infotopocoord');
                _self.infoUTM = i18n.getDict('%toolbarnav-infoutm');
                _self.infoUTMeast = i18n.getDict('%toolbarnav-infoutmeast');
                _self.infoUTMnorth = i18n.getDict('%toolbarnav-infoutmnorth');
                _self.infoUTMz = i18n.getDict('%toolbarnav-infoutmz');
                _self.insKeyboard = i18n.getDict('%toolbarnav-inskeyboard');
                _self.tpGetLocInfo = i18n.getDict('%toolbarnav-info');
                _self.tpMagnify = i18n.getDict('%toolbarnav-magnify');
                _self.tpOverview = i18n.getDict('%toolbarnav-ovdrag');
                _self.tpZoomFull = i18n.getDict('%toolbarnav-zoomfull');
                _self.lblWest = i18n.getDict('%west');
                _self.ScaleLabel = i18n.getDict('%toolbarnav-scale');
                _self.lblLocTitle = i18n.getDict('%toolbarnav-info');

				// WCAG
				_self.mapid = mapid;
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

				// autocomplete default
				_self.defaultAutoComplText = i18n.getDict('%toolbarnav-geolocsample');
				_self.geoLocSample = i18n.getDict('%toolbarnav-geolocsample');

                // Observables
                _self.infoLatDD = ko.observable();
                _self.infoLatDMS = ko.observable();
                _self.infoLongDD = ko.observable();
                _self.infoLongDMS = ko.observable();
                _self.isToolsOpen = ko.observable(false);
                _self.spnAltitude = ko.observable();
                _self.spnNTS = ko.observable();
                _self.spnUTMzone = ko.observable();
                _self.spnUTMeast = ko.observable();
                _self.spnUTMnorth = ko.observable();
                _self.lblScale = ko.observable(i18n.getDict('%toolbarnav-scale'));
				_self.isLocDialogOpen = ko.observable(false);

				// url for position info box
				_self.urlNTS = i18n.getDict('%gisurlnts');
				_self.urlUTM = i18n.getDict('%gisurlutm');

				// projection objects
				_self.outSR = gisgeo.getOutSR(config.mapwkid);

				_self.init = function() {
                    _self.theAutoCompleteArray = ko.observableArray(autoCompleteArray);

                    // See if user wanted an overview map. If so, initialize it here
                    if (overview.enable) {
						gisnav.setOverview(mymap, overview);
                    }

                    // See if user wanted a scalebar. If so, initialize it here
                    if (scalebar.enable) {
						gisnav.setScaleBar(mymap, scalebar);
                    }

                    if (scaledisplay.enable) {
						mymap.on('extent-change', function() {
							var currentScale = Math.round(mymap.getScale()).toString();
							_self.lblScale(_self.ScaleLabel + currentScale);
						});
					}

					// check if we need to close the toolbar. We do this here instead of view because of a bug with
					// overview widget. If the widget is not visible at load, it is not properly set.
					setTimeout(function() {
						if (!config.expand) {
							dijit.byId('tbnav' + mapid).toggle();
						}
						dijit.byId('tbTools' + mapid).toggle();
					}, 250);

					return { controlsDescendantBindings: true };
				};

				// Clear the input field on focus if it contains the default text
				inMapField.focus(function() {
					if (inMapField.val() === _self.geoLocSample) {
						inMapField.val('');
					}
				});

				// Set the input field has an autocomplete field and define the source and events for it
				inMapField.autocomplete({
					source: function(request, response) {
						$viz.ajax({
							url: _self.geoLocUrl,
							dataType: 'json',
							data: {
								q: request.term + '*'
							},
							success: function(data) {
								response($viz.map(data, function(item) {
									var geom, pt1, pt2,
										miny, maxy, minx, maxx,
										txtLabel, valItem,
										type = item.type,
										qualifier = item.qualifier,
										bufVal = 0.01799856; // 2km = 0.01799856 degrees

									if (type === 'ca.gc.nrcan.geoloc.data.model.PostalCode' || type === 'ca.gc.nrcan.geoloc.data.model.Intersection' || qualifier === 'INTERPOLATED_POSITION') {
										// Convert the lat/long to a bbox with 2km width
										geom = item.geometry.coordinates;
										pt1 = geom[1];
										pt2 = geom[0];
										miny = pt1 - bufVal;
										maxy = pt1 + bufVal;
										minx = pt2 - bufVal;
										maxx = pt2 + bufVal;
									} else {
										if (qualifier === 'LOCATION') {
											geom = item.bbox;
											miny = geom[1];
											maxy = geom[3];
											minx = geom[0];
											maxx = geom[2];
										} else if (qualifier === 'INTERPOLATED_CENTROID') {
											// TODO add code for this value. If not required, remove.
										}
									}

									txtLabel = item.title;
									valItem = item.title;
									autoCompleteArray.push({ minx: minx, miny: miny, maxx: maxx, maxy: maxy, title: item.title });

									return {
										label: txtLabel,
										value: valItem
									};
								}));
							}
						});
					},
					minLength: 3,
					select: function(event, ui) {
						// Find selection and zoom to it
						for (var i=0; i<autoCompleteArray.length; i++) {
							var acai = autoCompleteArray[i];
							if (ui.item.label === acai.title) {
								gisgeo.zoomLocation(acai.minx, acai.miny, acai.maxx, acai.maxy, mymap, _self.outSR);
							}
						}
						// Reset the array
						autoCompleteArray = [{ minx: 0, miny: 0, maxx: 0, maxy: 0, title: 'ddd' }];

						// Put focus back on input field
						inMapField.focus();
					},
					open: function() {
							$viz(this).removeClass('ui-corner-all').addClass('ui-corner-top');
						},
					close:
						function() {
							$viz(this).removeClass('ui-corner-top').addClass('ui-corner-all');
						}
				});

				_self.extentClick = function() {
					gisnav.zoomFullExtent(mymap);
				};

                _self.getMapClick = function() {
                    gcvizFunc.getElemValueVM(mymap.vIdName, ['header', 'toolsClick'], 'js')();

					// check if WCAG mode is enable, if so use dialog box instead)
					if (!_self.isWCAG()) {
						// Set the cursor
						$container.css('cursor', '');
						$container.addClass('gcviz-nav-cursor-pos');

						// Get user to click on map and capture event
						clickPosition = mymap.on('click', function(event) {
							gisgeo.projectPoints([event.mapPoint], 4326, _self.displayInfo);
						});
					} else {
						_self.isDialogWCAG(true);
					}
                };

				_self.dialogWCAGOk = function() {
					var x = _self.xValue() * -1,
						y = _self.yValue();

					gisgeo.projectCoords([[x, y]], 4326, _self.displayInfo);
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
						_self.dialogLocOk();
					}
					_self.wcagok = false;
				};

                _self.displayInfo = function(outPoint) {
                    var DMS, alti,
						utmZone = '',
						lati = outPoint[0].y,
						longi = outPoint[0].x,
						urlAlti = _self.infoAltitudeUrl + 'lat=' + lati + '&lon=' +  longi;

					// Reset cursor
                    $container.removeClass('gcviz-nav-cursor-pos');

					// remove click event (if not WCAG)
                    if (!_self.isWCAG()) {
						clickPosition.remove();
                    }

                    // Get lat/long in DD
                    _self.infoLatDD(' ' + lati);
                    _self.infoLongDD(' ' + longi);

                    // Calculate lat/long in DMS
                    DMS = calcDDtoDMS(lati, longi, _self.lblWest);
                    _self.infoLatDMS(' ' + DMS.latitude.format);
                    _self.infoLongDMS(' ' + DMS.longitude.format);

                    // Get the NTS location using a deferred object and listen for completion
                    gisnav.getNTS(lati, longi, _self.urlNTS)
                        .done(function(data) {
                            _self.spnNTS(data.nts);
					});

                    // Get the UTM zone information using a deferred object and listen for completion
                    gisnav.getUTMzone(lati, longi, _self.urlUTM)
                        .done(function(data) {
                            utmZone = data.zone;
                            _self.spnUTMzone(utmZone);

                           gisgeo.getUTMEastNorth(lati, longi, utmZone, _self.spnUTMeast, _self.spnUTMnorth);
                        });

                    // Get the altitude
                    $viz.getJSON(urlAlti,
                        function(data) {
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
					gcvizFunc.getElemValueVM(mymap.vIdName, ['header', 'toolsClick'], 'js')();
					setTimeout(function() {
						btnClickMap.focus();
					}, 100);
                };

				_self.init();
			};

			vm = new toolbarnavViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		calcDDtoDMS = function(lati, longi, lblWest) {
            var DMS = {},
				nswe,
				latReal = parseFloat(lati),
				longReal = parseFloat(longi);

			// set latitude
            if (latReal < 0.0) {
                nswe = 'S';
                latReal = latReal * -1.0;
            } else {
                nswe = 'N';
            }
            DMS.latitude = getDMS(latReal, nswe);

			// set longitude
            if (longReal < 0.0) {
                nswe = lblWest;
                longReal = longReal * -1.0;
            } else {
                nswe = 'E';
            }
			DMS.longitude = getDMS(longReal, nswe);

            return DMS;
		};

		getDMS = function(val, nsew) {
			var deg = parseInt(val, 10),
				tmp = (val - deg) * 60,
				min = parseInt(tmp, 10),
				sec = Math.round(((tmp - min) * 60) * 1000) / 1000,
				out = { d: deg,
						m: min,
						s: sec,
						format: deg + '° ' + min + '\' ' + sec + '\" ' + nsew };
			return out;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
