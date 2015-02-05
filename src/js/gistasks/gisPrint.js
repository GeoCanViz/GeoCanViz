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
			'esri/tasks/PrintParameters',
			'esri/tasks/Geoprocessor'
	], function($viz, func, esriPrintTemp, esriPrintTask, esriPrintParams, esriGeoProcessor) {
		var printMap,
			printResult,
			printError,
			htmlPage,
			getMxdElements,
			gpJobComplete,
			getMxdElementsSuccess,
			gpJobStatus,
			gpJobFailed,
			loopLayoutInputs,
			getMapCenter,
			getLayoutElements,
			printCustomMap,
			printCustomResult,
			printCustomError;

		 var gp = null;

		getMxdElements = function(url, templateName) {
			gp = new esriGeoProcessor(url);
			var params = {'TemplateName' : templateName};
			gp.submitJob(params, gpJobComplete, gpJobStatus, gpJobFailed);
		};

		gpJobComplete = function(jobinfo) {
			gp.getResultData(jobinfo.jobId, 'MXDElements', getMxdElementsSuccess, printError);
		};

		getMxdElementsSuccess = function(results) {	
			var parametersAll = results.value;
			var parameters = parametersAll.split(',');
			
			var elementType = '',
				elementLabel = '',
				newElement = '',
			    printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements');

			$viz(printTextElements).empty();
			$viz(printPictureElements).empty();
			$viz(printMapSurroundElements).empty();

			parameters.forEach(function(pair) {
				 pair = pair.split(':');
				 elementType = pair[1];
				 elementLabel = pair[0];

				 if (elementType == 'TEXT_ELEMENT') {
				 		newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">'+ elementLabel +'</span></div><div class="gcviz-printCol"><input type="text" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="'+ elementLabel +'"></input></div>');
						$viz(printTextElements).append(newElement);
				 }
				 else if (elementType == 'MAPSURROUND_ELEMENT'  || elementType == 'LEGEND_ELEMENT') {
				 		newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">'+ elementLabel +'</span></div><div class="gcviz-printCol"><input type="checkbox" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="'+ elementLabel + '"></input><div>');
						$viz(printMapSurroundElements).append(newElement);
				 }
				 else if(elementType == 'PICTURE_ELEMENT') {
				 		newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">'+ elementLabel +'</span></div><div class="gcviz-printCol"><input type="text" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="'+ elementLabel + '"></input><div>');
				 		$viz(printPictureElements).append(newElement);
				 }

			});
			
		};

		gpJobStatus = function(jobinfo) {
			//console.log(jobinfo);
		};

		gpJobFailed = function(error) {
			//console.log(error);
		};

		loopLayoutInputs = function() {
		
		};

		getMapCenter = function(map) {
			var e =  map.extent.getCenter();
			return e.x + ':' + e.y; //e['x']+':'+ e['y']
		};

		getLayoutElements = function() {

			var printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements'),
			    layoutElements = {};

			$viz(printTextElements).find('input').each(function () {
				if(this.value.trim().length > 0) 
					layoutElements[String(this.name)] = this.value;
				else
					layoutElements[String(this.name)] = ' '; //need at least a blank space for arcpy mapping text elements, can't set to ""
			});

			$viz(printMapSurroundElements).find('input').each(function () {
				 layoutElements[String(this.name)] = String(this.checked);
			});

			$viz(printPictureElements).find('input').each(function () {
				 layoutElements[String(this.name)] = this.value;
			});

			return JSON.stringify(layoutElements);
			
		};

		printCustomMap = function (map, url, templateName, preserve, DPIValue) {
			
			var printTask = new esriPrintTask(url, {async: true}),
				params = new esriPrintParams(),
				template = new esriPrintTemp();
		
			template.exportOptions = { dpi: DPIValue };
			template.format = 'PDF';
			template.layout = templateName;
			if (preserve == 'extent') {
				template.preserveScale = false;
			} else { template.preserveScale = true; }

			params.template = template;
			params.map = map;
			
			if(preserve != 'extent') {
				params.extraParameters = {'Lang': 'EN',
									      'Scale': String(map.getScale()),
									      'CenterPoint': getMapCenter(map),
									      'Layout_Elements': getLayoutElements()
				}; 		
			}
			else {
				params.extraParameters = {'Lang': 'EN',
									      'Scale': String(map.getScale()),
									      'Layout_Elements': getLayoutElements()
				}; 		
			}
			
			printTask.execute(params, printCustomResult, printCustomError);

		};

		printCustomResult = function(result) {
			window.open(result.url);
		};

		printCustomError = function(response) {
			console.log(response);
		};

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
			console.log('Printing broken: ', err);
		};


		return {
			printMap: printMap,
			getMxdElements: getMxdElements,
			printCustomMap:printCustomMap
		};
	});
}());
