/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Print view model widget
 */
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
			clearElements,
			vm,
			lang = $viz('html').attr('lang').toUpperCase();

		initialize = function($mapElem, mapid, printOption, mapframe) {
			// data model				
			var printViewModel = function($mapElem, mapid, printOption) {
				var _self = this,
					mapVM,
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

				// there is a problem with the define. The gcviz-vm-map is not able to be set.
				// We set the reference to gcviz-vm-map (hard way)
				require(['gcviz-vm-map'], function(vmMap) {
					mapVM = vmMap;
				});

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

				printOption.printlayout.forEach(function(value) {
					printlayout.push(new PrintLayoutItem(value));
				});

				printOption.DPI.forEach(function(value) {
					DPIValues.push(new DPIValueItem(value));
				});

				_self.isPrintDialogOpen = ko.observable(false);
				_self.DPIs = ko.observableArray(DPIValues);
				_self.printUrl = mapframe.map.urlprint;
				_self.printUrlElements = mapframe.map.urlprintelements;
				_self.selectedValue = ko.observable();
				_self.layoutValue = ko.observable();
				_self.selectedDPIValue = ko.observable();
				_self.preserve = ko.observable('extent');
				_self.forceScaleValue = ko.observable().extend({ numeric: { precision: 0, validation: { min: 0 } } });
				_self.urltemplates = mapframe.map.urltemplates;
				_self.urlhtml = mapframe.map.urlhtml;
				_self.project = printOption.project;
				_self.layoutValue.subscribe(function(layout) {
					if (printType === 1) {
						printTypeString = 'html';
					} else {
						printTypeString = 'mxd';
					}
					gisprint.getTemplates(_self.urltemplates, layout, printTypeString, _self.project).done(function(templates) {
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
							getHTMLElements(_self.urlhtml, templateName, _self.layoutValue().toString());
						} else {
							gisprint.getMxdElements(_self.printUrlElements, templateName);
						}
					}
				});

				_self.availableTemplates = ko.observableArray([]);
				_self.printlayouts = ko.observableArray(printlayout);

                _self.init = function() {
					// set global dialog to be able to open print from
					// outisede the view model. This way, it is easy
					// for header VM to open help dialog
					gblDialogOpen = _self.isPrintDialogOpen;

					// keep both dialog box in global so we can extract and add item
					gblDialog = $dialog;

					return { controlsDescendantBindings: true };
				};

				_self.dialogPrintOk = function() {
					var templatepath;

					if (printType === 1) {
						templatepath = _self.urlhtml + '/' + lang + '/' + _self.selectedValue().toString();
						mapVM.printBasic(mapid, _self.printUrl, templatepath, _self.preserve().toString(), _self.forceScaleValue().toString().trim(), _self.selectedDPIValue());
					}
					else {
						mapVM.printCustom(mapid, _self.printUrl, _self.selectedValue().toString(), _self.preserve().toString(), _self.selectedDPIValue(), _self.forceScaleValue().toString().trim());
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

		getHTMLElements = function(htmlUrl, templateName) {
			var url =  htmlUrl + '/' + lang + '/' + templateName,
				printTextElements = document.getElementById('gcviz-printTextElements'),
				printMapSurroundElements = document.getElementById('gcviz-printMapSurroundElements'),
				printPictureElements = document.getElementById('gcviz-printPictureElements');

			$viz(printTextElements).empty();
			$viz(printPictureElements).empty();
			$viz(printMapSurroundElements).empty();

			$viz.get(url, function(data) {
				var $html = $viz(data),
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
					label = $viz(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label+ '</span></div><div class="gcviz-printCol"><input type="text" id="' + id + '" name="' + label + '"></input></div>');
					orderedElements.push(new labelItem(id.split('gcviz-label')[1], id, newElement));
				});

				sortElements(orderedElements).forEach(function (value) {
					$viz(printTextElements).append(value.NewElement);
				});

				orderedElements = [];

				$html.find('[id^=gcviz-lblimgx]').andSelf().filter('[id^=gcviz-lblimgx]').each(function() {
					id = this.id;
					label = $viz(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label + '</span></div><div class="gcviz-printCol"><input type="text" id="' + id + '" name="' + label + '"></input><div>');
					orderedElements.push(new labelItem(id.split('gcviz-lblimgx')[1], id, newElement));
				});

				sortElements(orderedElements).forEach(function (value) {
					$viz(printPictureElements).append(value.NewElement);
				});

				orderedElements = [];

				$html.find('[id^=gcviz-scalebar]').andSelf().filter('[id^=gcviz-scalebar]').each(function() {
					id = this.id;
					label = $viz(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label + '</span></div><div class="gcviz-printCol"><input type="checkbox" id="' + id + '" name="' + label + '"></input></div>');
					orderedElements.push(new labelItem(id.split('gcviz-scalebar')[1], id, newElement));
				});

				$html.find('[id^=gcviz-scaletext]').andSelf().filter('[id^=gcviz-scaletext]').each(function() {
					id = this.id;
					label = $viz(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label + '</span></div><div class="gcviz-printCol"><input type="checkbox" id="' + id + '" name="' + label + '"></input></div>');
					orderedElements.push(new labelItem(id.split('gcviz-scaletext')[1], id, newElement));
				});

				$html.find('[id^=gcviz-arrow]').andSelf().filter('[id^=gcviz-arrow]').each(function() {
					id = this.id;
					label = $viz(this).text();
					newElement = ('<div class="gcviz-printRow"><div class="gcviz-printColLabel"><span class="gcviz-printLabel">' + label + '</span></div><div class="gcviz-printCol"><input type="checkbox" id="' + id + '" name="' + label + '"></input></div>');
					orderedElements.push(new labelItem(id.split('gcviz-arrow')[1], id, newElement));
				});

				sortElements(orderedElements).forEach(function (value) {
					$viz(printMapSurroundElements).append(value.NewElement);
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
