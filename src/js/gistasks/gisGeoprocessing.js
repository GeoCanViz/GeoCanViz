/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS geoprocessing functions
 */
/* global esri: false, dojo: false */
(function () {
	'use strict';
	define(['jquery-private',
            'gcviz-i18n',
            'esri/tasks/ProjectParameters',
			'esri/tasks/GeometryService',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'dojo/dom'
	], function($viz, i18n, esriProj, esriGeom, esriSR, esriPoint, dojoDom) {
		var calcDDtoDMS,
            getOutSR,
			getGSVC,
			getCoord,
			getNorthAngle,
            getNTS,
            getUTM,
            getUTMzone,
			params = new esriProj();

		calcDDtoDMS = function(lati, longi) {
            var DMS = {};
            var eastWest;
            var latD;
            var latM;
            var latReal;
            var latS;
            var longD;
            var longM;
            var longReal;
            var longS;
            var northSouth;
            var tmp;

            latReal = parseFloat(lati);
            longReal = parseFloat(longi);
            if (latReal < 0.0) {
                northSouth = 'S';
                latReal = latReal * -1.0;
            } else {
                northSouth = 'N';
            }
            latD = parseInt(latReal, 10);
            tmp = latReal - latD;
            tmp = tmp * 60.0;
            latM = parseInt(tmp, 10);
            tmp = tmp - latM;
            tmp = tmp * 60;
            latD = latD.toString();
            latM = latM.toString();
            // round lat seconds two 3 decimals
            latS = (Math.round(tmp * 1000) / 1000).toString();
            if (longReal < 0.0) {
                eastWest = i18n.getDict('%west');
                longReal = longReal * -1.0;
            } else {
                eastWest = 'E';
            }
            longD = parseInt(longReal, 10);
            tmp = longReal - longD;
            tmp = tmp * 60.0;
            longM = parseInt(tmp, 10);
            tmp = tmp - longM;
            tmp = tmp * 60;
            longD = longD.toString();
            longM = longM.toString();
            // round long seconds two 3 decimals
            longS = (Math.round(tmp * 1000) / 1000).toString();
            // Put info in object
            DMS.latD = latD;
            DMS.latM = latM;
            DMS.latS = latS;
            DMS.northSouth = northSouth;
            DMS.longD = longD;
            DMS.longM = longM;
            DMS.longS = longS;
            DMS.eastWest = eastWest;
            // return object
            return DMS;
		};

		getOutSR = function(wkid) {
			return new esriSR({ 'wkid': wkid });
		};

		getGSVC = function(urlgeomserv) {
			return new esriGeom(urlgeomserv);
		};

		getCoord = function(point, div, outSR, gsvc) {
			params.geometries = [point];
			params.outSR = outSR;

			gsvc.project(params, function(projectedPoints) {
				point = projectedPoints[0];
				dojoDom.byId(div).innerHTML = ' Lat: ' + point.y.toFixed(3) +
											' Long: ' + point.x.toFixed(3);
			});
		};

		getNorthAngle = function(extent, div, inwkid, gsvc) {

			var outSR = new esriSR({ 'wkid': 4326 }),
				pointB = new esriPoint((extent.xmin + extent.xmax) / 2,
										extent.ymin, new esriSR({ 'wkid': inwkid }));

			params.geometries = [pointB];
			params.outSR = outSR;

			gsvc.project(params, function(projectedPoints) {
				var pointA = {x: -100, y: 90},
					dLon,
					lat1,
					lat2,
					x,
					y,
					bearing;

				pointB = projectedPoints[0];
				dLon = (pointB.x - pointA.x) * Math.PI / 180;
				lat1 = pointA.y * Math.PI / 180;
				lat2 = pointB.y * Math.PI / 180;
				y = Math.sin(dLon) * Math.cos(lat2);
				x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
				bearing = Math.atan2(y, x)  * 180 / Math.PI;
				bearing = ((bearing + 360) % 360).toFixed(1) - 90; //Converting -ve to +ve (0-360)

				dojoDom.byId(div).style.webkitTransform = 'rotate(' + bearing + 'deg)';
				dojoDom.byId(div).style.MozTransform = 'rotate(' + bearing + 'deg)';
				dojoDom.byId(div).style.msTransform = 'rotate(' + bearing + 'deg)';
				dojoDom.byId(div).style.OTransform = 'rotate(' + bearing + 'deg)';
				dojoDom.byId(div).style.transform = 'rotate(' + bearing + 'deg)';
			});
		};
        getNTS = function(lati, longi) {
            var urlNTS = 'http://geogratis.gc.ca/services/delimitation/' + i18n.getDict('%lang-code') + '/nts?bbox=';
            // Use a deferred object to call the service
            var def = $viz.Deferred();
            urlNTS += longi + ',' + lati + ',' + longi + ',' + lati;
            $viz.getJSON(urlNTS).done(function(data){
                def.resolve({
                    nts:data.features[0].properties.identifier + ' - ' + data.features[0].properties.name
                });
            });
            // return the deferred object for listening
            return def;
        };

        getUTMzone = function(lati, longi) {
            var urlUTM = 'http://geogratis.gc.ca/services/delimitation/' + i18n.getDict('%lang-code') + '/utmzone?bbox=';
            // Use a deferred object to call the service
            var def = $viz.Deferred();
            urlUTM += longi + ',' + lati + ',' + longi + ',' + lati;
            $viz.getJSON(urlUTM).done(function(data){
                def.resolve({
                    zone:data.features[0].properties.identifier
                });
            });
            // return the deferred object for listening
            return def;
        };

		return {
            calcDDtoDMS: calcDDtoDMS,
			getOutSR: getOutSR,
			getGSVC: getGSVC,
			getCoord: getCoord,
			getNorthAngle: getNorthAngle,
            getNTS: getNTS,
            getUTM: getUTM,
            getUTMzone: getUTMzone
		};
	});
}());
