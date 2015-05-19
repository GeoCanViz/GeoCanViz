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
			saveImageMap,
			saveImageResult,
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
			generateHTMLPrint,
			printCustomMap,
			printCustomResult,
			printCustomError,
			printHTMLError,
			gp = null,
			gpFolders = null,
			lang = $viz('html').attr('lang').toUpperCase(),
			callPrintTask,
			addImagetoHtmlPrint;

		getTemplates = function(url, layout, printType, projects) {
			var params = { 'Folder': lang,
						   'PrintType': printType,
						   'Layout': layout,
						   'Projects': projects.join(',')},
				dfd = $viz.Deferred();

			gpFolders = new esriGeoProcessor(url);
			gpFolders.submitJob(params, function(jobinfo) {
				gpFolders.getResultData(jobinfo.jobId, 'Templates', function(results) {
					dfd.resolve(results.value);
				});
			}, gpJobStatus, gpJobFailed);
			
			return dfd;
		};

		getMxdElements = function(url, templateName) {
			var params = { 'TemplateName': templateName,
						   'Lang': lang };
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
			console.log('gpJobFailed' + error);
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

			$viz(printTextElements).find('input').each(function() {
				elementName = this.name;
				elementValue = this.value;
				if (elementValue.trim().length > 0) {
					layoutElements[String(elementName)] = elementValue;
				}
				else {
					layoutElements[String(elementName)] = ' '; //need at least a blank space for arcpy mapping text elements, can't set to ""
				}
			});

			$viz(printMapSurroundElements).find('input').each(function() {
				elementName = this.name;
				layoutElements[String(elementName)] = String(this.checked);
			});

			$viz(printPictureElements).find('input').each(function() {
				elementName = this.name;
				elementValue = this.value;
				layoutElements[String(elementName)] = elementValue;
			});

			return JSON.stringify(layoutElements);
		};

		getHTMLLayoutElements = function() {
			var printTextElements = document.getElementById('gcviz-printTextElements'),
				printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    layoutElements = {},
			    elementName = '',
			    elementValue = '';

			$viz(printTextElements).find('input').each(function() {
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

			$viz(printMapSurroundElements).find('input').each(function() {
				elementName = this.id;
				layoutElements[String(elementName)] = String(this.checked);
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
			console.log('printCustomError' + response);
		};

		printHTMLError = function(response) {
			console.log('printHTMLError' + response);
		};

		callPrintTask = function(printTask, params) {
				var dfd = $viz.Deferred();
				
				if (printTask !== null) {
					printTask.execute(params, function(response) {
						dfd.resolve(response.url);
					}, printError);
					return dfd;
				}
				else {
					return null;
				}
		};
		
		printBasicMap = function(map, url, templateName, preserve, forcedScale, dpivalue) {
			
			var	orig,
				map,
				mapholder,
				updatedHTML,
				mapholderWidth,
				mapholderHeight,
				printTaskMap = null,
				printTaskScaleBar = null,
				printTaskScaleText = null,
				printTaskNorthArrow = null,
				paramsMap,
				paramsScaleBar,
				paramsScaleText,
				paramsNorthArrow,
				templateMap,
				templateScaleBar,
				templateScaleText,
				templateNorthArrow,
				scalebar,
				scaletext,
				northarrow,
				widthHeight,
				elements = getHTMLLayoutElements(),
				obj = jQuery.parseJSON(elements),
				deferred =$viz.Deferred();
				

			$viz.get(templateName, function(data) {
					orig = $viz('<div />').html(data);
					mapholder = orig.find('[id^=gcviz-print]');
					scalebar = orig.find('[id^=gcviz-scalebar]');
					scaletext = orig.find('[id^=gcviz-scaletext]');
					northarrow = orig.find('[id^=gcviz-arrow]');
					
					widthHeight = $viz(mapholder).html().split(',');

					if (widthHeight.length === 2) {
						mapholderWidth = widthHeight[0];
						mapholderHeight = widthHeight[1];
					}

					printTaskMap = new esriPrintTask(url, { async: true }),
					paramsMap = paramsMap = new esriPrintParams(),
					templateMap = new esriPrintTemp();

					templateMap.format = 'PNG8';
					templateMap.layout = 'MAP_ONLY';
					templateMap.layoutOptions = {
						'scalebarUnit': 'Kilometers'
					};
					
					if (mapholderWidth > 0)  {
						templateMap.exportOptions.width = mapholderWidth;
					}
					if (mapholderHeight > 0) {
						templateMap.exportOptions.height = mapholderHeight;
					}
					templateMap.exportOptions.dpi = dpivalue;

					if (preserve === 'extent') {
						templateMap.preserveScale = false;
					} else { 
						templateMap.preserveScale = true; 
						if (preserve === 'force') {
							templateMap.outScale = forcedScale;
						} else {
							templateMap.outScale = map.getScale();
						}
					}
			
					paramsMap.template = templateMap;
					paramsMap.map = map;
					
					if (obj['gcviz-scalebar'] === 'true') {
						printTaskScaleBar = new esriPrintTask(url, { async: true });
						paramsScaleBar = new esriPrintParams();
						templateScaleBar = $viz.extend(true, {}, templateMap);
						paramsScaleBar.map = map;
						templateScaleBar.layout = 'Scalebar';
						paramsScaleBar.template = templateScaleBar;
					}

					if (obj['gcviz-scaletext'] === 'true') {
						printTaskScaleText = new esriPrintTask(url, { async: true });
						paramsScaleText = new esriPrintParams();
						templateScaleText = $viz.extend(true, {}, templateMap);
						paramsScaleText.map = map;
						templateScaleText.layout = 'Scaletext';
						paramsScaleText.template = templateScaleText;
					}

					if (obj['gcviz-arrow'] === 'true') {
						printTaskNorthArrow = new esriPrintTask(url, { async: true });
						paramsNorthArrow = new esriPrintParams();
						templateNorthArrow = $viz.extend(true, {}, templateMap);
						paramsNorthArrow.map = map;
						templateNorthArrow.layout = 'Northarrow';
						paramsNorthArrow.template = templateNorthArrow;
					}

				    $viz.when(callPrintTask(printTaskMap, paramsMap), 
				    						callPrintTask(printTaskScaleBar, paramsScaleBar), 
				    						callPrintTask(printTaskScaleText, paramsScaleText),
				    						callPrintTask(printTaskNorthArrow, paramsNorthArrow))
				    .done(function(responseMap, responseScaleBar, responseScaleText, responseNorthArrow) {
			            generateHTMLPrint(obj, orig, mapholder, responseMap, scalebar, responseScaleBar, scaletext, responseScaleText, northarrow, responseNorthArrow, updatedHTML);
			         })
				    .fail(function() {
				    	console.log('Failed to get all responses to generate map');
				    });  
			});
		}; 

		generateHTMLPrint = function(obj, orig, mapholder, mapUrl, scalebar, scalebarUrl, scaletext, scaletextUrl, northarrow, northarrowUrl, updatedHTML) {
			var win,
				id;
			
			addImagetoHtmlPrint(mapholder, mapUrl);
			addImagetoHtmlPrint(scalebar, scalebarUrl);
			addImagetoHtmlPrint(scaletext, scaletextUrl);
			addImagetoHtmlPrint(northarrow, northarrowUrl);
			
			$viz.each(obj, function(key, value) {
				
				orig.find('[id^=' + key + ']').each(function() {
					id = this.id;
					if (id.indexOf('gcviz-label') >= 0) {
						$viz(this).text(value);
					}
					if (id.indexOf('gcviz-lblimg') >= 0) {
						id = id.replace('gcviz-lblimgx','gcviz-imgx');
						orig.find('[id^=' + id + ']').each(function() {
							$viz(this).attr( "src", value);
						});
					}
				});
			});

			updatedHTML = orig.html();
			win = window.open('');
			win.document.write(updatedHTML);
		};

		addImagetoHtmlPrint = function(element, url) {
			if (url !== null) {
				$viz(element).html('<img src="' + url + '"></img>');
			} else {
				$viz(element).empty();
			}
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

		saveImageMap = function(map) {
			var printTask = esriPrintTask('http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'),
				params = new esriPrintParams(),
				template = new esriPrintTemp();

			template.exportOptions = {
				width: map.width,
				height: map.height,
				dpi: 300
			};
			template.format = 'JPG';
			template.layout = 'MAP_ONLY';
			template.preserveScale = false;

			params.map = map;
			params.template = template;

			printTask.execute(params, saveImageResult);
		};

		saveImageResult = function(response) {
			var link = document.createElement('a');
			link.href = response.url;
			link.click();
		};

		printResult = function(response) {

		};

		printError = function(err) {
			console.log('Printing broken: ', err);
		};

		return {
			printMap : printMap,
			generateHTMLPrint : generateHTMLPrint,
			getTemplates: getTemplates,
			getMxdElements: getMxdElements,
			printCustomMap: printCustomMap,
			printBasicMap: printBasicMap,
			saveImageMap: saveImageMap
		};
	});
}());