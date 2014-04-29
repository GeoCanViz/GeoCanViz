/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS geoprocessing functions
 */
(function () {
	'use strict';
	define(['esri/tasks/ProjectParameters',
			'esri/tasks/DistanceParameters',
			'esri/tasks/AreasAndLengthsParameters',
			'esri/tasks/AreasAndLengthsParameters',
			'esri/tasks/GeometryService',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'dojo/dom'
	], function(esriProj, esriDist, esriArea, esriLengthArea, esriGeom, esriSR, esriPoint, dojoDom) {
		var getOutSR,
			getGSVC,
			getCoord,
			getNorthAngle,
			measureLength,
			measureArea,
			params = new esriProj();

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

		measureLength = function(array, unit, success) {
			var distUnit,
				distParams = new esriDist(),
				len = array.length;
			
			// TODO remove when we have the global one!
			var gserv = new esriGeom('http://geoappext.nrcan.gc.ca/arcgis/rest/services/Utilities/Geometry/GeometryServer');
			
			if (unit === 'km') {
				distUnit = esriGeom.UNIT_KILOMETER;
			} else {
				distUnit = esriGeom.UNIT_STATUTE_MILE;
			}
			
			distParams.distanceUnit = distUnit;
			distParams.geometry1 = array[len - 1];
			distParams.geometry2 = array[len - 2];
			distParams.geodesic = true;
			
			gserv.distance(distParams, function(distance) {
				// keep 2 decimals
				array[len - 1].distance = Math.floor(distance * 100) / 100;
				success(array);
			});
		};
		
		measureArea = function(poly, unit, success) {
			var areaUnit, distUnit,
				areaParams = new esriArea();
			
			// TODO remove when we have the global one!
			var gserv = new esriGeom('http://geoappext.nrcan.gc.ca/arcgis/rest/services/Utilities/Geometry/GeometryServer');
			
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
						
			gserv.simplify([poly], function(simplifiedGeometries) {
				areaParams.polygons = simplifiedGeometries;
				gserv.areasAndLengths(areaParams, function(areas) {
					success(areaParams.polygons[0].rings, areas, unit);
				});
			});
		};
		
		return {
			getOutSR: getOutSR,
			getGSVC: getGSVC,
			getCoord: getCoord,
			getNorthAngle: getNorthAngle,
			measureLength: measureLength,
			measureArea: measureArea
		};
	});
}());
