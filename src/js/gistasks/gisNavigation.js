/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS navigation functions
 */
(function () {
	'use strict';
	define(['jquery-private',
			'gcviz-gismap',
			'esri/geometry/Point',
			'esri/dijit/OverviewMap',
			'esri/dijit/Scalebar'
	], function($viz, gisMap, esriPoint, esriOV, esriSB) {
		var setOverview,
			setScaleBar,
			getNTS,
			getUTMzone,
			getAltitude,
			getMagneticDecl,
			zoomFullExtent;

		setOverview = function(mymap, overview) {
			var ovTool, ovMap,
				ovToolDiv, ovMapDiv,
				bLayer = null,
				mapid = mymap.vIdName,
				type = overview.type,
				url = overview.url,
				options = { map: mymap,
							expandFactor: 2,
							height: 100,
							width: 230 };

				// If no layer specified, use the main map
				// layer must be ArcGIS tiled, dynamic or imagery. It can also be OpenStreet map
				if (url !== '') {
					bLayer = gisMap.getOverviewLayer(type, url);
				}

				if (bLayer !== null) {
					options.baseLayer = bLayer;
				}
				ovTool = new esriOV(options, document.getElementById('divOverviewMap' + mapid));
				ovMap = new esriOV(options, document.getElementById('ovmap' + mapid));

				// *** startup the overview map in the toolbarnav (we need to see the div)
				// work around to resize the overview div because it wont work only
				// with the option from the dijit.
				ovToolDiv = $viz('#divOverviewMap' + mapid + '-map');
				ovToolDiv.width(230).height(100);
				ovTool.resize();

				// *** set the overview map on the map. We need both because user can decide to see it on the map
				ovMapDiv = $viz('ovmap' + mapid + '-map');
				ovMapDiv.width(230).height(100);
				ovMap.resize();
				ovMap.hide();

				// return both object to be able to show and hide from the viewmodel
				return [ovTool, ovMap];
		};

		setScaleBar = function(mymap, scalebar) {
			var sbMapDijit,
				ovSB = document.getElementById('scalebar' + mymap.vIdName),
				options = { map: mymap,
							scalebarStyle: 'ruler',
							scalebarUnit: 'metric',
							height: 25,
							width: 200 };

				if (scalebar.unit === 2) {
					options.units = 'english';
				}

				sbMapDijit = new esriSB(options, ovSB);
		};

		getNTS = function(lati, longi, urlNTS) {
			var def = $viz.Deferred(); // Use a deferred object to call the service

			$viz.ajax({
				url: urlNTS,
				cache: false,
				data: { bbox: longi + ',' + lati + ',' + longi + ',' + lati },
				dataType: 'jsonp', // jsonp because it is cross domain
				success: function(data) {
					def.resolve({
						nts: data.features
					});
				}
			});

			// return the deferred object for listening
			return def;
		};

		getUTMzone = function(lati, longi, urlUTM) {
			var def = $viz.Deferred(); // Use a deferred object to call the service

			$viz.ajax({
				url: urlUTM,
				cache: false,
				data: { bbox: longi + ',' + lati + ',' + longi + ',' + lati },
				dataType: 'jsonp', // jsonp because it is cross domain
				success: function(data) {
					def.resolve({
						zone: data.features[0].properties.identifier
					});
				}
			});

			// return the deferred object for listening
			return def;
		};

		getAltitude = function(lati, longi, urlAlti) {
			var def = $viz.Deferred(); // Use a deferred object to call the service

			$viz.ajax({
				url: urlAlti,
				cache: false,
				data: { lat: lati, lon: longi },
				dataType: 'jsonp', // jsonp because it is cross domain
				success: function(data) {
					def.resolve({
						altitude: data.altitude
					});
				}
			});

			// return the deferred object for listening
			return def;
		};

		getMagneticDecl = function(dateT, lati, longi, urlMD) {
			var def = $viz.Deferred(); // Use a deferred object to call the service
			
			if (lati === 'NaN' || longi === 'NaN') {
				def.resolve({
						status: 'out_of_scope'
				});
				return def;
			}
			
			$viz.ajax({
				url: urlMD,
				cache: true,
				// http://www.geomag.nrcan.gc.ca/service/tools/magnetic/calculator/?latitude=45.40034891216681&longitude=-75.66947808521965&date=2015-12-17
				data: { latitude: lati, longitude: longi, date: dateT, format: 'json' },
				dataType: 'json',
				success: function(data) {
					def.resolve({
						mD: data.components.D,
						annCh: data.annual_change.dD,
						compass: data.compass,
						status: def.state()
					});
				}
			});

			// return the deferred object for listening
			return def;
		};

		zoomFullExtent = function(mymap) {
			mymap.setExtent(mymap.vFullExtent, mymap.spatialReference.wkid);
		};

		return {
			setOverview: setOverview,
			setScaleBar: setScaleBar,
			getNTS: getNTS,
			getUTMzone: getUTMzone,
			getAltitude: getAltitude,
			getMagneticDecl: getMagneticDecl,
			zoomFullExtent: zoomFullExtent
		};
	});
}());
