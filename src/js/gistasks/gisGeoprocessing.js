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
	define([], function() {
	
		var getCoord,
			getNorthAngle,
			params = new esri.tasks.ProjectParameters(),
			outSR,
			gsvc;

		getCoord = function(point, div, config) {
			if (typeof outSR === 'undefined') { 
				outSR = new esri.SpatialReference({wkid: config.outwkid});
			}
			
			if (typeof gsvc === 'undefined') {
				gsvc = new esri.tasks.GeometryService(config.urlgeomserv);
			}
	
			params.geometries = [point];
			params.outSR = outSR;

			gsvc.project(params, function(projectedPoints) {
				point = projectedPoints[0];
				dojo.byId(div).innerHTML = ' Lat: ' + point.y.toFixed(3) + ' Long: ' + point.x.toFixed(3);
			});
		};
		
		getNorthAngle = function(extent, div, config) {
			
			var outSR = new esri.SpatialReference({wkid: 4326}),
				pointB = new esri.geometry.Point((extent.xmin + extent.xmax) / 2, extent.ymin, new esri.SpatialReference({wkid: config.inwkid}));
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
					 
					dojo.byId(div).style.webkitTransform = 'rotate(' + bearing + 'deg)';
					dojo.byId(div).style.MozTransform = 'rotate(' + bearing + 'deg)';
					dojo.byId(div).style.msTransform = 'rotate(' + bearing + 'deg)';
					dojo.byId(div).style.OTransform = 'rotate(' + bearing + 'deg)';
					dojo.byId(div).style.transform = 'rotate(' + bearing + 'deg)';
				});
		};
			
		return {
			getCoord: getCoord,
			getNorthAngle: getNorthAngle
		};
	});
}());