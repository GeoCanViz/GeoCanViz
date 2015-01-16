/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Datagrid view model widget
 */
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
			removeTab,
			innerAddTab,
			innerRemoveTab,
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
					selectIdFeatures = [],
					allIdFeatures = [],
					currFeatIndex = 0,
					totalFeatures = 0,
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					$datagrid = $viz('#gcviz-datagrid' + mapid),
					$datatab = $viz('#gcviz-datatab' + mapid),
					$datatabUl = $datatab.find('ul'),
					$popContent = $viz('#gcviz-popup-content' + mapid);

				// text for datatable
				_self.processing = i18n.getDict('%datagrid-processing');
				_self.search = i18n.getDict('%datagrid-search');
				_self.lengthMenu = i18n.getDict('%datagrid-lengthMenu');
				_self.info = i18n.getDict('%datagrid-info');
				_self.infoEmpty = i18n.getDict('%datagrid-infoEmpty');
				_self.infoFiltered = i18n.getDict('%datagrid-infoFiltered');
				_self.infoThousands = i18n.getDict('%datagrid-infoThousands');
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
				_self.lblAllLayer = i18n.getDict('%datagrid-popalllayers');
				_self.lblSelectLayer = i18n.getDict('%datagrid-popselect');
				_self.lblClearZoom = i18n.getDict('%datagrid-clearzoom');

				// text for popup
				_self.lblSelectAll = i18n.getDict('%datagrid-selectall');
				_self.lblZoomSelect = i18n.getDict('%datagrid-zoomselect');
				_self.popupDialogTitle = i18n.getDict('%datagrid-poptitle');

				// observable for popup
				_self.layerNameHolder = ko.observableArray([]);
				_self.layerName = ko.observableArray([_self.lblAllLayer]); // create with value so the binding is not fire when we add the value
				_self.featLayerName = ko.observable('');
				_self.selectedLayer = ko.observable(0);
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
							// redraw to align header and column
							objDataTable[tables - 1].draw();
						}
					});
					$viz('.ui-accordion-header').hide();

					// wait for the map to load
					mymap.on('load', function() {
						var interval,
							layers = config.layers,
							lenLayers = layers.length;

						// intialize gisdatagrid. It will create the grahic layer for selection
						gisDG.initialize(mymap);

						// initialize array length to position the data at the right place later.
						// if a table initialize slower then next one, position can be messed up.
						objDataTable[lenLayers - 1] = undefined;
						objData[lenLayers - 1] = undefined;

						// loop all layers inside an interval to make sure there is no mees up with the index
						// When they start at the same time, index can be switch to another table and the geometries
						// doesn't match the table anymore.
						interval = setInterval(function() {
							lenLayers--;
							_self.getData(layers[lenLayers], lenLayers);
							
							if (lenLayers === 0) {
								clearInterval(interval);
							}
						}, 1000);
					});
				};

				_self.getData = function(layer, pos) {
					var urlFull,
						layerInfo = layer.layerinfo,
						layerIndex = layerInfo.index,
						type = layerInfo.type,
						url = mymap.getLayer(layerInfo.id).url,
						popup = layer.popups.enable;

					// set position in the array too be able to create unique id later
					layerInfo.pos = pos;

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

				_self.removeTab = function(id) {
					console.log(id);
					$viz('[id=' + id + ']').remove();
					$datatab.tabs('refresh');
				};

				_self.createTab = function(data) {
					// get layer info from first element
					var item = data[0],
						layer = item.layer;
					delete item.layer;

					// increment table
					table += 1;

					// add the tab and controls (select all, zoom selected and clear zoom)
					$datatabUl.append('<li><a href="#tabs-' + mapid + '-' + table + '" id="' + item.layerid + '">' + layer.title + '</a></li>');
					$datatab.append('<div id="tabs-' + mapid + '-' + table + '" class="gcviz-datagrid-tab">' +
									'<table id="table-' + mapid + '-' + table + '" class="gcviz-datatable display">' +
										'<button class="gcviz-dg-zoomsel">' + _self.lblZoomSelect + '</button>' +
										'<button class="gcviz-dg-clearzoom">' + _self.lblClearZoom + '</button>' +
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
						'serverSide': false,
						'scrollY': 400,
						'scrollX': true,
						'scrollCollapse': true,
						'pagingType': 'full',
						'processing': true,
						'columns': fields,
						'initComplete': function(inTable) {
							_self.finishInit(table);
							
							// Setup - add a text input to each header cell (for search capabilities)
							$viz('#' + inTable.sTableId + '_wrapper .dataTables_scrollHead th').each(function (colIdx) {
								if (colIdx > 2) {
									$(this).append('<input type="text" class="gcviz-dt-search" placeholder="Search '+ this.innerText +'"></text>');
								}
							});
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
						},
						rowCallback: function(row, data) {
							// Set the checked state of the checkbox in the table
							var item = $viz('.gcviz-dg-select', row),
								val = data.gcvizcheck;
							item.prop('checked', val === true);
							_self.highlightRow(item, val);
						}
					});

					// Apply the search by field
					dataTB.columns().eq(0).each(function(colIdx) {
						$viz('input', dataTB.column(colIdx).header()).on('keyup change', function() {
							dataTB
								.column(colIdx)
								.search(this.value)
								.draw();
							});
					});

					// FIXED COLUMNS
					// we cant use fixed column because of 2 main reasons. First it is not WCAG. When we tab, there is
					// hidden object (the checkbox and button under the freeze columns). Second, it is really hard to make
					// it work on 2 tables on different tab. If they are both on the same page it is ok. I use some
					// workaround to be able to solve this like reinitialze on tab active. but another problem always
					// arise (the redraw made the selection disapear)!
					//new $viz.fn.dataTable.FixedColumns($viz('#table-' + mapid + '-' + table), { leftColumns: 2 });

					// order the first row after select and zoom by default to remove the arrow on select column
					dataTB.order([3, 'asc']).draw();

					// add the datatable and data to a global array so we can access it later
					// reverse the data to have then in the same order as the id. It will easier to find later.
					// we set the table at the right position to ensure a good link. If not, table with item 1-1
					// can be in the third position of the array. The result is the zoom function will use the wrong
					// geometry.
					if (typeof layer.layerinfo !== 'undefined') {
						objDataTable[layer.layerinfo.pos] = dataTB;
						objData[layer.layerinfo.pos] = data.reverse();
					} else {
						// table added with data toolbar
						objDataTable.push(dataTB);
						objData.push(data.reverse());
					}
				};

				_self.createFields = function(layer) {
					var field,
						fields = layer.fields,
						lenFields = fields.length;

					// add ... to string field when length is more then 40 characters
					while (lenFields--) {
						field = fields[lenFields];

						field.render = function (data, type, row) {
							if (data !== null) {
								// for wcag we add a text input read only. This element is focusable so we can have
								// the tooltip. Wrap in a relative position div to have the tooltip at the right
								// after a scroll
								return type === 'display' && data.length > 40 ?
								'<div style="position: relative;"><span title="'+ data +'">' + data.substr(0, 38) + '</span>' +
								'<input type="text" readOnly=true value= "..." class="gcviz-datagrid-stringbtn"></input>' +
								'<span class="gcviz-datagrid-stringtp">' + data + '</span></div>' : data;
							} else {
								return data;
							}
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
						render: function (data, type) {
									if (type === 'display') {
										return '<button class="gcviz-dg-zoom">Zoom</button>';
									}
									return data;
								}
					});

					fields.unshift({
						data: 'gcvizcheck',
						className: 'dt-body-center',
						title: 'Select',
						width: '45px',
						searchable: false,
						orderable: false,
						render: function (data, type) {
									if (type === 'display') {
										return '<input type="checkbox" class="gcviz-dg-select"></input>';
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
							event: 'mouseover',
							activate: function() {
								// order the first row after select and zoom to align header and column
								var len = objDataTable.length;

								while (len--) {
									objDataTable[len].draw();
								}
							}
						});
						$datagrid.accordion('refresh');

						// enable datagrid button in footerVM
						gcvizFunc.setElemValueVM(mapid, 'footer', 'isTableReady', true);
						
						$viz('.gcviz-dt-search').on('click', function(e) {
							event.stopPropagation();
						});
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
					$table.on('change', '.gcviz-dg-select', function(e) {
						var $checkbox = $viz(e.target.parentNode.parentNode).find('.gcviz-dg-select'),
							info = _self.getInfo(e, 'control');

						// select or unselect feature on map
						_self.select($checkbox, info);
					});

					// search fields
					$table.on('search.dt', function(e) {
						var api = $viz(this.parentElement.parentElement.parentElement).find('input')[0].value;
					});

					// set select/unselect all event
					$tabs.on('change', '.gcviz-dg-selall', function(e) {
						// select or unselect all features
						_self.selectAll(e);
					});

					// set zoom event
					$table.on('click', '.gcviz-dg-zoom', function(e) {
						// get the id from the table
						var info = _self.getInfo(e, 'control');

						// zoom to feature
						_self.zoom(info);
					});

					// set zoom selected event
					$tabs.on('click', '.gcviz-dg-zoomsel', function(e) {
						// zoom to features
						_self.zoomSelect(e);
					});
					
					// set clear zoom event
					$tabs.on('click', '.gcviz-dg-clearzoom', function(e) {
						// clear zoom features
						gisDG.unselectFeature('zoom');
					});

					// set click and double click on row
					// code for this section as been taken from the first answer
					// http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
					$table.on('click', 'tr', function(e) {
						var info, $checkbox,
							target = e.target,
							targetType = target.type;

						// if target type is different then checbox or button, it means
						// row has been clicked
						if (targetType !== 'checkbox' && targetType !== 'submit') {
							// increment count clicks
							clicks++;

							if (clicks === 1) {
								timer = setTimeout(function() {
									// perform single-click action
									$checkbox = $viz(target.parentNode).find('.gcviz-dg-select');

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
					} else if (type === 'control') {
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

						if (feat.gcvizcheck) {
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
						feat.gcvizcheck = true;
						_self.highlightRow(checkbox, true);
						gisDG.selectFeature(feat.geometry, info);
					} else {
						feat.gcvizcheck = false;
						_self.highlightRow(checkbox, false);
						gisDG.unselectFeature('sel' + '-' + info.table + '-' + info.feat);
					}
				};

				_self.selectAll = function(e) {
					var tableId, table, val, lenTable, check, rows,
						info = { },
						target = e.target,
						checks = target.parentElement.getElementsByClassName('gcviz-dg-select'),
						len = checks.length;

					// it comes from the checkbox, we grab the table id (we will need it later)
					tableId = parseInt(target.parentElement.id.split('-')[2] - 1, 10);
					info.table = tableId;

					// update the ui with the selected value
					val = target.checked;
					rows = objDataTable[tableId].rows().nodes();
					while (len--) {
						check = $viz('.gcviz-dg-select', rows[len]);

						checks[len].checked = val;
						_self.highlightRow(check, val);
					}

					// if the type is checkbox, we apply the check value to all features from the table
					// we also apply the select on unselect task for every feature.
					table = objData[tableId];
					lenTable = table.length;

					while (lenTable--) {
						if (val) {
							info.feat = [lenTable];
							table[lenTable].gcvizcheck = true;
							gisDG.selectFeature(table[lenTable].geometry, info);
						} else {
							table[lenTable].gcvizcheck = true;
							gisDG.unselectFeature('sel' + '-' + tableId + '-' + lenTable);
						}
					}
				};

				_self.highlightRow = function(item, check) {
					var row = item.parent().parent();
					
					// set class to row if selected. We also have to set it to column with
					// sorting class. If not, the color is not applied.
					if (check) {
						row.addClass('gcviz-backYellow');
						row.find('.sorting_1').addClass('gcviz-backYellow');
					} else {
						row.removeClass('gcviz-backYellow');
						row.find('.gcviz-backYellow').removeClass('gcviz-backYellow');
					}
				};

				// keep _self outiside initialize to be able to call it from outside
				// in this case we will need it to add a new tab for csv data or remove one
				innerAddTab = _self.createTab;
				innerRemoveTab = _self.removeTab;
				innerTable = tables - 1;

				// ********* popup section **********
				_self.returnIdTask = function(array) {
					var features, feature, lenFeat,
						isFeatures = false,
						lenLayers = array.length;

					// reset array of feature and layer selection
					allIdFeatures = [];
					_self.layerNameHolder([]);

					// get the list of layers we got results from and add them to the scroll list in the popup
					// first add the all layers label
					_self.layerNameHolder.push(_self.lblAllLayer);

					while (lenLayers--) {
						features = array[lenLayers][1];
						lenFeat = features.length;

						if (lenFeat > 0) {
							isFeatures = true;

							while (lenFeat--) {
								feature = features[lenFeat];

								// put the features in a variable accessible by the other functions.
								// add the layer name
								allIdFeatures.push(feature);
								_self.layerNameHolder.push(feature.layerName);
							}
						}
					}

					// make sure array of layer is unique for select
					if (isFeatures) {
						_self.layerName(ko.utils.arrayGetDistinctValues(_self.layerNameHolder()));
						_self.changeSelectLayer();
					}
				};

				_self.displayFeature = function(currentFeature) {
					var info,
						attrNames,
						attrValues,
						field, fields, lenFields,
						layer,
						layerName = currentFeature.layerName,
						feature = currentFeature.feature,
						attributes = feature.attributes,
						layers = config.layers,
						len = layers.length;

					// display the feature attributes in the popup
					while (len--) {
						layer = layers[len];

						if (layer.popups && layerName === layer.popups.title) {

							// get the feature attribute names and values
							attrNames = $viz.map(attributes, function(value, index) {
								return [index];
							});
							attrValues = $viz.map(attributes, function(value) {
								return [value];
							});

							// set feature layer name
							_self.featLayerName(layerName);

							// put the desired fields in the content description
							info = '';
							fields = layer.fields;
							lenFields = fields.length - 1;

							// the last 3 fields are for id, select and zoom
							while (lenFields > 2) {
								field = fields[lenFields];
								lenFields--;

								for (var l = 0; l < attrNames.length; l++) {
									if (field.dataalias.toUpperCase() === attrNames[l].toUpperCase()) {
										info = '<span class="gcviz-prop">' + field.title + '</span>' +
												'<p class="gcviz-val">' + attrValues[l] + '</p>' +
												info;
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

					// remove highlight
					gisDG.unselectFeature('popup');
				};

				_self.changeSelectLayer = function() {
					var feat,
						allLayer = _self.lblAllLayer,
						selLayer = _self.selectedLayer(),
						len = allIdFeatures.length;

					// remove highlight
					gisDG.unselectFeature('popup');

					// reset selected array of features
					selectIdFeatures = [];

					// set the selectIdFeatures from the layer selected if not all layers
					if (selLayer !== allLayer) {
						while (len--) {
							feat = allIdFeatures[len];

							if (feat.layerName === selLayer) {
								selectIdFeatures.push(feat);
							}
						}
					} else {
						selectIdFeatures = allIdFeatures;
					}

					// set total count. If it is 0, it means there is no
					// feature on the layer selected by default. In this case, set back
					// to all features and select the all layers value.
					totalFeatures = selectIdFeatures.length;
					if (totalFeatures === 0) {
						_self.selectedLayer(allLayer);
						selectIdFeatures = allIdFeatures;
					}

					// display the first feature
					currFeatIndex = 0;
					_self.displayFeature(selectIdFeatures[0]);
					_self.isPopupDialogOpen(true);
					_self.popupCounter('1 / ' + totalFeatures);
					_self.isEnablePrevious(false);

					// check if we enable next button
					if (totalFeatures > 1) {
						_self.isEnableNext(true);
					}
				};

				_self.clickZoom = function() {
					var feature = selectIdFeatures[currFeatIndex].feature;
					gisMap.zoomFeature(mymap, feature);
				};

				_self.clickPrevious = function() {
					var currentFeature,
						isEnable;

					// decrement index unless already 0
					if (currFeatIndex > 0) {
						currFeatIndex--;

						// show feature
						currentFeature = selectIdFeatures[currFeatIndex];
						_self.displayFeature(currentFeature);

						// enable buttons and update count
						isEnable = (currFeatIndex === 0) ? false : true;
						_self.isEnablePrevious(isEnable);
						_self.isEnableNext(true);
						_self.popupCounter((currFeatIndex + 1) + ' / ' + totalFeatures);

						// remove highlight on previous then highlight the current feature
						gisDG.unselectFeature('popup');
						gisDG.selectFeaturePop(currentFeature.feature.geometry);
					}
				};

				_self.clickNext = function() {
					var currentFeature,
						isEnable;

					// increment index unless already total feature
					if (currFeatIndex <= (totalFeatures - 1)) {
						currFeatIndex++;

						// show feature
						currentFeature = selectIdFeatures[currFeatIndex];
						_self.displayFeature(currentFeature);

						// enable buttons and update count
						isEnable = (currFeatIndex === (totalFeatures - 1)) ? false : true;
						_self.isEnablePrevious(true);
						_self.isEnableNext(isEnable);
						_self.popupCounter((currFeatIndex + 1) + ' / ' + totalFeatures);

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
				data.gcvizcheck = false;
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
			innerAddTab(datas);
		};

		removeTab = function(id) {
			innerRemoveTab(id);
		};

		return {
			initialize: initialize,
			addTab: addTab,
			removeTab: removeTab
		};
	});
}).call(this);
