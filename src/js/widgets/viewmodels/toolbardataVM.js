/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Toolbar data view model widget
 */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-func',
			'gcviz-i18n',
			'gcviz-gisdata',
			'gcviz-gislegend',
			'gcviz-vm-datagrid'
	], function($viz, ko, gcvizFunc, i18n, gisData, gisLegend, vmDatagrid) {
		var initialize,
			notifyAdd,
			innerNotifyAdd,
			vm;

		initialize = function($mapElem, mapid) {

			// data model				
			var toolbardataViewModel = function($mapElem, mapid) {
				var _self = this,
					$btnCSV = $viz('#btnAddCSV' + mapid),
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// tooltip and label
				_self.tpAdd = i18n.getDict('%toolbardata-tpadd');
				_self.tpDelete = i18n.getDict('%toolbardata-tpdelete');
				_self.tpVisible = i18n.getDict('%toolbarlegend-tgvis');
				_self.lblCSV = i18n.getDict('%toolbardata-lbladdcsv');

				// dialog window for text
				_self.lblErrTitle = i18n.getDict('%toolbardata-errtitle');
				_self.errMsg1 = i18n.getDict('%toolbardata-err1');
				_self.errMsg2 = i18n.getDict('%toolbardata-err2');
				_self.errMsg3 = i18n.getDict('%toolbardata-err3');
				_self.errMsg4 = i18n.getDict('%toolbardata-err4');
				_self.msgIE9 = i18n.getDict('%toolbardata-ie9');
				_self.errMsg = ko.observable();
				_self.isErrDataOpen = ko.observable();

				// array of user layer
				_self.userArray = ko.observableArray([]);

				// observable to notify when data is in the add process
				_self.isAddData = ko.observable(false);

				_self.init = function() {
					// to expose the observable to know when the layer has been added
					innerNotifyAdd = _self.notifyAdd;

					return { controlsDescendantBindings: true };
				};

				_self.launchDialog = function() {
					// launch the dialog. We cant put the dialog in the button because
					// Firefox will not launch the window. To be able to open the window,
					// we mimic the click
					$viz(document.getElementById('fileDialogData'))[0].click();
				};

				_self.dialogDataClose = function() {
					_self.isErrDataOpen(false);

					// focus back on add to keep focus
					$btnCSV.focus();
				};

				_self.addClick = function(vm, event) {
					// we need to have different load file function because IE version 9 doesnt use
					// fileReader object
					if (window.browser === 'Explorer' && window.browserversion === 9) {
						_self.errMsg(_self.msgIE9);
						_self.isErrDataOpen(true);
					} else {
						_self.isAddData(true);
						// put the add in a timeout to let time to footer vm to remove the showCoord event
						// The problem comes from the reprojection that interfere with the new data to be
						// added projection. We put back the event after.
						setTimeout(function() {
							_self.add(vm, event);
						}, 1000);
					}

					// focus back on add to keep focus
					$btnCSV.focus();
				};

				_self.add = function(vm, event) {
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
							var uuid = gcvizFunc.getUUID(),
								fileName = reader.fileName;

							// use deffered object to wait for the result
							gisData.addCSV(mymap, reader.result, uuid, fileName)
								.done(function(data) {
									if (data === 0) {
										// add to user array so knockout will generate legend
										_self.userArray.push({ label: fileName, id: uuid });
									} else {
										_self.isErrDataOpen(true);
										_self.isAddData(false);
										if (data === 1) {
											_self.errMsg(_self.errMsg1);
										} else if (data === 2) {
											_self.errMsg(_self.errMsg2);
										} else if (data === 3) {
											_self.errMsg(_self.errMsg3);
										} else {
											_self.errMsg(_self.errMsg4 + data);
										}
									}
								});

							// add KML
							//gisData.addKML(mymap, 'http://geoscan.nrcan.gc.ca/star/download/xml1507213410628212.kml', gcvizFunc.getUUID(), fileName);
							// add GeoRSS
							gisData.addGeoRSS(mymap, 'http://geoscan.ess.nrcan.gc.ca/rss/newpub_e.rss', gcvizFunc.getUUID(), fileName);
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

					// focus back on add to keep focus
					$btnCSV.focus();

					// remove table if datagrid is enable
					if (typeof vmDatagrid !== 'undefined') {
						vmDatagrid.removeTab(selectedItem.id);
					}
				};

				_self.changeItemsVisibility = function(selectedItem, event) {
					// in the view we use event: {click: myfunction } instead of just click
					// to be able to pass the event 
					gisLegend.setLayerVisibility(mymap, selectedItem.id, event.target.checked);

					// Knockout doesn't prevent the default click action.
					return true;
				};

				_self.notifyAdd = function() {
					_self.isAddData(false);
				};

				_self.init();
			};

			vm = new toolbardataViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		notifyAdd = function() {
			innerNotifyAdd();
		};

		return {
			initialize: initialize,
			notifyAdd: notifyAdd
		};
	});
}).call(this);
