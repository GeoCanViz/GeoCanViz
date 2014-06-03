/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS geoprocessing functions
 */
(function () {
	'use strict';
	define(['jquery-private',
            'esri/config',
            'esri/tasks/ProjectParameters',
            'esri/tasks/DistanceParameters',
			'esri/tasks/AreasAndLengthsParameters',
			'esri/tasks/GeometryService',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'esri/geometry/Extent',
			'dojo/dom'
	], function($viz, esriConfig, esriProj, esriDist, esriArea, esriGeom, esriSR, esriPoint, esriExtent, dojoDom) {
		var setGeomServ,
			getOutSR,
			getCoord,
			getNorthAngle,
			measureLength,
			measureArea,
			labelPoints,
			zoomLocation,
			projectPoints,
			getUTMEastNorth,
			params = new esriProj();

		setGeomServ = function(url) {
			// all function will use this geometry server it is set once
			// for the map.
			esriConfig.defaults.io.geometryService = new esriGeom(url);
		};

		getOutSR = function(wkid) {
			return new esriSR({ 'wkid': wkid });
		};

		getCoord = function(point, div, outSR, lblWest) {
			var strPointX,
				strPointY,
				geomServ = esriConfig.defaults.io.geometryService;

			params.geometries = [point];
			params.outSR = outSR;

			geomServ.project(params, function(projectedPoints) {
				point = projectedPoints[0];
				if (point.x < 0) {
					strPointX = (-1 * point.x.toFixed(3)).toString() + lblWest;
				} else {
					strPointX = point.x.toFixed(3).toString() + 'E';
				}
				if (point.y < 0) {
					strPointY = (-1 * point.y.toFixed(3)).toString() + 'S';
				} else {
					strPointY = point.y.toFixed(3).toString() + 'N';
				}
				dojoDom.byId(div).innerHTML = '<span class="gcviz-foot-coords-values">' +
					' Lat: ' + strPointY +
					' Long: ' + strPointX +
					'</span>';
			});
		};

		getNorthAngle = function(extent, div, inwkid) {
			var outSR = new esriSR({ 'wkid': 4326 }),
				pointB = new esriPoint((extent.xmin + extent.xmax) / 2,
										extent.ymin, new esriSR({ 'wkid': inwkid })),
				geomServ = esriConfig.defaults.io.geometryService;

			params.geometries = [pointB];
			params.outSR = outSR;

			geomServ.project(params, function(projectedPoints) {
				var pointA = { x: -100, y: 90 },
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

		measureLength = function(array, unit, success) {
			var distUnit,
				distParams = new esriDist(),
				len = array.length,
				geomServ = esriConfig.defaults.io.geometryService;

			if (unit === 'km') {
				distUnit = esriGeom.UNIT_KILOMETER;
			} else {
				distUnit = esriGeom.UNIT_STATUTE_MILE;
			}

			distParams.distanceUnit = distUnit;
			distParams.geometry1 = array[len - 1];
			distParams.geometry2 = array[len - 2];
			distParams.geodesic = true;

			geomServ.distance(distParams, function(distance) {
				// keep 2 decimals
				array[len - 1].distance = Math.floor(distance * 100) / 100;
				success(array, unit);
			});
		};

		measureArea = function(poly, unit, success) {
			var areaUnit, distUnit,
				areaParams = new esriArea(),
				geomServ = esriConfig.defaults.io.geometryService;

			if (unit === 'km') {
				areaUnit = esriGeom.UNIT_SQUARE_KILOMETERS;
				distUnit = esriGeom.UNIT_KILOMETER;
			} else {
				areaUnit = esriGeom.UNIT_SQUARE_MILES;
				distUnit = esriGeom.UNIT_STATUTE_MILE;
			}

			areaParams.areaUnit = areaUnit;
			areaParams.lengthUnit = distUnit;
			areaParams.calculationType = 'preserveShape';

			geomServ.simplify([poly], function(simplifiedGeometries) {
				areaParams.polygons = simplifiedGeometries;
				geomServ.areasAndLengths(areaParams, function(areas) {
					success(areaParams.polygons[0], areas, unit);
				});
			});
		};

		labelPoints = function(poly, info, success) {
			var geomServ = esriConfig.defaults.io.geometryService;

			geomServ.simplify([poly], function(simplifiedGeometries) {
				geomServ.labelPoints(simplifiedGeometries, function(labelPoints) {
					success(labelPoints, info);
				});
			});
		};

		zoomLocation = function(minx, miny, maxx, maxy, mymap, outSR) {
            var inSR = new esriSR({ 'wkid': 4326 }),
				extent = new esriExtent(),
				inputpoint1 = new esriPoint(minx, miny, inSR),
				inputpoint2 = new esriPoint(maxx, maxy, inSR),
				geom = [inputpoint1, inputpoint2],
				geomServ = esriConfig.defaults.io.geometryService;

            params.geometries = geom;
            params.outSR = outSR;

            // Transform the lat/long extent to map coordinates
            geomServ.project(params, function(projectedPoints) {
				var pt1 = projectedPoints[0],
					pt2 = projectedPoints[1];
				extent = new esriExtent(pt1.x, pt1.y, pt2.x, pt2.y, outSR);
                mymap.setExtent(extent, true);
            });
		};

		projectPoints = function(points, outwkid, success) {
			var geomServ = esriConfig.defaults.io.geometryService;
			
			params.geometries = points;
			params.outSR = new esriSR({ 'wkid': outwkid });

			geomServ.project(params, function(projectedPoints) {
				var geom = params.geometries,
					len = geom.length;

				// put back the attributes
				while (len--) {
					projectedPoints[len].attributes = geom[len].attributes;
				}
				success(projectedPoints);
			});
		};

		getUTMEastNorth = function(lati, longi, utmZone, spnUTMeast, spnUTMnorth) {
			// Get the UTM easting/northing information using a geometry service
			var geomServ = esriConfig.defaults.io.geometryService,
				inSR = new esriSR({ 'wkid': 4326 }),
				outUTM = '326' + utmZone,
				outWkid = parseInt(outUTM, 10),
				outSR = new esriSR({ 'wkid': outWkid }),
				inputpoint = new esriPoint(parseFloat(longi), parseFloat(lati), inSR);

			params.geometries = [inputpoint];
			params.outSR = outSR;

			// Transform the lat/long extent to map coordinates
			geomServ.project(params, function(projectedPoints) {
				spnUTMeast(' ' + Math.round(projectedPoints[0].x));
				spnUTMnorth(' ' + Math.round(projectedPoints[0].y));
			});
		};

		return {
			setGeomServ: setGeomServ,
			getOutSR: getOutSR,
			getCoord: getCoord,
			getNorthAngle: getNorthAngle,
			measureLength: measureLength,
			measureArea: measureArea,
			labelPoints: labelPoints,
            zoomLocation: zoomLocation,
			projectPoints: projectPoints,
			getUTMEastNorth: getUTMEastNorth
		};
	});
}());

