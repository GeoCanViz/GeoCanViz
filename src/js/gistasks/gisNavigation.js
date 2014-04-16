/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS navigation functions
 */
/* global esri: false */
(function () {
	'use strict';
	define(['esri/geometry/Extent','esri/tasks/geometry'
        ], function() {
		var zoomFullExtent,
            zoomLocation;

		zoomFullExtent = function(mymap) {
			mymap.setExtent(mymap.vFullExtent, mymap.spatialReference.wkid);
		};
		zoomLocation = function(minx, miny, maxx, maxy, mymap, urlgeomserv) {
            var inSR = new esri.SpatialReference({'wkid': 4326});
            var outSR = new esri.SpatialReference({'wkid': mymap.spatialReference.wkid});
            var extent = new esri.geometry.Extent();

            // Transform the lat/long extent to map coordinates
            var geometryService = new esri.tasks.GeometryService(urlgeomserv);
            var inputpoint1 = new esri.geometry.Point(minx, miny, inSR);
            var inputpoint2 = new esri.geometry.Point(maxx, maxy, inSR);
            var geom = [inputpoint1, inputpoint2];
            var prjParams = new esri.tasks.ProjectParameters();
            prjParams.geometries = geom;
            prjParams.outSR = outSR;
            prjParams.transformation = 'Default';
            geometryService.project(prjParams, function(projectedPoints) {
                extent = new esri.geometry.Extent(projectedPoints[0].x, projectedPoints[0].y, projectedPoints[1].x, projectedPoints[1].y, outSR);
                mymap.setExtent(extent, true);
            });
		};

		return {
			zoomFullExtent: zoomFullExtent,
			zoomLocation: zoomLocation
		};
	});
}());