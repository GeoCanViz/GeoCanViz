/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS navigation functions
 */
(function () {
	'use strict';
	define([], function() {
		var zoomFullExtent;
			
		zoomFullExtent = function(mymap) {
			mymap.setExtent(mymap.vInitExtent, mymap.spatialReference.wkid);
		};
			
		return {
			zoomFullExtent: zoomFullExtent
		};
	});
}());