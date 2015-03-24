/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Help view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gisprint'
	], function($viz, ko, i18n, gcvizFunc, gisprint) {
		var initialize,
			togglePrint,
			gblDialogOpen,
			gblDialog,
			getHTMLElements,
			sortElements,
			populateTemplates,
			clearElements,
			vm,
			lang = $viz('html').attr('lang').toUpperCase();

		initialize = function($mapElem, mapid, printOption, mapframe) {
			// data model				
			var printViewModel = function($mapElem, mapid, printOption) {

				var _self = this,
					$btnPrint = $mapElem.find('.gcviz-head-print'),
					$dialog = $mapElem.find('#print-' + mapid),
					printlayout = [],
					DPIValues = [],
				    TemplateItem = function(name) {
                        this.Name = name;
                    },
                    DPIValueItem = function(name) {
                        this.Name = name;
                    },
                    PrintLayoutItem = function(name) {
                        this.Name = name;
                    },
                    printType = printOption.type,
                    template,
                    printTypeString;

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// print dialog box
				_self.lblPrintTitle = i18n.getDict('%print-dialogtitle');
				_self.lblPrintTemplate = i18n.getDict('%print-dialogtemplate');
				_self.lblPrintParameters = i18n.getDict('%print-dialogParameters');
				_self.lblMapScaleExtent = i18n.getDict('%print-dialogScaleExtent');
				_self.lblMapScale = i18n.getDict('%print-dialogMapScale');
				_self.lblMapExtent = i18n.getDict('%print-dialogMapExtent');
				_self.lblPreserve = i18n.getDict('%print-dialogPreserve');
				_self.lblPrintDPI = i18n.getDict('%print-dialogDPI');
				_self.lblForceScale = i18n.getDict('%print-dialogForceScale');
				_self.lblLayout = i18n.getDict('%print-dialogLayout');
				_self.noTemplateMessage =  i18n.getDict('%print-dialogNoTemplates'); 
				_self.mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				printOption.printlayout.forEach(function(value) {
					printlayout.push(new PrintLayoutItem(value));
				});

				printOption.DPI.forEach(function(value) {
					DPIValues.push(new DPIValueItem(value));
				});

				_self.isPrintDialogOpen = ko.observable(false);
				_self.DPIs = ko.observableArray(DPIValues);
				_self.printUrl = mapframe.map.urlprint;
				_self.printUrlElements = mapframe.map.urlprintElements;
				_self.selectedValue = ko.observable();
				_self.layoutValue = ko.observable();
				_self.selectedDPIValue = ko.observable();
				_self.preserve = ko.observable('extent');
				_self.forceScaleValue = ko.observable().extend({ numeric: { precision: 0, validation: { min: 0 } } });
				_self.urlhtmltemplates = mapframe.map.urlhtmltemplates;
				_self.layoutValue.subscribe(function(layout) {
					if (printType === 1) {
						printTypeString = 'html';
					} else {
						printTypeString = 'mxd';
					}
					gisprint.getTemplates(_self.urlhtmltemplates, layout, printTypeString).done(function(templates) {
						_self.availableTemplates.removeAll();
						template = templates.split(',');
						template.forEach(function(value) {
							if (value === 'NO_TEMPLATES_FOUND') {
								_self.availableTemplates.push(new TemplateItem(_self.noTemplateMessage));
         					}
         					else {
         						_self.availableTemplates.push(new TemplateItem(value));
         					}
         				});
					});  
				});

			 	_self.selectedValue.subscribe(function(templateName) {
			 		clearElements();
			 		if (templateName !== _self.noTemplateMessage && templateName !== undefined) {
				 		if (printType === 1) {
				 			getHTMLElements(templateName, _self.layoutValue().toString());
				 		}
				 		else {
				 			gisprint.getMxdElements(_self.printUrlElements, templateName);
				 		}
			 		}
				});

			    _self.availableTemplates = ko.observableArray([]);
			 	_self.printlayouts = ko.observableArray(printlayout);
	
                _self.init = function() {
					// set global dialog to be able to open help from
					// outisede the view model. This way, it is easy
					// for header VM to open help dialog
					gblDialogOpen = _self.isPrintDialogOpen;
					
					// keep both dialog box in global so we can extract and add item
					gblDialog = $dialog;

					return { controlsDescendantBindings: true };
				};

				_self.dialogHelpOk = function() {
					var templatepath;

					if (printType === 1) {
						templatepath = locationPath + 'gcviz/print/' + lang + '/' + _self.selectedValue().toString();
						gisprint.printBasicMap(_self.mymap, _self.printUrl, templatepath, _self.preserve().toString(), _self.forceScaleValue().toString().trim());
					}
					else {
						gisprint.printCustomMap(_self.mymap, _self.printUrl, _self.selectedValue().toString(), _self.preserve().toString(), _self.selectedDPIValue(), _self.forceScaleValue().toString().trim());
					}
				};

				_self.dialogPrintClose = function() {
					_self.isPrintDialogOpen(false);
					setTimeout(function() {
						$btnPrint.focus();
					}, 500);
				};

				_self.selectRadioForce = function() {
					_self.preserve('force');
				};

				_self.init();
			};

			vm = new printViewModel($mapElem, mapid, printOption);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		togglePrint = function() {
			gblDialogOpen(true); 
		};

		clearElements = function() {
			var printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements'),
			    printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements');

			$viz(printTextElements).empty();
			$viz(printPictureElements).empty();
			$viz(printMapSurroundElements).empty();
		};

		getHTMLElements = function(templateName , layout) {
			var url = locationPath + "gcviz/print/" + lang + "/" + templateName,
				printTextElements = document.getElementById('gcviz-printTextElements'),
			    printPictureElements = document.getElementById('gcviz-printPictureElements');

			$viz(printTextElements).empty();
			$viz(printPictureElements).empty();
						
			$viz.get(url, function(data) {
				var $html = $(data),
					id, 
					label,
					newElement,
					orderedElements = [],
					labelItem = function(position, id, newElement) {
                        this.Position = position;
                        this.Id = id;
                        this.NewElement = newElement;
                    };
 				
				$html.find('[id^=gcviz-label]').andSelf().filter('[id^=gcviz-label]').each(function() {
					id = this.id;
					label = $(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label+ '</span></div><div class="gcviz-printCol"><input type="text" id="' + id + '" name="' + label + '"></input></div>');
					orderedElements.push(new labelItem(id.split('gcviz-label')[1], id, newElement));
				});

				sortElements(orderedElements).forEach(function (value, index) {
					$viz(printTextElements).append(value.NewElement);
				});

				orderedElements = [];

				$html.find('[id^=gcviz-lblimgx]').andSelf().filter('[id^=gcviz-lblimgx]').each(function() {
					id = this.id;
					label = $(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label + '</span></div><div class="gcviz-printCol"><input type="text" id="gcviz-print' + id + '" name="' + label + '"></input><div>');
					orderedElements.push(new labelItem(id.split('gcviz-lblimgx')[1], id, newElement));
				});

				sortElements(orderedElements).forEach(function (value, index) {
					$viz(printPictureElements).append(value.NewElement);
				});
				
			});
			
		};
		
		sortElements = function(elements) {
				return elements.sort(function(a, b) {
 					return a.Position - b.Position;
				});
		};
		
		return {
			initialize: initialize,
			togglePrint: togglePrint,
			getHTMLElements: getHTMLElements,
			sortElements: sortElements
		};
	});
}).call(this);
