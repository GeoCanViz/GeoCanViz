/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar data view model widget
 */
/* global vmArray: false, locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-gisdata'
	], function($viz, ko, i18n, gisData) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbardataViewModel = function($mapElem, mapid) {
				var _self = this,
					mymap = vmArray[mapid].map.map,
					pathAdd = locationPath + 'gcviz/images/dataAdd.png';

				// images path
				_self.imgAdd = ko.observable(pathAdd);

				// tooltip
				_self.tpAdd = i18n.getDict('%toolbardata-tpadd');

				_self.init = function() {
					return { controlsDescendantBindings: true };
				};

				_self.launchDialog = function() {
					// launch the dialog. We cant put the dialog in the button because
					// Firefox will not launch the window. To be able to open the window,
					// we mimic the click
					$viz(document.getElementById('fileDialogData'))[0].click();
				};

				_self.addClick = function(vm, event) {
					var file, reader,
						files = event.target.files,
						len = files.length;

					// loop through the FileList.
					while (len--) {
						file = files[len];
						reader = new FileReader();
						// closure to capture the file information and launch the process
						reader.onload = function() {
							gisData.addCSV(mymap, reader.result);
						};
						reader.readAsText(file);
					}

					// clear the selected file
					document.getElementById('fileDialogData').value = '';
				};

				_self.init();
			};

			vm = new toolbardataViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
