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
			'gcviz-func',
			'esri/tasks/PrintTemplate',
			'esri/dijit/Print',
			'esri/tasks/PrintTask',
			'esri/tasks/PrintParameters',
			'esri/request'
	], function($viz, func, esriPrintTemp, esriPrint, esriPrintTask, esriPrintParams, esriRequest) {
		var printMap,
			printResult;

		printMap = function(map, printInfo) {
			// We cant use the print task for now because it is not able to deal with
			// cluster graphic layers.
			// TODO try to solve this or stay with the new approach
			// var printTask = new esriPrintTask(printInfo.url),
				// params = new esriPrintParams(),
				// template = new esriPrintTemp();
// 
			// template.exportOptions = { dpi: 96 };
			// template.format = "PNG32";
			// template.layout = "Letter ANSI A Landscape";
			// template.layoutOptions = {
				// 'scalebarUnit': 'Kilometers',
				// 'copyrightText': printInfo.copyright,
				// 'legendLayer': []
			// };
			// template.preserveScale = true;
//   
			// params.template = template;
			// params.map = map;
			// printPath = printInfo.template;
			//printTask.execute(params, printResult, printError);
			printResult(map, printInfo.template);
		};

		printResult = function(map, template) {
			var node = $viz('#map1_holder').clone();
			var win = window.open(template + 'defaultPrint.html');

			win.onload = function() {
				// instead of adding '<img src="' + response.url + '"></img>' from print task
				// we clone the map and add it to our print page
				var print = win.document.getElementsByClassName('gcviz-print');
				print[0].style.width = node.width();
				$viz(print).append(node);
				win.print();
			};
		};

		return {
			printMap: printMap
		};
	});
}());
