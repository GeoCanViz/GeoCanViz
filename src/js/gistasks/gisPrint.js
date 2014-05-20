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
			'esri/tasks/PrintTemplate',
			'esri/dijit/Print',
			'esri/tasks/PrintTask',
			'esri/tasks/PrintParameters',
			'esri/request',
			'dojo/_base/array'
	], function($viz, esriPrintTemp, esriPrint, esriPrintTask, esriPrintParams, esriRequest, arrayUtils) {
		var printMap,
			printResult,
			PdfUtil,
			handlePrintInfo,
			handleError,
			printInfo;

		printMap = function(url, map) {
			var printTask = new esriPrintTask(url),
				params = new esriPrintParams(),
				template = new esriPrintTemp();
				
  template.exportOptions = {
    dpi: 96
  };
  template.format = "PDF";
  template.layout = "Letter ANSI A Landscape";
  template.layoutOptions = {
				"scalebarUnit": "Kilometers",
				"copyrightText": "© Her Majesty the Queen in Right of Canada / © Sa Majesté la Reine du chef du Canada"
			};
  template.preserveScale = true;
  
  			params.template = template;
  			params.map = map;
  			printTask.execute(params, printResult);
		};
		
		printResult = function(response) {
			var win = window.open(response.url, '_blank');
			win.print();
		};
	

		handlePrintInfo = function(resp) {
			var layoutTemplate, templateNames, mapOnlyIndex, templates;

			layoutTemplate = arrayUtils.filter(resp.parameters, function(param, idx) {
				return param.name === "Layout_Template";
			});
          
			if (layoutTemplate.length === 0) {
				console.log("print service parameters name for templates must be \"Layout_Template\"");
				return;
			}
			templateNames = layoutTemplate[0].choiceList;

			// remove the MAP_ONLY template then add it to the end of the list of templates 
			mapOnlyIndex = arrayUtils.indexOf(templateNames, "MAP_ONLY");
			if (mapOnlyIndex > -1) {
				var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
				templateNames.push(mapOnly);
			}
          
			// create a print template for each choice
			templates = arrayUtils.map(templateNames, function(ch) {
			var plate = new esriPrintTemp();
			plate.layout = plate.label = ch;
			plate.format = "PDF";
			plate.layoutOptions = { 
				"authorText": "Made by:  Esri's JS API Team",
				"copyrightText": "<copyright info here>",
				"legendLayers": [], 
				"titleText": "Pool Permits", 
				"scalebarUnit": "Miles" 
			};
			return plate;
			});
			
			// create the print dijit
			var printer = new esriPrint({
				"map": printInfo.map,
				"templates": templates,
				url: printInfo.printUrl
			}, dom.byId("print"));
			printer.startup();
		};
		
		handleError = function(err) {
			console.log("Printing broken: ", err);
		};
        
		return {
			printMap: printMap
		};
	});
}());
