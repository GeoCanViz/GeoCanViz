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
            'gcviz-gisnavigation',
            'gcviz-gisgeo',
			'esri/dijit/OverviewMap',
			'esri/dijit/Scalebar',
            'dojo/dom',
            'dojo/dom-style',
			'esri/layers/layer'
	], function($viz, ko, i18n, gisNavigation, gisgeo, ov, sb, dom, domStyle, lyr) {
		var initialize,
//			onleaveauto,
//			refreshov,
			vm;

		initialize = function($mapElem, mapid, config) {

            var autoCompleteArray = [ {minx:0,miny:0,maxx:0,maxy:0,title:'ddd'} ];

			// data model				
			var toolbarnavViewModel = function($mapElem, mapid) {
				var _self = this,
                    currentAutoComplText = i18n.getDict('%toolbarnav-geolocsample'),
                    eventHandler,
					mymap = vmArray[mapid].map.map,
					mapextent = mymap.extent,
					elem = document.getElementById(mymap.vIdName + '_holder'),
					loctype = '',
                    pathExtent = locationPath + 'gcviz/images/navFullExtent.png',
                    pathMagnify = locationPath + 'gcviz/images/navMagnify.png',
                    pathPosition = locationPath + 'gcviz/images/getInfo.png',
					miny,
					maxy,
					minx,
					maxx,
					txtLabel,
					valItem,
					selItemNum,
					itemCount = 0;

				// images path
				_self.imgExtent = ko.observable(pathExtent);
                _self.imgMagnify = ko.observable(pathMagnify);
				_self.imgPosition = ko.observable(pathPosition);
				_self.imgPosition2 = locationPath + 'gcviz/images/navInfo.png';

                // tooltips and text strings
                _self.infoAltitude = i18n.getDict('%toolbarnav-infoaltitude');
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
                    if (config.overview.enable) {
                        var ovDiv = dom.byId('divOverviewMap' + mapid);
                        var bLayer = null;
                        var overviewMapDijit;
                        switch (config.overview.type) {  // switch on layer type
                            case '3': // tiled
                                bLayer = new esri.layers.ArcGISTiledMapServiceLayer(config.overview.url);
                                break;
                            case '4': // dynamic service
                                bLayer = new esri.layers.ArcGISDynamicMapServiceLayer(config.overview.url);
                                break;
                            case '5': // feature layer
                                bLayer = new esri.layers.FeatureLayer(config.overview.url);
                                break;
                        }
                        // If no layer specified, use the main map
                        if (bLayer === null) {
                            overviewMapDijit = new esri.dijit.OverviewMap(
                                {map: mymap,
                                expandFactor: 2,
                                height: 100,
                                width: 247},
                                ovDiv);
                        } else {
                            overviewMapDijit = new esri.dijit.OverviewMap(
                                {map: mymap,
                                expandFactor: 2,
                                baseLayer: bLayer,
                                height: 100,
                                width: 247},
                                ovDiv);
                        }
                        setTimeout(function(){
							overviewMapDijit.startup();
                            var divOV = $viz('#divOverviewMap' + mapid + '-map');
                            divOV.width(247).height(100);
                            overviewMapDijit.resize();
                            // Try zoom out zoom in to see if ov will display
                            //mymap.setExtent(mapextent);
                            //gisNavigation.zoomFullExtent(mymap);
                            //mymap.setExtent(mapextent);
                        }, 3000);

                        var tb = $viz('tbnav' + mapid);
                        $viz('tbnav' + mapid).click(function() {
//							refreshov(overviewMapDijit);
						});
                    }

                    // See if user wanted a scalebar. If so, initialize it here
                    if (config.scalebar.enable) {
						var ovSB = dom.byId('divScalebar' + mapid);
                        var sbMapDijit;
                        var units;
                        switch (config.scalebar.unit) {
                            case 1:
                                units = 'metric';
                                break;
                            case 2:
                                units = 'english';
                                break;
                        }
                        sbMapDijit = new esri.dijit.Scalebar(
                               {map: mymap,
                                scalebarStyle: 'line',
                                scalebarUnit: units,
                                height: 25,
                                width: 200},
                                ovSB);
                    }

					return { controlsDescendantBindings: true };
				};

				_self.refreshOverview = function(overviewMapDijit) {
					overviewMapDijit.resize();
				};

				// Clear the input field on focus if it contains the default text
				$viz('#inGeoLocation' + mapid ).focus(function() {
					if ($viz('#inGeoLocation' + mapid).val() === i18n.getDict('%toolbarnav-geolocsample')) {
						$viz('#inGeoLocation' + mapid).val('');
					}
				});
				// Set the input field has an autocomplete field and define the source and events for it
				$viz('#inGeoLocation' + mapid ).autocomplete({
					source: function( request, response ) {
						$viz.ajax({
							url: 'http://geogratis.gc.ca/services/geolocation/' + i18n.getDict('%lang-code') + '/locate?',
							dataType: 'json',
							data: {
								q: request.term + '*'
							},
							focus: function( event, ui ) {
								if ($viz('#inGeoLocation' + mapid).val() === i18n.getDict('%toolbarnav-geolocsample')) {
									$viz('#inGeoLocation' + mapid).val('');
								}
							},
							success: function( data ) {
								response( $viz.map( data, function( item ) {
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
											autoCompleteArray[itemCount] = {minx:minx,miny:miny,maxx:maxx,maxy:maxy,title:item.title};
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
											autoCompleteArray[itemCount] = {minx:minx,miny:miny,maxx:maxx,maxy:maxy,title:item.title};
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
					select: function( event, ui ) {
						// Find selection and zoom to it
						for (var i=0; i<autoCompleteArray.length; i++) {
							if (ui.item.label === autoCompleteArray[i].title) {
								gisNavigation.zoomLocation(autoCompleteArray[i].minx, autoCompleteArray[i].miny, autoCompleteArray[i].maxx, autoCompleteArray[i].maxy, mymap, config.urlgeomserv);
							}
						}
						// Reset the array
						autoCompleteArray = [ {minx:0,miny:0,maxx:0,maxy:0,title:'ddd'} ];
						itemCount = 0;
						// Put focus back on input field
						$viz('#inGeoLocation' + mapid).focus();
					},
					open: function() {
							$viz( this ).removeClass( 'ui-corner-all' ).addClass( 'ui-corner-top' );
						},
					close:
						function() {
							$viz( this ).removeClass( 'ui-corner-top' ).addClass( 'ui-corner-all' );
						}
				});

				_self.extentClick = function() {
					elem.focus();
					gisNavigation.zoomFullExtent(mymap);
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
                        closeText: i18n.getDict('%close'),
                        modal: true,
                        title: i18n.getDict('%toolbarnav-info'),
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
                                text: i18n.getDict('%cancel'),
                                title: i18n.getDict('%cancel'),
                                click: function() {
                                    $viz( this ).dialog( 'close' );
                                }
                            }
                        ]
                    });
                    // Show the dialog window
                    $viz( '#divGetLocInfo' + mapid ).dialog( 'open' );
                    return true;
                };

                _self.getMapClick = function(data, event) {
                    loctype = 'map';
                    vmArray[mapid].header.toolsClick();
                    // Set the cursor
                    mymap.setMapCursor('url(/GeoCanViz/gcviz/images/navCursor.cur),auto');
					mymap.on ('key-down', function(keyargs) {
						// Capture an escape while on the map
						if (keyargs.keyCode === 27) {
							mymap.setMapCursor('default');
							// Open the toolbars
							vmArray[mapid].header.toolsClick();
							$viz('#btnClickMap' + mapid).focus();
						}
                    });
                    // Get user to click on map and capture event
                    eventHandler = mymap.on('click', _self.getMapPoint);
                };

                _self.getMapPoint = function(event) {
                    // Get results
                    var x = event.mapPoint.x;
                    var y = event.mapPoint.y;
                    var mymap = vmArray[mapid].map.map;
                    var geomServ = new esri.tasks.GeometryService(config.urlgeomserv);
                    var inSR = mymap.spatialReference;
                    var outSR = new esri.SpatialReference({ 'wkid': 4326 });
                    var inPoint = new esri.geometry.Point(x, y, inSR);
                    // Convert to lat/long
                    var geom = [inPoint];
                    var prjParams = new esri.tasks.ProjectParameters();
                    prjParams.geometries = geom;
                    prjParams.outSR = outSR;
                    prjParams.transformation = 'Default';
                    eventHandler = geomServ.project(prjParams, _self.projectDone);
                };

                _self.projectDone = function(outPoint) {
                    var lati = outPoint[0].y;
                    var longi = outPoint[0].x;
                    // Reset cursor
                    mymap.setMapCursor('default');
                    // Display information
                    _self.displayInfo(lati, longi, config);
                    // Reopen toolbars
                };

                // _self.getInfoClick = function() {
                    // var lati = '';
                    // var longi = '';
                    // loctype = 'info';
                    // // Close the toolbars
                    // vmArray[mapid].header.toolsClick();
                    // // Get data from form and close the previous dialog
                    // lati = $viz('#inInfoLat' + mapid).val();
                    // longi = $viz('#inInfoLong' + mapid).val();
                    // //$viz('#divGetLocInfo' + mapid).dialog( "close" );
                    // _self.displayInfo(lati, longi, config);
                // };

                _self.displayInfo = function(lati, longi, config) {
                    var alti = '';
                    var DMS;
                    var domElem;
                    var geom;
                    var geometryService;
                    var inputpoint;
                    var inSR;
                    var outSR;
                    var prjParams;
                    var tmp;
                    var urlAlti = 'http://geogratis.gc.ca/services/elevation/cdem/altitude?';
                    var utmZone = '';

                    // Define the results dialog
                    $viz( '#divGetLocResults' + mapid ).dialog({
                        autoOpen: false,
                        closeText: i18n.getDict('%close'),
                        modal: true,
                        title: i18n.getDict('%toolbarnav-inforesults'),
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
                                    $viz( this ).dialog('close');
                                    if (loctype === 'map') {
                                        $viz('#btnClickMap' + mapid).focus();
                                     } else {
                                        $viz('#btnGetInfo' + mapid).focus();
                                    }
				                    // Reopen the toolbars
				                    vmArray[mapid].header.toolsClick();
                                },
                        buttons: [
                            {
                                text: i18n.getDict('%close'),
                                title: i18n.getDict('%close'),
                                click: function() {
                                    $viz( this ).dialog('close');
                                    if (loctype === 'map') {
                                        $viz('#btnClickMap' + mapid).focus();
                                     } else {
                                        $viz('#btnGetInfo' + mapid).focus();
                                    }
				                    // Reopen the toolbars
				                    vmArray[mapid].header.toolsClick();
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
                        .done(function(data){
                            _self.spnNTS(data.nts);
                        });

                    // Get the UTM zone information using a deferred objec and listen for completion
                    gisgeo.getUTMzone(lati, longi)
                        .done(function(data){
                            utmZone = data.zone;
                            _self.spnUTMzone(utmZone);
                            // Get the UTM easting/northing information using a geometry service
                            inSR = new esri.SpatialReference({ 'wkid': 4326});
                            tmp = '326' + utmZone;
                            tmp = parseInt(tmp, 10);
                            outSR = new esri.SpatialReference({ 'wkid': tmp});
                            // Transform the lat/long extent to map coordinates
                            geometryService = new esri.tasks.GeometryService(config.urlgeomserv);
                            inputpoint = new esri.geometry.Point(parseFloat(longi),parseFloat(lati), inSR);
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
                        function (data) {
                           alti = '0';
                            if (data.altitude !== null) {
								alti = data.altitude;
                            }
                            _self.spnAltitude(alti + ' m');
                        });

                    // Reopen the toolbars
                    //vmArray[mapid].header.toolsClick();
                };

				_self.init();
			};

			vm = new toolbarnavViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		//refreshov = function(overviewMapDijit) {
		//	overviewMapDijit.resize();
		//};

        //onleaveauto = function() {
        //	var divAutoComplete = $viz('#divAutoCompleteChoices' + mapid);
        //    divAutoComplete.removeClass('gcviz-showAutoComplete');
        //    divAutoComplete.addClass('gcviz-hideAutoComplete');
        //};

		return {
			initialize: initialize		};
	});
}).call(this);
