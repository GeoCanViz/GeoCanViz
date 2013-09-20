/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS navigation functions
 */
/* global esri: false, dojo: false */
(function () {
	'use strict';
	define([], function() {
		var initialize,
			zoomFullExtent;
			
		zoomFullExtent = function(mymap) {
			mymap.setExtent(mymap.vInitExtent, mymap.spatialReference.wkid);
		};
			
		return {
			zoomFullExtent: zoomFullExtent,
		};
	});
}());