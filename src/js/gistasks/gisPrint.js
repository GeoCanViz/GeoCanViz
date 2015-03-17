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
			getTemplates,
			getMxdElements,
			gpJobComplete,
			printBasicMap,
			gpHTMLJobComplete,
			populateHtmlTemplates,
			getMxdElementsSuccess,
			getMxdElementsError,
			gpJobStatus,
			gpJobFailed,
			getMapCenter,
			getLayoutElements,
			getHTMLLayoutElements,
			printCustomMap,
			printCustomResult,
			printCustomError,
			printHTMLError,
			gp = null,
			gpFolders = null,
			lang = $viz('html').attr('lang').toUpperCase();

		getTemplates = function(url, layout, printType) {
				
			var params = { 'Folder': lang,
						   'PrintType': printType,
						   'Layout': layout},
				dfd = $viz.Deferred();
			gpFolders = new esriGeoProcessor(url);
			gpFolders.submitJob(params, function(jobinfo){
				gpFolders.getResultData(jobinfo.jobId, 'Templates', function(results){
					dfd.resolve(results.value);
				});
			}, gpJobStatus, gpJobFailed);
			
			return dfd;
		};

		getMxdElements = function(url, templateName) {
			var params = { 'TemplateName': templateName};
			gp = new esriGeoProcessor(url);
			gp.submitJob(params, gpJobComplete, gpJobStatus, gpJobFailed);
		};

		gpJobComplete = function(jobinfo) {
			gp.getResultData(jobinfo.jobId, 'MXDElements', getMxdElementsSuccess, getMxdElementsError);
		};

		getMxdElementsSuccess = function(results) {
			var parametersAll = results.value,
				parameters = parametersAll.split(','),
				elementType = '',
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
				 
				 if (elementLabel.indexOf("9999#") >= 0) 
				 	elementLabel = elementLabel.substring(elementLabel.indexOf("#") + 1);
				 
				 if (elementType === 'TEXT_ELEMENT') {
				        newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + elementLabel.substring(elementLabel.indexOf("#") + 1) + '</span></div><div class="gcviz-printCol"><input type="text" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="' + elementLabel + '"></input></div>');
                        $viz(printTextElements).append(newElement);
				 }
				 else if (elementType === 'MAPSURROUND_ELEMENT' || elementType === 'LEGEND_ELEMENT') {
				        newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + elementLabel.substring(elementLabel.indexOf("#") + 1) + '</span></div><div class="gcviz-printCol"><input type="checkbox" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="' + elementLabel + '"></input><div>');
						$viz(printMapSurroundElements).append(newElement);
				 }
				 else if(elementType === 'PICTURE_ELEMENT') {
                        newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + elementLabel.substring(elementLabel.indexOf("#") + 1) + '</span></div><div class="gcviz-printCol"><input type="text" id="gcviz-print' + elementLabel.replace(/ /g,'') + '" name="' + elementLabel + '"></input><div>');
                        $viz(printPictureElements).append(newElement);
				 }
			});
		};

		getMxdElementsError = function(err) {
			console.log('getMxdElements Error: ', err);
		};

		gpJobStatus = function(jobinfo) {
			//console.log(jobinfo);
		};

		gpJobFailed = function(error) {
			console.log("gpJobFailed" + error);
		};

		getMapCenter = function(map) {
			var e =  map.extent.getCenter();
			return e.x + ':' + e.y;
		};

		getLayoutElements = function() {
			var printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements'),
			    layoutElements = {},
			    elementName = '',
			    elementValue = '';

			$viz(printTextElements).find('input').each(function () {
				elementName = this.name;
				elementValue = this.value;
				if(elementValue.trim().length > 0) {
					layoutElements[String(elementName)] = elementValue;
				}
				else {
					layoutElements[String(elementName)] = ' '; //need at least a blank space for arcpy mapping text elements, can't set to ""
				}
			});

			$viz(printMapSurroundElements).find('input').each(function () {
				elementName = this.name;
				layoutElements[String(elementName)] = String(this.checked);
			});

			$viz(printPictureElements).find('input').each(function () {
				elementName = this.name;
				elementValue = this.value;
				layoutElements[String(elementName)] = elementValue;
			});

			return JSON.stringify(layoutElements);
		};

		getHTMLLayoutElements = function() {
			var printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    layoutElements = {},
			    elementName = '',
			    elementValue = '';

			$viz(printTextElements).find('input').each(function () {
				elementName = this.id;
				elementValue = this.value;
				if(elementValue.trim().length > 0) {
					layoutElements[String(elementName)] = elementValue;
				}
				else {
					layoutElements[String(elementName)] = ' '; 
				}
			});

			$viz(printPictureElements).find('input').each(function () {
				elementName = this.id;
				elementValue = this.value;
				layoutElements[String(elementName)] = elementValue;
			});

			return JSON.stringify(layoutElements);
		};

		printCustomMap = function(map, url, templateName, preserve, DPIValue, forcedScale) {
			var printTask = new esriPrintTask(url, { async: true }),
				params = new esriPrintParams(),
				template = new esriPrintTemp();
		
			template.exportOptions = { dpi: DPIValue };
			template.format = 'PDF';
			template.layout = templateName;
			if (preserve === 'extent' || preserve === 'force') {
				template.preserveScale = false;
			} else { 
				template.preserveScale = true; 
			}

			params.template = template;
			params.map = map;
			
			if (preserve === 'scale') {
				params.extraParameters = { 'Lang': lang,
									       'Layout_Elements': getLayoutElements()
                };		
			} else if (preserve === 'force') {
				params.extraParameters = { 'Lang': lang,
									       'Scale': forcedScale,
									       'CenterPoint': getMapCenter(map),
									       'Layout_Elements': getLayoutElements()
                };	
			} else {
				params.extraParameters = { 'Lang': lang,
									       'Layout_Elements': getLayoutElements()
                };		
			}
			
			printTask.execute(params, printCustomResult, printCustomError);
		};

		printCustomResult = function(result) {
			window.open(result.url);
		};

		printCustomError = function(response) {
			console.log("printCustomError" + response);
		};

		printHTMLError = function(response) {
			console.log("printHTMLError" + response);
		};

		printBasicMap = function(map, url, templateName, preserve, forcedScale) {

			var win,
				orig,
				map,
				mapholder,
				updatedHTML,
				mapholderWidth,
				mapholderHeight;

			$viz.get( templateName, function( data ) {
					orig = $('<div />').html(data);
					mapholder = orig.find('[id^=gcviz-print]');
					mapholderWidth = $(mapholder).width();
					mapholderHeight = $(mapholder).height();

					var printTask = new esriPrintTask(url,  { async: true }),
						params = new esriPrintParams(),
						template = new esriPrintTemp();

					template.format = 'png8';
					template.layout = 'MAP_ONLY';
					template.layoutOptions = {
						'scalebarUnit': 'Kilometers'
					};
					if (mapholderWidth > 0 ) {
						template.exportOptions.width = mapholderWidth;
					}
					if (mapholderHeight > 0 ) {
						template.exportOptions.height = mapholderHeight;
					}
					template.exportOptions.dpi = 96;

					if (preserve === 'extent') {
						template.preserveScale = false;
					} else { 
						template.preserveScale = true; 
						if(preserve === 'force')
							template.outScale = forcedScale;
						else
							template.outScale = map.getScale();
					}

					params.template = template;
					params.map = map;

					printTask.execute(params, function(response) {
		
						var elements = getHTMLLayoutElements(),
						element,
						obj;
						console.log(response.url);
						$viz(mapholder).append('<img src="' + response.url + '"></img>');
						obj  = jQuery.parseJSON( elements );
						$viz.each(obj, function(key, value) {
							orig.find('[id^=' + key + ']').each( function() {
								$(this).text(value);
							});
						});

						updatedHTML = orig.html();
						win = window.open('');
						win.document.write(updatedHTML);
					}, printError);

				
			});

			
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
			
		};

		printError = function(err) {
			console.log('Printing broken: ', err);
		};


		return {
			printMap: printMap,
			getTemplates: getTemplates,
			getMxdElements: getMxdElements,
			printCustomMap: printCustomMap,
			printBasicMap: printBasicMap
		};
	});
}());
