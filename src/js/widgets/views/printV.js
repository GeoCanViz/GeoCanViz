/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Help widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-print'
	], function(printVM) {
		var initialize;
			
		initialize = function($mapElem) {
			var $print,
				mapid = $mapElem.mapframe.id,
				printOption = $mapElem.header.print,
				mapframe = $mapElem.mapframe,
				node = '';		

			// find the help dialog box
			$mapElem.find('#' + mapid).append('<div class="gcviz-print-cont"></div>');

			$print = $mapElem.find('.gcviz-print-cont');

			node += '<div class="gcviz-printDiv" id="print-' + mapid + '"  data-bind="uiDialog: { title: lblPrintTitle, width: 600, height: 350, ok: dialogHelpOk, close: dialogPrintClose, openDialog: \'isPrintDialogOpen\', modal: false, draggable: true }">' +
						'<div><span class="gcviz-subtitle" data-bind="text: lblLayout"></span>' +
							'<select id="printlayoutSelect" data-bind="value: layoutValue, optionsText: \'Name\', optionsValue:\'Name\', options: printlayouts "></select></div>' +
						'<div><span class="gcviz-subtitle" data-bind="text: lblPrintTemplate"></span>' +
							'<select id="printSelect" data-bind="value: selectedValue, optionsText: \'Name\', optionsValue:\'Name\', options: availableTemplates "></select></div>' +
						'<div id="gcviz-PrintMapScaleDiv"><span class="gcviz-subtitle" data-bind="text: lblMapScaleExtent"></span>' +
							'<div><span data-bind="text: lblPreserve"></span>' +
								  '<input type="radio" name="scaleExtentGroup" value="extent" data-bind="checked: preserve"></input>' +
								  '<span data-bind="text: lblMapExtent"></span>' +
                                  '<input type="radio" name="scaleExtentGroup" value="scale" data-bind="checked: preserve"></input>' +
                                  '<span data-bind="text: lblMapScale"></span>' +
                            '</div>' +
                            '<div><span data-bind="text: lblForceScale"></span>' +
                            	  '<input type="radio" name="scaleExtentGroup" value="force" data-bind="checked: preserve"></input>' +
                            	  '<input type="text" name="forceScale" data-bind="event: { change: selectRadioForce }, value: forceScaleValue, textInput: attemptedValue"></input>' +
                            '</div>'+     
                        '</div>' + 
                        '<div id="DPIdiv"><span class="gcviz-subtitle" data-bind="text: lblPrintDPI"></span>' +
                        '<select id="printDPI" data-bind="value: selectedDPIValue, optionsText: \'Name\', optionsValue:\'Name\', options: DPIs"></select></div>';

			node += '<div id="printParameters">' +
						'<span class="gcviz-subtitle" data-bind="text: lblPrintParameters"></span>' +
						 '<div id="printParametersDetails">' +	
                            '<div id ="gcviz-printTextElements" class="gcviz-PrintElementGroup" ></div>' +
                            '<div id ="gcviz-printPictureElements" class="gcviz-PrintElementGroup" ></div>' +
                            '<div id ="gcviz-printMapSurroundElements" class="gcviz-PrintElementGroup" ></div>' +
						 '</div>' +
					'</div>';
		
			// close div
			node += '</div>';

			$print.append(node);

			return(printVM.initialize($print, mapid, printOption, mapframe));
		};

		

		return {
			initialize: initialize
		};
	});
}).call(this);
