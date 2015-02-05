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
			vm;


		initialize = function($mapElem, mapid, printOption, mapframe) {

			// data model				
			var printViewModel = function($mapElem, mapid, printOption) {

				var _self = this,
					$btnPrint = $mapElem.find('.gcviz-head-print'),
					$dialog = $mapElem.find('#print-' + mapid),
					templates = [],
					DPIValues = [];
						
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
				
				_self.mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				var TemplateItem = function(name) {
   					this.Name = name;
   				};

   				var DPIValueItem = function(name) {
   					this.Name = name;
   				};

				printOption.template.forEach(function (value) {
					templates.push(new TemplateItem(value));
				});

				printOption.DPI.forEach(function (value) {
					DPIValues.push(new DPIValueItem(value));
				});

				_self.isPrintDialogOpen = ko.observable(false);
				_self.availableTemplates =ko.observableArray(templates);
				_self.DPIs =ko.observableArray(DPIValues);
				_self.printUrl =  mapframe.map.urlprint;
				_self.printUrlElements =  mapframe.map.urlprintElements;
				_self.selectedValue = ko.observable();
				_self.selectedDPIValue = ko.observable();
				_self.preserve= ko.observable('extent');

				_self.selectedValue.subscribe(function (templateName) {
					gisprint.getMxdElements(_self.printUrlElements, templateName);
    			});

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
					gisprint.printCustomMap(_self.mymap, _self.printUrl , _self.selectedValue().toString(), _self.preserve().toString(), _self.selectedDPIValue());
				};

				_self.dialogPrintClose = function() {
					_self.isPrintDialogOpen(false);
					setTimeout(function() {
						$btnPrint.focus();
					}, 500);
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
		
		return {
			initialize: initialize,
			togglePrint: togglePrint
			
		};
	});
}).call(this);
