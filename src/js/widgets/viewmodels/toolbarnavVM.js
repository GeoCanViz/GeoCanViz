/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar navigation view model widget
 */
/* global vmArray: false, locationPath: false */
/* global esri: false */
(function() {
	'use strict';
	define(['jquery-private',
            'knockout',
			'gcviz-i18n',
			'gcviz-func',
            'gcviz-gisgeo',
            'gcviz-gismap',
			'esri/dijit/OverviewMap',
			'esri/dijit/Scalebar',
            'dojo/dom'
	], function($viz, ko, i18n, gcvizfunc, gisgeo, gismap, ov, sb, dom) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

            var autoCompleteArray = [ {minx:0,miny:0,maxx:0,maxy:0,title:'ddd'} ];

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
					configoverview = config.overview,
					configoverviewtype = configoverview.type,
					configoverviewurl = config.overview.url,
					configscalebar = config.scalebar,
                    defaultAutoComplText = i18n.getDict('%toolbarnav-geolocsample'),
                    eventHandler, clickPosition,
                    eventCount = 0,
                    inMapField = $viz('#inGeoLocation' + mapid),
					itemCount = 0,
					loctype = '',
					maxy,
					maxx,
					minx,
					miny,
					mymap = vmArray[mapid].map.map,
					elem = document.getElementById(mymap.vIdName + '_holder'),
                    pathExtent = locationPath + 'gcviz/images/navFullExtent.png',
                    pathMagnify = locationPath + 'gcviz/images/navMagnify.png',
                    pathPosition = locationPath + 'gcviz/images/getInfo.png',
					txtLabel,
					valItem,
					selItemNum;

				// images path
				_self.imgExtent = ko.observable(pathExtent);
                _self.imgMagnify = ko.observable(pathMagnify);
				_self.imgPosition = ko.observable(pathPosition);

                // tooltips, text strings and other things from dictionary
                _self.cancel = i18n.getDict('%cancel');
                _self.close = i18n.getDict('%close');
                _self.cursorTarget = i18n.getDict('%cursor-target');
                _self.geoLocLabel = i18n.getDict('%toolbarnav-geoloclabel');
                _self.geoLocSample = i18n.getDict('%toolbarnav-geolocsample');
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

                _self.opencloseToolsState = false;

				_self.init = function() {
                    _self.theAutoCompleteArray = ko.observableArray(autoCompleteArray);

                    // See if user wanted an overview map. If so, initialize it here
                    if (configoverview.enable) {
                        var overviewMapDijit,
							bLayer = null,
							ovDiv = dom.byId('divOverviewMap' + mapid);

						bLayer = gismap.getOverviewLayer(configoverviewtype, configoverviewurl);
                        // If no layer specified, use the main map
                        if (bLayer === null) {
                            overviewMapDijit = new esri.dijit.OverviewMap(
                                { map: mymap,
                                expandFactor: 2,
                                height: 100,
                                width: 247 },
                                ovDiv);
                        } else {
                            overviewMapDijit = new esri.dijit.OverviewMap(
                                { map: mymap,
                                expandFactor: 2,
                                baseLayer: bLayer,
                                height: 100,
                                width: 247 },
                                ovDiv);
                        }
                        setTimeout(function(){
							overviewMapDijit.startup();
                            var divOV = $viz('#divOverviewMap' + mapid + '-map');
                            divOV.width(247).height(100);
                            overviewMapDijit.resize();
                       }, 3000);
                    }

                    // See if user wanted a scalebar. If so, initialize it here
                    if (configscalebar.enable) {
						var sbMapDijit,
							units,
							ovSB = dom.byId('divScalebar' + mapid);

						if (configscalebar.unit === 1) { units = 'metric'; }
						else if (configscalebar.unit === 2) { units = 'english'; }
						sbMapDijit = new esri.dijit.Scalebar(
                               { map: mymap,
                                scalebarStyle: 'line',
                                scalebarUnit: units,
                                height: 25,
                                width: 200 },
                                ovSB);
                    }

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
							focus: function() {
								if (inMapField.val() === defaultAutoComplText) {
									inMapField.val('');
								}
							},
							success: function(data) {
								response($viz.map(data, function(item) {
									switch (item.type) {
										case 'ca.gc.nrcan.geoloc.data.model.PostalCode':
										case 'ca.gc.nrcan.geoloc.data.model.Intersection':
											// Convert the lat/long to a bbox with 2km width
											// 2km = 0.01799856 degrees
											miny = item.geometry.coordinates[1] - 0.01799856;
											maxy = item.geometry.coordinates[1] + 0.01799856;
											minx = item.geometry.coordinates[0] - 0.01799856;
											maxx = item.geometry.coordinates[0] + 0.01799856;
											txtLabel = item.title;
											valItem = item.title;
											itemCount++;
											autoCompleteArray[itemCount] = { minx:minx,miny:miny,maxx:maxx,maxy:maxy,title:item.title };
											selItemNum = itemCount;
											break;
										default:
											switch (item.qualifier){
												case 'LOCATION':
													miny = item.bbox[1];
													maxy = item.bbox[3];
													minx = item.bbox[0];
													maxx = item.bbox[2];
													break;
												case 'INTERPOLATED_CENTROID':
												case 'INTERPOLATED_POSITION':
													// Convert the lat/long to a bbox with 2km width
													// 2km = 0.01799856 degrees
													miny = item.geometry.coordinates[1] - 0.01799856;
													maxy = item.geometry.coordinates[1] + 0.01799856;
													minx = item.geometry.coordinates[0] - 0.01799856;
													maxx = item.geometry.coordinates[0] + 0.01799856;
													break;
												}
											txtLabel = item.title;
											valItem = item.title;
											itemCount++;
											autoCompleteArray[itemCount] = { minx: minx,miny: miny,maxx: maxx,maxy: maxy,title: item.title };
											selItemNum = itemCount;
											break;
										}
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
								gisgeo.zoomLocation(acai.minx, acai.miny, acai.maxx, acai.maxy, mymap, config.urlgeomserv);
							}
						}
						// Reset the array
						autoCompleteArray = [{ minx: 0,miny: 0,maxx: 0,maxy: 0,title: 'ddd' }];
						itemCount = 0;
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
					elem.focus();
					gisgeo.zoomFullExtent(mymap);
					setTimeout(function() {
						elem.blur();
					}, 2000);
                    $viz('#btnFullExtent' + mapid).focus();
                    return true;
				};

                _self.infoClick = function() {
                    elem.focus();
                    // Define the dialog window
                    $viz( '#divGetLocInfo' + mapid ).dialog({
                        autoOpen: false,
                        closeText: _self.close,
                        modal: true,
                        title: _self.info,
                        width: 400,
                        show: {
                            effect: 'fade',
                            duration: 700
                        },
                        hide: {
                            effect: 'fade',
                            duration: 500
                        },
                        buttons: [
                            {
                                text: _self.cancel,
                                title: _self.cancel,
                                click: function() {
                                    $viz(this).dialog('close');
                                }
                            }
                        ]
                    });
                    // Show the dialog window
                    $viz('#divGetLocInfo' + mapid).dialog('open');
                    return true;
                };

                _self.getMapClick = function() {
                    loctype = 'map';
                    vmArray[mapid].header.toolsClick();
                    // Set the cursor
                    mymap.setMapCursor(_self.cursorTarget);
                    if (eventCount === 0) {
						eventCount++;
						mymap.on('key-down', function(keyargs) {
							// Capture an escape while on the map
							if (keyargs.keyCode === 27) {
								mymap.setMapCursor('default');
								// Open the toolbars
								vmArray[mapid].header.toolsClick();
								$viz('#btnClickMap' + mapid).focus();
							}
						});
                    } else {
						// Reset if not first time
						mymap.on('key-down', null);
						eventCount = 0;
                    }
                    // Get user to click on map and capture event
                    clickPosition = mymap.on('click', _self.getMapPoint);
                };

                _self.getMapPoint = function(event) {
                    // Get results
                    var x = event.mapPoint.x,
						y = event.mapPoint.y,
						mymap = vmArray[mapid].map.map,
						geomServ = new esri.tasks.GeometryService(config.urlgeomserv),
						inSR = mymap.spatialReference,
						outSR = new esri.SpatialReference({ 'wkid': 4326 }),
						prjParams = new esri.tasks.ProjectParameters(),
						inPoint = new esri.geometry.Point(x, y, inSR),
						geom = [inPoint];

                    // Convert to lat/long
                    prjParams.geometries = geom;
                    prjParams.outSR = outSR;
                    prjParams.transformation = 'Default';
                    eventHandler = geomServ.project(prjParams, _self.projectDone);

                    // remove click event
                    clickPosition.remove();
                };

                _self.projectDone = function(outPoint) {
                    var lati = outPoint[0].y;
                    var longi = outPoint[0].x;
                    // Reset cursor
                    mymap.setMapCursor('default');
                    // Display information
                    _self.displayInfo(lati, longi, config);
                };

                _self.displayInfo = function(lati, longi, config) {
                    var alti = '',
						DMS,
						geom,
						geometryService = gisgeo.getGSVC(config.urlgeomserv),
						inputpoint,
						inSR,
						outSR,
						prjParams,
						tmp,
						urlAlti = _self.infoAltitudeUrl,
						utmZone = '';

                    // Define the results dialog
                    $viz('#divGetLocResults' + mapid).dialog({
                        autoOpen: false,
                        closeText: _self.close,
                        modal: true,
                        title: _self.close,
                        width: 400,
                        show: {
                            effect: 'fade',
                            duration: 700
                        },
                        hide: {
                            effect: 'fade',
                            duration: 500
                        },
						close: function() {
                                    $viz(this).dialog('close');
									// Reopen the toolbars
									vmArray[mapid].header.toolsClick();
									setTimeout(function() { $viz('#btnClickMap' + mapid).focus(); }, 1000);
                                },
                        buttons: [
                            {
                                text: i18n.getDict('%close'),
                                title: i18n.getDict('%close'),
                                click: function() {
                                    $viz(this).dialog('close');
                                    setTimeout(function() { $viz('#btnClickMap' + mapid).focus(); }, 1000);
                                }
                            }
                        ]
                    });
                    // Show results
                    $viz('#divGetLocResults' + mapid).dialog('open');

                    // Get lat/long in DD
                    _self.infoLatDD(' ' + lati);
                    _self.infoLongDD(' ' + longi);

                    // Calculate lat/long in DMS
                    DMS = gisgeo.calcDDtoDMS(lati, longi);
                    _self.infoLatDMS(' ' + DMS.latD + '° ' + DMS.latM + '\' ' + DMS.latS + '\" ' + DMS.northSouth);
                    _self.infoLongDMS(' ' + DMS.longD + '° ' + DMS.longM + '\' ' + DMS.longS + '\" ' + DMS.eastWest);

                    // Get the NTS location using a deferred objec and listen for completion
                    gisgeo.getNTS(lati, longi)
                        .done(function(data) {
                            _self.spnNTS(data.nts);
                        });

                    // Get the UTM zone information using a deferred objec and listen for completion
                    gisgeo.getUTMzone(lati, longi)
                        .done(function(data) {
                            utmZone = data.zone;
                            _self.spnUTMzone(utmZone);
                            // Get the UTM easting/northing information using a geometry service
                            inSR = new esri.SpatialReference({ 'wkid': 4326 });
                            tmp = '326' + utmZone;
                            tmp = parseInt(tmp, 10);
                            outSR = new esri.SpatialReference({ 'wkid': tmp });
                            // Transform the lat/long extent to map coordinates
                            inputpoint = new esri.geometry.Point(parseFloat(longi), parseFloat(lati), inSR);
                            geom = [inputpoint];
                            prjParams = new esri.tasks.ProjectParameters();
                            prjParams.geometries = geom;
                            prjParams.outSR = outSR;
                            prjParams.transformation = 'Default';
                            geometryService.project(prjParams, function(projectedPoints) {
                                _self.spnUTMeast(' ' + Math.round(projectedPoints[0].x));
                                _self.spnUTMnorth(' ' + Math.round(projectedPoints[0].y));
                            });
                        });

                    // Get the altitude
                    urlAlti += 'lat=' + lati + '&lon=' +  longi;
                    $viz.getJSON(urlAlti,
                        function(data) {
                           alti = '0';
                            if (data.altitude !== null) {
								alti = data.altitude;
                            }
                            _self.spnAltitude(alti + ' m');
                        });
                };

				_self.init();
			};

			vm = new toolbarnavViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize		};
	});
}).call(this);
