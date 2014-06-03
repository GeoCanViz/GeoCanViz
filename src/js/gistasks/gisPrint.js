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
			'esri/tasks/PrintTask',
			'esri/tasks/PrintParameters'
	], function($viz, func, esriPrintTemp, esriPrintTask, esriPrintParams) {
		var printMap,
			printResult,
			printError,
			htmlPage;

		printMap = function(map, printInfo) {
			// We cant use the print task for certain type now because it is not able to deal with
			// cluster graphic layers.
			// TODO try to solve this or stay with the new approach
			var printTask = new esriPrintTask(printInfo.url),
				params = new esriPrintParams(),
				template = new esriPrintTemp();

			// set the html page to open
			htmlPage = printInfo.template;
			
			// set the print template and print parameters then call the task
			template.exportOptions = { dpi: 96 };
			template.format = 'PNG8';
			template.layout = 'Letter ANSI A Landscape';
			template.layoutOptions = {
				'scalebarUnit': 'Kilometers',
				'copyrightText': printInfo.copyright,
				'legendLayer': []
			};
			template.preserveScale = true;
  
			params.template = template;
			params.map = map;
			printTask.execute(params, printResult, printError);
		};

		printResult = function(response) {
			var win;
			
			win = window.open(htmlPage + 'defaultPrint.html');
			win.onload = function() {
				// instead of adding '<img src="' + response.url + '"></img>' from print task
				// we clone the map and add it to our print page
				var print = win.document.getElementsByClassName('gcviz-print');
				$viz(print).append('<img src="' + response.url + '"></img>');
				win.print();
			};
		};
		
		printError = function(err) {
			console.log("Printing broken: ", err);
		};


		return {
			printMap: printMap
		};
	});
}());
