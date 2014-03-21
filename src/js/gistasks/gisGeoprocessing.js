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
			'esri/tasks/GeometryService',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'dojo/dom'
	], function(esriProj, esriGeom, esriSR, esriPoint, dojoDom) {
		var getOutSR,
			getGSVC,
			getCoord,
			getNorthAngle,
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

		return {
			getOutSR: getOutSR,
			getGSVC: getGSVC,
			getCoord: getCoord,
			getNorthAngle: getNorthAngle
		};
	});
}());
