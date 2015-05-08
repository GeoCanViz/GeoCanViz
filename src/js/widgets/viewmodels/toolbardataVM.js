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
			'gcviz-vm-datagrid',
			'gcviz-vm-tblegend'
	], function($viz, ko, gcvizFunc, i18n, vmDatagrid, legendVM) {
		var initialize,
			subscribeIsAddData,
			notifyAdd,
			getURL,
			vm = [];

		initialize = function($mapElem, mapid, config, isDatagrid) {

			// data model				
			var toolbardataViewModel = function($mapElem, mapid, config, isDatagrid) {
				var _self = this,
					mapVM,
					$btnCSV = $viz('#btnAddCSV' + mapid),
					configQuery = config.dataquery.enable;

				// there is a problem with the define. The gcviz-vm-map is not able to be set.
				// We set the reference to gcviz-vm-map (hard way)
				require(['gcviz-vm-map'], function(vmMap) {
					mapVM = vmMap;
				});

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// tooltip and label
				_self.tpAdd = i18n.getDict('%toolbardata-tpadd');
				_self.tpDelete = i18n.getDict('%toolbardata-tpdelete');
				_self.lblCSV = i18n.getDict('%toolbardata-lbladdcsv');
				_self.lblUrl = i18n.getDict('%toolbardata-lbladdurl');

				// dialog window for text
				_self.lblErrTitle = i18n.getDict('%toolbardata-errtitle');
				_self.errMsg1 = i18n.getDict('%toolbardata-err1');
				_self.errMsg2 = i18n.getDict('%toolbardata-err2');
				_self.errMsg3 = i18n.getDict('%toolbardata-err3');
				_self.errMsg4 = i18n.getDict('%toolbardata-err4');
				_self.errURL = i18n.getDict('%toolbardata-errurl');
				_self.errLoad = i18n.getDict('%toolbardata-errload');
				_self.errFormat = i18n.getDict('%toolbardata-errformat');
				_self.msgIE9 = i18n.getDict('%toolbardata-ie9');
				_self.errMsg = ko.observable();
				_self.isErrDataOpen = ko.observable();

				// dialog window for url
				_self.lblUrlTitle = i18n.getDict('%toolbardata-lbladdurltitle');
				_self.lblAddUrl = i18n.getDict('%toolbardata-lbladdurldesc');
				_self.isUrlDialogOpen = ko.observable();
				_self.addUrlValue = ko.observable('');

				// dialog window for process
				_self.lblAddTitle = i18n.getDict('%toolbardata-lbladdtitle');
				_self.lblAddDesc = i18n.getDict('%toolbardata-lbladddesc');
				_self.isDataProcess = ko.observable(false);

				// dialog window for datafile url parameter
				_self.lblAddParamDesc = i18n.getDict('%toolbardata-lbladdparamdesc');
				_self.lblImportParam = i18n.getDict('%toolbardata-lbladdparam');
				_self.lblMiss = i18n.getDict('%toolbardata-lblmiss');
				_self.lblImportParamFile = ko.observable('');
				_self.isFileProcess = ko.observable(false);
				_self.files = [];
				_self.file = '';

				// array of user layer
				_self.userArray = ko.observableArray([]);

				// observable to notify when data is in the add process
				_self.isAddData = ko.observable(false);

				_self.init = function() {
					var idmap, url, file;

					// for wich map
					idmap = gcvizFunc.getURLParameter(window.location.toString(), 'id');

					// check if there is a url to load
					// dataurl param can be like this:
					// dataurl=http://maps.ottawa.ca/arcgis/rest/services/Schools/MapServer/1,1,1,0.5,0;http://geoappext.nrcan.gc.ca/GeoCanViz/CCMEO/toporama/combine.kml,0,0,1,0
					// first the url, the expand state, the visibiity state, the opacity value, zoom to extent value
					url = gcvizFunc.getURLParameter(window.location.toString(), 'dataurl');

					// datafile param can be like this:
					// datafile=ParksVan.csv;ExportCSV.csv,1,1,1,1
					// first the file name, the expand state, the visibiity state, the opacity value, zoom to extent value
					file = gcvizFunc.getURLParameter(window.location.toString(), 'datafile');

					if (url !== null && idmap === mapid) {
						if (isDatagrid) {
							// subscribe to the isTableReady event to know when tables have been initialize
							gcvizFunc.subscribeTo(mapid, 'datagrid', 'isTableReady', function(input) {
								_self.addUrlUrl(url, input);
							});
						} else {
							// set in a timeout. if not dialog box not launch
							setTimeout(function() {
								_self.addUrlUrl(url, true);
							}, 0);
						}
					}

					if (file !== null && idmap === mapid) {
						if (isDatagrid) {
							// subscribe to the isTableReady event to know when tables have been initialize
							gcvizFunc.subscribeTo(mapid, 'datagrid', 'isTableReady', function(input) {
								_self.addFileUrl(file, input);
							});
						} else {
							// set in a timeout. if not dialog box not launch
							setTimeout(function() {
								_self.addFileUrl(file, true);
							}, 0);
						}
					}

					return { controlsDescendantBindings: true };
				};

				_self.addUrlUrl = function(url, input) {
					var layer = url.split(';'),
						len = layer.length;

					if (input) {
						while (len--) {
							_self.addUrlValue(layer[len]);
							_self.dialogUrlOk();
						}
					}
				};
				
				_self.addFileUrl = function(file, input) {
					_self.files = file.split(';');
	
					// we cant open directly the file dialog for security reason. It need to be from a user event.
					// Show a window where user will be able to click to add the file.
					if (input && _self.files.length > 0) {
						_self.addParamUrlFile();
					}
				};

				_self.launchDialog = function() {
					// launch the dialog. We cant put the dialog in the button because
					// Firefox will not launch the window. To be able to open the window,
					// we mimic the click
					document.getElementById('fileDialogData' + mapid).click();
				};

				_self.openWait = function(event) {
					// remove close icon to have a real modal window.
					$viz(event.target.parentElement).find('.ui-dialog-titlebar-close').addClass('gcviz-dg-wait');
				};

				_self.dialogDataClose = function() {
					_self.isErrDataOpen(false);

					// focus back on add to keep focus
					$btnCSV.focus();
				};

				_self.addParamUrlFile = function() {
					// shift the first item
					var item = _self.files.shift();

					if (typeof item !== 'undefined') {
						_self.file = item;
						_self.lblImportParamFile(_self.lblImportParam + _self.file);
						_self.isFileProcess(true);
					}
				};

				_self.closeParamUrlFile = function() {
					_self.isFileProcess(false);
					_self.file = '';

					// relaunch the add witht he global file object from param url. If there is still file
					// in it, the dialog can be launch again to add those file. If not file left or no file
					// initially, there is nothing
					// put a time out so the close will not interfere witht he open
					setTimeout(function() {
						_self.addParamUrlFile();
					}, 1000);
				};

				_self.okParamUrlFile = function() {
					// add entry in the legend for the missins layer
					legendVM.addLegend(_self.getMissLegendCfg(_self.file + _self.lblMiss));

					_self.closeParamUrlFile();
				};

				_self.addFileClick = function(vm, event) {
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

							// relaunch the add witht he global file object from param url. If there is still file
							// in it, the dialog can be launch again to add those file. If not file left or no file
							// initially, there is nothing
							_self.closeParamUrlFile();
						}, 1000);
					}

					// focus back on add to keep focus
					$btnCSV.focus();
				};

				_self.addURLClick = function() {
					_self.isUrlDialogOpen(true);
				};

				_self.dialogUrlOkEnter = function () {
					_self.dialogUrlOk();
				};

				_self.dialogUrlOk = function() {
					var esri = '/rest/services/',
						uu = gcvizFunc.getUUID(),
						info = _self.addUrlValue().split(','),
						config = _self.setConfig(info),
						url = info[0],
						lenUrl = url.length,
						valid = gcvizFunc.validateURL(url),
						name = url.substring(url.lastIndexOf('/') + 1, lenUrl),
						ext = url.substring(url.lastIndexOf('.') + 1, lenUrl);

					// add data to table and to aray of imported data
					if (valid) {
						// show process dialog
						_self.isDataProcess(true);

						if (ext.toUpperCase() === 'KML') {
							// http://geoappext.nrcan.gc.ca/GeoCanViz/CCMEO/toporama/building.kml
							// http://geoappext.nrcan.gc.ca/GeoCanViz/CCMEO/toporama/combine.kml
							mapVM.addLayerKML(mapid, _self.closeAddUrl, url, uu, name, config);
						}
						//else if (ext.toUpperCase() === 'RSS') {
							//gisData.addGeoRSS(mymap, 'http://geoscan.ess.nrcan.gc.ca/rss/newpub_e.rss', uu, name);
						//} 
						else if (url.indexOf(esri) !== -1) {
							// http://geoappext.nrcan.gc.ca/arcgis/rest/services/test/earthqhakes/MapServer/0
							mapVM.addLayerFeature(mapid, _self.closeAddUrl, url, uu, config);
						}
						else {
							_self.errMsg(_self.errFormat);
							_self.isErrDataOpen(true);
						}
					} else {
						_self.errMsg(_self.errURL);
						_self.isErrDataOpen(true);
					}

					// close window and clean url
					_self.dialogUrlClose();
					_self.addUrlValue('');
				};

				_self.dialogUrlClose = function() {
					_self.isUrlDialogOpen(false);
				};

				_self.dialogUrlCancel = function() {
					_self.dialogUrlClose();
				};

				_self.add = function(vm, event) {
					var file, reader, name,
						files = event.target.files,
						len = files.length;

					// loop through the FileList.
					while (len--) {
						file = files[len];
						reader = new FileReader();

						// keep track of file name
						name = file.name;
						reader.fileName = name;

						// make sure the layer was not missing from a datafile url parameter before
						legendVM.removeLegend(file.name + _self.lblMiss);

						// closure to capture the file information and launch the process
						reader.onload = function() {
							var uuid = gcvizFunc.getUUID(),
								fileName = reader.fileName;

							// show process dialog
							_self.isDataProcess(true);

							// use deffered object to wait for the result
							mapVM.addLayerCSV(mapid, _self.closeAddFile, reader.result, uuid, fileName);
						};

						reader.readAsText(file);
					}

					// clear the selected file (we need to clear because if we tru to the same file twice it wont work
					// because the change event will not be triggered)
					document.getElementById('fileDialogData' + mapid).value = '';
				};

				_self.closeAddUrl = function(data, info) {
					if (data === 0) {
						var item,
							len = info.length;

						while (len--) {
							item = info[len];

							// add to user array so knockout will generate legend
							_self.userArray.push(item);
						}
					} else {
						_self.errMsg(_self.errLoad.replace('XXX', data));
						_self.isDataProcess(false);
						_self.isErrDataOpen(true);
					}
				};

				_self.closeAddFile = function(data, info) {
					if (data === 0) {
						// add to user array so knockout will generate legend
						_self.userArray.push({ label: info.label, id: info.id, type: 'file' });
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
				};

				_self.removeClick = function(selectedItem) {
					var id = selectedItem.id;

					// remove the layer from the map then from the array
					// In the view we use click: function($data) { $root.removeClick($data) } to avoid
					// to have the function call when we add the item to the array.
					mapVM.removeLayer(mapid, id);
					_self.userArray.remove(selectedItem);

					// remove fromlegend
					legendVM.removeLegend(id);

					// focus back on add to keep focus
					$btnCSV.focus();

//TODO: mettre la verification si existe dans le VM
					// remove table if datagrid is enable
					if (typeof vmDatagrid !== 'undefined') {
						vmDatagrid.removeTab(selectedItem.id);
					}
				};

				_self.notifyAdd = function() {
					_self.isAddData(false);
					_self.isDataProcess(false);
				};

				_self.getURL = function() {
					var layer, param,
						returnURL = '',
						flagFile = false,
						flagURL = false,
						file = 'datafile=',
						url = 'dataurl=',
						layers = _self.userArray(),
						len = layers.length;

					while (len--) {
						layer = layers[len];

						if (layer.type === 'file') {
							file += layer.label + ';';
							flagFile = true;
						} else {
							if (url.indexOf(layer.url) === -1) {
								param = mapVM.getLayerParam(mapid, layer.id);
								url += layer.url + ',1,' + param.visible + ',' + param.opacity +',0;';
							}
							flagURL = true;
						}
					}

					if (flagFile) {
						returnURL = '&' + file.slice(0,-1);
					}
					if (flagURL) {
						returnURL += '&' + url.slice(0,-1);
					}

					return returnURL;
				};

				_self.setConfig = function(param) {
					var config = { expand: true,
									visibility: true,
									opacity: 1,
									zoom: true },
						expand = param[1],
						vis = param[2],
						opacity = param[3],
						zoom = param[4];

					// check if config parameter are present
					if (typeof expand !== 'undefined' && expand === '0') {
						config.expand = false;
					}
					if (typeof vis !== 'undefined' && vis === '0' ) {
						config.visibility = false;
					}
					if (typeof opacity !== 'undefined') {
						config.opacity = parseFloat(opacity, 10);
					}
					if (typeof zoom !== 'undefined' && zoom === '0') {
						config.zoom = false;
					}

					return config;
				};

				_self.getMissLegendCfg = function(name) {
					var config = {
							'expand': false,
							'last': true,
							'type': 5,
							'id': name,
							'graphid': 'custom',
							'displayfields': false,
							'label': {
								'value': name,
								'alttext': name
							},
							'metadata': {
								'enable': false
							},
							'opacity': {
								'enable': false,
								'min': 0,
								'max': 1,
								'initstate': 1
							},
							'visibility': {
								'enable': false,
								'initstate': 1,
								'type': 1,
								'radioid': 0
							},
							'displaychild': {
								'enable': false,
								'symbol': ''
							},
							'customimage': {
								'enable': false,
								'images': []
							},
							'items': []
					};

					return config;
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new toolbardataViewModel($mapElem, mapid, config, isDatagrid);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		subscribeIsAddData = function(mapid, funct) {
			return vm[mapid].isAddData.subscribe(funct);
		};

		notifyAdd = function(mapid) {
			var viewModel = vm[mapid];

			// link to view model to call the function inside
			if (typeof viewModel !== 'undefined') {
				viewModel.notifyAdd();
			}
		};

		getURL = function(mapid) {
			var url = '',
				viewModel = vm[mapid];

			// link to view model to call the function inside
			if (typeof viewModel !== 'undefined') {
				url = viewModel.getURL();
			}

			return url;
		};

		return {
			initialize: initialize,
			subscribeIsAddData: subscribeIsAddData,
			notifyAdd: notifyAdd,
			getURL: getURL
		};
	});
}).call(this);
