/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Datagrid view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n',
			'gcviz-func',
			'gcviz-gismap',
			'gcviz-gisdatagrid'
	], function($viz, ko, i18n, gcvizFunc, gisMap, gisDG) {
		var initialize,
			addTab,
			innerTab,
			innerTable,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var datagridViewModel = function($mapElem, mapid, config) {
				var _self = this,	
					delay = 400, clicks = 0, timer = null,
					objDataTable = [],
					objData = [],
					table = 0,
					tables = config.layers.length,
					identifiedFeatures = [],
					currentFeatureIndex = 0,
					totalFeatures = 0,
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					$datagrid = $viz('#gcviz-datagrid' + mapid),
					$datatab = $viz('#gcviz-datatab' + mapid),
					$datatabUl = $datatab.find('ul'),
					$popLayerSel = $viz('#popupSelect' + mapid),
					$popContent = $viz('#gcviz-popup-content' + mapid);

				// text for datatable
				_self.processing = i18n.getDict('%datagrid-processing');
				_self.search = i18n.getDict('%datagrid-search');
				_self.lengthMenu = i18n.getDict('%datagrid-lengthMenu');
				_self.info = i18n.getDict('%datagrid-info');
				_self.infoEmpty = i18n.getDict('%datagrid-infoEmpty');
				_self.infoFiltered = i18n.getDict('%datagrid-infoFiltered');
				_self.infoThousands =  i18n.getDict('%datagrid-infoThousands');
				_self.infoPostFix = i18n.getDict('%datagrid-infoPostFix');
				_self.loadingRecords = i18n.getDict('%datagrid-loadingRecords');
				_self.zeroRecords = i18n.getDict('%datagrid-zeroRecords');
				_self.emptyTable = i18n.getDict('%datagrid-emptyTable');
    			_self.first = i18n.getDict('%datagrid-first');
				_self.previous = i18n.getDict('%datagrid-previous');
				_self.next = i18n.getDict('%datagrid-next');
				_self.last = i18n.getDict('%datagrid-last');
				_self.sortAscending = i18n.getDict('%datagrid-sortAscending');
				_self.sortDescending = i18n.getDict('%datagrid-sortDescending');
				_self.lblAllLayer =  i18n.getDict('%datagrid-popalllayers');
				_self.lblSelectLayer =  i18n.getDict('%datagrid-popselect');

				// text for popup
				_self.lblSelectAll =  i18n.getDict('%datagrid-selectall');
				_self.lblZoomSelect =  i18n.getDict('%datagrid-zoomselect');
				_self.popupDialogTitle = i18n.getDict('%datagrid-poptitle');
				
				// observable for popup
				_self.isPopupDialogOpen = ko.observable(false);
				_self.isEnablePrevious = ko.observable(false);
				_self.isEnableNext = ko.observable(false);
				_self.popupCounter = ko.observable('');

				_self.init = function() {
					// init accordion and hide header
					$viz('#gcviz-datagrid' + mapid).accordion({
						collapsible: true,
						active: false,
						activate: function() {
							// order the first row after select and zoom to align header and column
							objDataTable[0].order([3, 'asc']).draw();
						}
					});
					$viz('.ui-accordion-header').hide();
					
					// wait for the map to load
					mymap.on('load', function() {
						var layers = config.layers,
							lenLayers = layers.length;
						
						// intialize gisdatagrid. It will create the grahic layer for selection
						gisDG.initialize(mymap);

						// loop all layers
						while (lenLayers--) {
							_self.getData(layers[lenLayers]);
						}
					});
				};

				_self.getData = function(layer) {
					var urlFull,
						layerInfo = layer.layerinfo,
						layerIndex = layerInfo.index,
						type = layerInfo.type,
						url = mymap.getLayer(layerInfo.id).url,
						popup = layer.popups.enable;

					if (type === 4) {
						// datatable (dynamic layer, need layer index to select one layer in the dynamic service)
						urlFull = url + layerIndex + '/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();
						gisDG.getData(urlFull, layer, _self.createTab);
						
						// popup
						if (popup) {
							gisDG.createIdTask(url, layerIndex, _self.returnIdTask);
						}
					} else if (type === 5) {
						// datatable (feature layer)
						urlFull = url + '/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();
						gisDG.getData(urlFull, layer, _self.createTab);
						
						// popup (remove layer index)
						if (popup) {
							url = url.substring(0, url.indexOf('MapServer/') + 10);
							gisDG.createIdTask(url, layerIndex, _self.returnIdTask);
						}
					}
				};
				
				_self.createTab = function(data) {
					// get layer info from first element
					var layer = data[0].layer,
						id = layer.mapid;
					delete data[0].layer;

					// increment table
					table += 1;
					
					// add the tab
					$datatabUl.append('<li><a href="#tabs-' + id + '-' + table + '">' + layer.title + '</a></li>');					
					$datatab.append('<div id="tabs-' + id + '-' + table + '" class="gcviz-datagrid-tab">' +
									'<table id="table-' + id + '-' + table + '" class="gcviz-datatable display">' +
										'<button class="gcviz-dg-zoomsel">' + _self.lblZoomSelect + '</button>' +
										'<input type="checkbox" class="gcviz-dg-selall" id="cb_seletAllFeat">' +
										'<label for="cb_seletAllFeat" class="form-checkbox gcviz-dg-lblselall">' + _self.lblSelectAll + '</label>' +
									'</table></div>');

					// create datatable
					_self.createTable(data, layer);
				};
				
				_self.createTable = function(data, layer) {
					var dataTB,
						$table = $viz('#table-' + mapid + '-' + table),
						fields = _self.createFields(layer);

					dataTB = $table.DataTable({
						'data': data,
						'scrollY': 300,
						'scrollX': true,
						'scrollCollapse': true,
						'pagingType': 'full',
						'processing': true,
						'columns': fields,
						'initComplete': function(setting) {
							_self.finishInit(table);
						},
						'language': {
							'processing': _self.processing,
							'search': _self.search,
							'lengthMenu': _self.lengthMenu,
							'info': _self.info,
							'infoEmpty': _self.infoEmpty,
							'infoFiltered': _self.infoFiltered,
							'infoThousands': _self.infoThousands,
							'infoPostFix': _self.infoPostFix,
							'loadingRecords': _self.loadingRecords,
							'zeroRecords': _self.zeroRecords,
							'emptyTable': _self.emptyTable,
    						'paginate': {
								'first': _self.first,
								'previous': _self.previous,
								'next': _self.next,
								'last': _self.last
    						},
    						'aria': {
    							'sortAscending': _self.sortAscending,
								'sortDescending': _self.sortDescending
							}
						}
					});
					
					// FIXED COLUMNS
					// we cant use fixed column because of 2 main reasons. First it is not WCAG. When we tab, there is
					// hidden object (the checkbox and button under the freeze columns). Second, it is really hard to make
					// it work on 2 tables on different tab. If they are both on the same page it is ok. I use some
					// workaround to be able to solve this like reinitialze on tab active. but another problem always
					// arise (the redraw made the selection disapear)!
					//new $viz.fn.dataTable.FixedColumns($viz('#table-' + mapid + '-' + table), { leftColumns: 2 });

					// set the draw event to select/unselect all. We need to have this event because when we click
					// the select all, it only does it for what we can see on the page.
					$table.on('draw.dt', function(e) {
						// select or unselect all features
						_self.selectAll(e, 'page');
					});

					// order the first row after select and zoom by default to remove the arrow on select column
					dataTB.order([3, 'asc']).draw();

    				// add the datatable and data to a global array so we can access it later
    				// reverse the data to have then in the same order as the id. It will easier to find later.
					objDataTable.push(dataTB);
					objData.push(data.reverse());
				};
				
				_self.createFields = function(layer) {
					var field,
						fields = layer.fields,
						lenFields = fields.length;
					
					// add ... to string field when length is more then 40 characters
					while (lenFields--) {
						field = fields[lenFields];
						
						field.render = function (data, type, full, meta) {
							return type === 'display' && data.length > 40 ?
								'<span title="'+ data +'">' + data.substr(0, 38) + '...</span>' : data;
						};
					}

					// add zoom and select column
					fields.unshift({
						data: null,
						className: 'dt-body-center',
						title: 'Zoom',
						width: '45px',
						searchable: false,
						orderable: false,
						render: function (data, type, row) {
								        	if (type === 'display') {
												return '<button class="gcviz-dg-zoom">Zoom</button>';
											}
											return data;
										}
					});

					fields.unshift({
						data: null,
						className: 'dt-body-center',
						title: 'Select',
						width: '45px',
						searchable: false,
						orderable: false,
						render: function (data, type, row) {
								        	if (type === 'display') {
												return '<input type="checkbox" class="gcviz-dg-select">';
											}
											return data;
										}
					});
					
					// add unique id column. We cant use visible false because the column is not added to the table
					// we add a class and set display none to have the info there but invisible.
					fields.unshift({
						data: 'gcvizid',
						className: 'gcviz-dg-id',
						title: 'id',
						searchable: false,
						orderable: false
					});

					return fields;
				};

				_self.finishInit = function() {
					
					_self.setEvents();
    
					// if all tables have been initialize
					if (table === tables) {	
						// set tabs and refresh accordion
						$datatab.tabs({
							heightStyle: 'auto',
							activate: function(event, ui) {
								// order the first row after select and zoom to align header and column
								var len = objDataTable.length;
								
								while (len--) {
									objDataTable[len].order([3, 'asc']).draw();
								}
							}
						});
						$datagrid.accordion('refresh');
						
						// enable datagrid button in footerVM
						gcvizFunc.setElemValueVM(mapid, 'footer', 'isTableReady', true);
					}

					// new table have been added
					if (table > tables) {
						$datatab.tabs('refresh');
						$datagrid.accordion('refresh');
					}
				};

				_self.setEvents = function() {
					var $table = $viz('#table-' + mapid + '-' + table),
						$tabs = $viz('#tabs-' + mapid + '-' + table);
					
					// set checkbox event
					$table.on('change', 'input.gcviz-dg-select', function(e) {
						var $checkbox = $viz(e.target.parentNode.parentNode).find('.gcviz-dg-select'),
							info = _self.getInfo(e, 'control');

						// select or unselect feature on map
						_self.select($checkbox, info);
					});
					
					// set select/unselect all event
					$tabs.on('change', 'input.gcviz-dg-selall', function(e) {												
						// select or unselect all features
						_self.selectAll(e, 'checkbox');
					});

					// set zoom event
					$table.on('click', 'button.gcviz-dg-zoom', function(e) {
						// get the id from the table
						var info = _self.getInfo(e, 'control');
						
						// zoom to feature
						_self.zoom(info);
					});
					
					// set zoom selected event
					$tabs.on('click', 'button.gcviz-dg-zoomsel', function(e) {
						// zoom to features
						_self.zoomSelect(e);
					});

					// set click and double click on row
					// code for this section as been taken from the first answer
					// http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
					$table.on('click', function(e) {
						var info,
							targetType = e.target.type;

						// if target type is different then checbox or button, it means
						// row has been clicked
						if (targetType !== 'checkbox' && targetType !== 'submit') {
							// increment count clicks
							clicks++; 

							if (clicks === 1) {
								timer = setTimeout(function() {
									// perform single-click action
									var $checkbox = $viz(e.target.parentNode).find('.gcviz-dg-select');
									
									// get the id from the table
									info = _self.getInfo(e, 'row');

									// select or unselect feature on map
									// check or uncheck select then select feature on map
									if ($checkbox.prop('checked')) {
										$checkbox.prop('checked', false);
									} else {
										$checkbox.prop('checked', true);
									}
									_self.select($checkbox, info);

									// after action performed, reset counter
									clicks = 0;
								}, delay);
							} else {
								// prevent single-click action
								clearTimeout(timer);

								// perform double-click action
								// get the id from the table
								info = _self.getInfo(e, 'row');
								
								// zoom to feature
								_self.zoom(info);

								// after action performed, reset counter
								clicks = 0;
							}
						}
					}).on('dblclick', function(e) {
						// cancel system double-click event
						e.preventDefault();
					});
				};
				
				_self.getInfo = function(e, type) {
					var objInfo,
						str,
						info;
					
					if (type === 'row') {
						str = $viz(e.target.parentNode).find('.gcviz-dg-id').html();
					} else {
						str = $viz(e.target.parentNode.parentNode).find('.gcviz-dg-id').html();
					}
					
					info = str.split('-');
					
					// set table number and feature number
					objInfo = {
						table: parseInt(info[0], 10),
						feat: parseInt(info[1], 10)
					};
					
					return objInfo;
				};
				
				_self.zoom = function(info) {
					var geom;
					
					// get feature geometry, then call gisDatagrid to create graphic and zoom
					geom = objData[info.table][info.feat].geometry;
					gisDG.zoomFeature(geom);
				};

				_self.zoomSelect = function(e) {
					var feat,
						features = [],
						tableId = parseInt(e.target.parentElement.id.split('-')[2], 10) - 1,
						data = objData[tableId],
						len = data.length;
					
					// loop trought all the data for this table and keep all the features
					// selected
					while (len--) {
						feat = data[len];
						
						if (feat.gcvizCheck) {
							features.push(feat.geometry);
						}
					}
					
					// if there is 1 feature or more, call gisDatagrid to zoom to extent
					// of selection.
					if (features.length > 0) {
						gisDG.zoomFeatures(features);
					}
				};

				_self.select = function(checkbox, info) {
					var geom,
						feat = objData[info.table][info.feat];

					// check or uncheck select checkbox
					// get the geometry then call gisDatagrid to select feature on map (create graphic)
					// or unselect the feature (remove graphic)
					if (checkbox.prop('checked')) {
						feat.gcvizCheck = true;
						geom = feat.geometry;
						gisDG.selectFeature(geom, info);
					} else {
						feat.gcvizCheck = false;
						gisDG.unselectFeature('sel' + info.table + '-' + info.feat);
					}
				};

				_self.selectAll = function(e, type) {
					var check, tableId, table, val, lenTable,
						info = { },
						target = e.target,
						checks = target.parentElement.getElementsByClassName('gcviz-dg-select'),
						len = checks.length;

					// get the value oc select all checkbox. We do it differentlly if it comes from
					// a next page redraw event or a actual check on the checkbox.
					// if it comes from the checkbox, we grab the table id (we will need it later)
					if (type === 'page') {
						val = target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('gcviz-dg-selall')[0].checked;
					} else {
						val = target.checked;
						tableId = parseInt(target.parentElement.id.split('-')[2] - 1, 10);
						
						// set table id info
						info.table = tableId;
					}

					// update the ui with the selected value
					while (len--) {
						if (val) {
							checks[len].checked = val;
						} else {
							checks[len].checked = val;
						}
					}

					// if the type is checkbox, we apply the check value to all features from the table
					// we also apply the select on unselect task for every feature.
					if (type === 'checkbox') {
						table = objData[tableId],
						lenTable = table.length;
						
						while (lenTable--) {
							if (val) {
								info.feat = [lenTable];
								table[lenTable].gcvizCheck = true;
								gisDG.selectFeature(table[lenTable].geometry, info);
							} else {
								table[lenTable].gcvizCheck = false;
								gisDG.unselectFeature('sel' + tableId + '-' + lenTable);
							}
						}
					}
				};

				// keep _self outiside initialize to be able to call it from outside
				// in this case we will need it to add a new tab for csv data
				innerTab = _self.createTab;
				innerTable = table;

				// ********* popup section **********
				_self.returnIdTask = function(array) {
					var featName,
						layerNamesList = [],
						features, feature, lenFeat,
						lenLayers = array.length,
						i = 0;

					while (lenLayers--) {
						features = array[lenLayers][1];
						lenFeat = features.length;

						if (lenFeat > 0) {
							// increment total feature
							totalFeatures += features.length;
	
							// get the list of layers we got results from and add them to the scroll list in the popup
							// first add the all layers label
							$popLayerSel.empty();
							$popLayerSel
								.append($viz('<option></option>')
								.attr('value', -1)
								.text(_self.lblAllLayer));
							
							while (lenFeat--) {
								feature = features[lenFeat];
								
								// put the features in a variable accessible by the other functions.
								identifiedFeatures.push(feature);
							
								// check if layer name is already in the array
								featName = feature.layerName;
								if ($viz.inArray(featName, layerNamesList) === -1) {
									layerNamesList.push(featName);
									$popLayerSel
										.append($viz('<option></option>')
										.attr('value', i)
										.text(featName));
									i++;
								}
							}
						}
					}

					// remove highlight
					gisDG.unselectFeature('popup');
						
					// display the first feature
					currentFeatureIndex = 0;
					_self.displayFeature(identifiedFeatures[0]);
					_self.isPopupDialogOpen(true);
					_self.popupCounter('1/' + totalFeatures);
					_self.isEnablePrevious(false);

					// check if we enable next button
					if (totalFeatures > 1) {
						_self.isEnableNext(true);
					}
				};

				_self.displayFeature = function(currentFeature) {
					var info,
						attrNames,
						attrValues,
						field, fields, lenFields,
						layer,
						feature = currentFeature.feature,
						attributes = feature.attributes,
						layers = config.layers,
						len = layers.length;

					// display the feature attributes in the popup
					while (len--) {
						layer = layers[len];
						
						if (layer.popups && currentFeature.layerName === layer.popups.title) {

							// get the feature attribute names and values
							attrNames = $viz.map(attributes, function(value, index) {
								return [index];
							});
							attrValues = $viz.map(attributes, function(value, index) {
								return [value];
							});

							//Put the desired fields in the content description
							info = '';
							fields = layer.fields;
							lenFields = fields.length - 1;

							// the first 3 fields are for id, select and zoom
							while (lenFields > 2) {
								field = fields[lenFields];
								lenFields--;

								for (var l = 0; l < attrNames.length; l++) {
									if (field.datapop.toUpperCase() === attrNames[l].toUpperCase()) {
										info += '<span class="gcviz-prop">' + field.title + '</span><br/>' +
												'<span class="gcviz-val">' + attrValues[l] + '</span><br/>';
									}
								}
							}

							// update content
							$popContent.html(info);
						}
					}

					// highlight the feature
					gisDG.selectFeaturePop(feature.geometry);
				};

				_self.dialogPopupClose = function() {
					_self.isPopupDialogOpen(false);
					currentFeatureIndex = -1;
					totalFeatures = 0;
					
					// remove highlight
					gisDG.unselectFeature('popup');
				};

				_self.clickZoom = function() {
					var feature = identifiedFeatures[currentFeatureIndex].feature;
					gisMap.zoomFeature(mymap, feature);
				};

				_self.clickPrevious = function() {
					var currentFeature,
						graphicFeature;

					// decrement index unless already 0
					if (currentFeatureIndex > 0) {
						currentFeatureIndex--;
						currentFeature = identifiedFeatures[currentFeatureIndex];
						_self.displayFeature(currentFeature);

						if (currentFeatureIndex === 0) {
							_self.isEnablePrevious(false);
						} else {
							_self.isEnablePrevious(true);
						}

						_self.isEnableNext(true);
						_self.popupCounter((currentFeatureIndex + 1) + '/' + totalFeatures);

						// remove highlight on previous then highlight the current feature
						gisDG.unselectFeature('popup');
						gisDG.selectFeaturePop(currentFeature.feature.geometry);
					}
				};

				_self.clickNext = function() {
					var currentFeature,
						graphicFeature;

					// increment index unless already total feature
					if (currentFeatureIndex <= (totalFeatures - 1)) {
						currentFeatureIndex++;
						currentFeature = identifiedFeatures[currentFeatureIndex];
						_self.displayFeature(currentFeature);

						if (currentFeatureIndex === (totalFeatures - 1)) {
							_self.isEnableNext(false);
						} else {
							_self.isEnableNext(true);
						}

						_self.isEnablePrevious(true);
						_self.popupCounter((currentFeatureIndex + 1) + '/' + totalFeatures);

						// remove highlight on previous then highlight the current feature
						gisDG.unselectFeature('popup');
						gisDG.selectFeaturePop(currentFeature.feature.geometry);
					}
				};

				_self.init();
			};

			vm = new datagridViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};
		
		addTab = function(mapid, featColl, title, layerId) {
			var field, feat,
				data = { },
				fields = [],
				datas = [],
				fieldsOri = featColl.layerDefinition.fields,
				lenField = fieldsOri.length,
				layer = { },
				feats = featColl.featureSet.features,
				lenFeat = feats.length,
				table = innerTable + 1;
			
			// setup fields
			while (lenField--) {
				field = fieldsOri[lenField];
				delete field.type;
				delete field.render;
				delete field.editable;
				delete field.domain;
				field.title = field.alias;
				delete field.alias;
				field.data = field.name;
				delete field.name;
				
				fields.push(field);
			}

			// setup data
			while (lenFeat--) {
				feat = feats[lenFeat];
				data = feat.attributes;
				data.geometry = feat.geometry;
				
				// add stuff for gcviz
				data.layerid = layerId;
				data.gcvizid = table + '-' + lenFeat;
				datas.push(data);
			}

			// recreate layerinfo like we have in config file from data added from
			// data toollbar.
			layer.title = title;
			layer.mapid = mapid;
			layer.fields = fields;
			
			// add layer info to first element
			datas[0].layer = layer;
			
			// call the inner create tab function
			innerTab(datas);
		};

		return {
			initialize: initialize,
			addTab: addTab
		};
	});
}).call(this);
