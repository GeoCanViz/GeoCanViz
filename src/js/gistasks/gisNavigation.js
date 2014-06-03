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
			'esri/dijit/Scalebar',
            'dojo/dom'
	], function($viz, gisMap, esriPoint, esriOV, esriSB, dojoDom) {
		var setOverview,
			setScaleBar,
            getNTS,
            getUTMzone,
			zoomFullExtent;

		setOverview = function(mymap, overview) {
			var overviewMapDijit,
				bLayer = null,
				mapid = mymap.vIdName,
				ovDiv = dojoDom.byId('divOverviewMap' + mapid),
				type = overview.type,
				url = overview.url,
				options = { map: mymap,
							expandFactor: 2,
							height: 100,
							width: 237 };

				// If no layer specified, use the main map
				// layer must be ArcGIS tiled, dynamic or imagery. It can also be OpenStreet map
				bLayer = gisMap.getOverviewLayer(type, url);
				if (bLayer !== null) {
						options.baseLayer = bLayer;
				}
				overviewMapDijit = new esriOV(options, ovDiv);

				// TODO:
				// we need to startup only when we see the div.
				// open the tools and panels, startup then put back the original state
				overviewMapDijit.startup();

				// work around to resize the overview div because it wont work only
				// with the option from the dijit.
				setTimeout(function() {
					var divOV = $viz('#divOverviewMap' + mapid + '-map');
					divOV.width(237).height(100);
					overviewMapDijit.resize();
				}, 2000);
		};

		setScaleBar = function(mymap, scalebar) {
			var sbMapDijit,
				ovSB = dojoDom.byId('divScalebar' + mymap.vIdName),
				options = { map: mymap,
							scalebarStyle: 'line',
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

            urlNTS += longi + ',' + lati + ',' + longi + ',' + lati;
            $viz.getJSON(urlNTS).done(function(data){
                def.resolve({
                    nts:data.features[0].properties.identifier + ' - ' + data.features[0].properties.name
                });
            });
            // return the deferred object for listening
            return def;
        };

        getUTMzone = function(lati, longi, urlUTM) {
            var def = $viz.Deferred(); // Use a deferred object to call the service

            urlUTM += longi + ',' + lati + ',' + longi + ',' + lati;
            $viz.getJSON(urlUTM).done(function(data){
                def.resolve({
                    zone:data.features[0].properties.identifier
                });
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
            zoomFullExtent: zoomFullExtent
		};
	});
}());

