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
			'gcviz-func',
			'gcviz-i18n',
			'gcviz-gisdata',
			'gcviz-gislegend'
	], function($viz, ko, gcvizFunc, i18n, gisData, gisLegend) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var toolbardataViewModel = function($mapElem, mapid) {
				var _self = this,
					mymap = vmArray[mapid].map.map,
					pathAdd = locationPath + 'gcviz/images/dataAdd.png',
					pathDel = locationPath + 'gcviz/images/dataDelete.png';

				// images path
				_self.imgAdd = ko.observable(pathAdd);
				_self.imgDel = ko.observable(pathDel);

				// tooltip
				_self.tpAdd = i18n.getDict('%toolbardata-tpadd');
				_self.tpDelete = i18n.getDict('%toolbardata-tpdelete');
				_self.tpVisible = i18n.getDict('%toolbarlegend-tgvis');

				// array of user layer
				_self.userArray = ko.observableArray([]);

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

						// keep track of file name
						reader.fileName = file.name;

						// closure to capture the file information and launch the process
						reader.onload = function() {
							var uuid = gcvizFunc.getUUID();
							_self.userArray.push({ label: reader.fileName, id: uuid });
							gisData.addCSV(mymap, reader.result, uuid);
						};
						reader.readAsText(file);
					}

					// clear the selected file
					document.getElementById('fileDialogData').value = '';
				};

				_self.removeClick = function(selectedItem) {
					// remove the layer from the map then from the array
					// In the view we use click: function($data) { $root.removeClick($data) } to avoid
					// to ave the function call when we add the item to the array.
					mymap.removeLayer(mymap.getLayer(selectedItem.id));
					_self.userArray.remove(selectedItem);
				};

				_self.changeItemsVisibility = function(selectedItem) {
					gisLegend.setLayerVisibility(mymap, selectedItem.id, event.target.checked);
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
