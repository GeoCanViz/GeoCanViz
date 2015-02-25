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
			'gcviz-gisdatagrid',
			'gcviz-gisgraphic'
	], function($viz, ko, i18n, gcvizFunc, gisMap, gisDG, gisGraphic) {
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
					objDataTable,
					delay = 400, clicks = 0, timer = null,
					activeTable = -1,
					arrLayerInfo = { },
					lookPopups = [],
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
					$popContent = $viz('#gcviz-popup-content' + mapid),
					$container = $viz('#' + mapid + '_holder_layers'),
					$menu = $viz('#gcviz-menu' + mapid);

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
				_self.lblClearFilters = i18n.getDict('%datagrid-clearfilters');
				_self.lblExportSelCSV = i18n.getDict('%datagrid-exportselcsv');
				_self.lblExportTableCSV = i18n.getDict('%datagrid-exporttblcsv');
				_self.lblSelectFeatures = i18n.getDict('%datagrid-selfeat');

				// text for popup
				_self.lblSelectAll = i18n.getDict('%datagrid-selectall');
				_self.lblZoomSelect = i18n.getDict('%datagrid-zoomselect');
				_self.popupDialogTitle = i18n.getDict('%datagrid-poptitle');

				// text for progress dialog
				_self.progressTitle = i18n.getDict('%datagrid-protitle');
				_self.progressDesc = i18n.getDict('%datagrid-prodesc');

				// observable for popup
				_self.layerNameHolder = ko.observableArray([]);
				_self.layerName = ko.observableArray([_self.lblAllLayer]); // create with value so the binding is not fire when we add the value
				_self.featLayerName = ko.observable('');
				_self.selectedLayer = ko.observable(0);
				_self.isPopupDialogOpen = ko.observable(false);
				_self.isEnablePrevious = ko.observable(false);
				_self.isEnableNext = ko.observable(false);
				_self.popupCounter = ko.observable('');

				// variable to start the progress dialog
				_self.isWait = ko.observable(false);

				_self.init = function() {
					// init accordion and hide header
					$datagrid.accordion({
						collapsible: true,
						active: false,
						activate: function() {
							// redraw to align header and column
							objDataTable[tables - 1].draw();
						}
					});
					$viz('.ui-accordion-header').hide();

					// start progress dialog. Put in a timer if not, the variable is not initialize
					setTimeout(function() {
						_self.isWait(true);
					}, 0);

					// wait for the map to load
					mymap.on('load', function() {
						var interval,
							layers = config.layers,
							lenLayers = layers.length;

						// intialize gisdatagrid. It will create the grahic layer for selection
						gisDG.initialize(mymap);

						// initialize array length to position the data at the right place later.
						// if a table initialize slower then next one, position can be messed up.
						objDataTable = new Array(lenLayers);

						// loop all layers inside an interval to make sure there is no mess up with the index
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

				_self.openWait = function(event) {
					$viz(event.target.parentElement).find('.ui-dialog-titlebar-close').addClass('gcviz-dg-wait');
				};

				_self.closeWait = function() {
					// do not close wait if process is not finish
					if (_self.isWait()) {
						return false;
					} else {
						return true;
					}
				};

				_self.getData = function(layer, pos) {
					var urlFull, strField,
						layerInfo = layer.layerinfo,
						layerIndex = layerInfo.index,
						type = layerInfo.type,
						url = mymap.getLayer(layerInfo.id).url,
						popup = layer.popups,
						fields = layer.fields,
						fieldsLen = fields.length;

					// set position in the array too be able to create unique id later
					layerInfo.pos = pos;

					// get list of fields to query
					strField = '';
					while (fieldsLen--) {
						strField += fields[fieldsLen].data + ',';
					}

					// add the objectid
					strField += 'OBJECTID';

					if (type === 4) {
						// datatable (dynamic layer, need layer index to select one layer in the dynamic service)
						urlFull = url + layerIndex + '/query?where=OBJECTID+>+0&outFields=' + strField + '&dirty=' + (new Date()).getTime();
						gisDG.getData(urlFull, layer, _self.createTab);

						// popup
						if (popup.enable) {
							gisDG.createIdTask(url, layerIndex, _self.returnIdTask);

							// add title and layer name alias to a lookup table for popups
							lookPopups.push([popup.layeralias, layer.title]);
						}
					} else if (type === 5) {
						// datatable (feature layer)
						urlFull = url + '/query?where=OBJECTID+>+0&outFields=' + strField + '&dirty=' + (new Date()).getTime();
						gisDG.getData(urlFull, layer, _self.createTab);

						// popup (remove layer index)
						if (popup.enable) {
							url = url.substring(0, url.indexOf('MapServer/') + 10);
							gisDG.createIdTask(url, layerIndex, _self.returnIdTask);

							// add title and layer name alias to a lookup table for popups
							lookPopups.push([popup.layeralias, layer.title]);
						}
					}
				};

				_self.removeTab = function(id) {
					$viz('[id=' + id + ']').remove();
					$datatab.tabs('option', 'active', 0);
					$datatab.tabs('refresh');
				};

				_self.createTab = function(data) {
					// get layer info from first element
					var item = data[0],
						layer = item.layer,
						pos = layer.layerinfo.pos;

					// add layer info to a global variable to retrieve later
					arrLayerInfo[pos] = layer;
					delete item.layer;

					// add the tab and controls (select all, zoom selected and clear zoom)
					$datatabUl.append('<li><a href="#tabs-' + mapid + '-' + pos + '" id="' + item.layerid + '">' + layer.title + '</a></li>');
					$datatab.append('<div id="tabs-' + mapid + '-' + pos + '" class="gcviz-datagrid-tab">' +
									'<table id="table-' + mapid + '-' + pos + '" class="gcviz-datatable display">' +
									'</table></div>');

					// increment table and innerTable for the outside class function
					table += 1;
					innerTable = table;

					// create datatable
					_self.createTable(data, layer, pos);
				};

				_self.createTable = function(data, layer, pos) {
					var dataTB, fields,
						deferRender = false,
						link = false,
						searchInd = 1,
						$table = $viz('#table-' + mapid + '-' + pos),
						dom = 'irtp';

					// check if we need to add a columns to open/close link info
					if (typeof data[0].link !== 'undefined') {
						link = true;
						searchInd = 2;
					}

					// if there is too much data on the page we need to use defer render to speed up the process
					// if more then 1000 add paging
					if (data.length > 1000) {
						deferRender = true;
					}

					if (layer.globalsearch) {
						dom = 'ifrtp';
					}

					// create fields
					fields = _self.createFields(layer, link);

					// we need to define dom because we cant move the info part after the table is created
					// we set search always to true and hide it later beacause if set it to false filter searc is disable.
					// paging always true and hide later because if we say paging false table doesnt load.
					dataTB = $table.DataTable({
						'data': data,
						'dom': dom,
						'deferRender': deferRender,
						'autoWidth': false,
						'scrollY': 400,
						'scrollX': true,
						'pageLength': 1000,
						'scrollCollapse': true,
						'processing': true,
						'lengthChange': false,
						'pagingType': 'simple_numbers',
						'columns': fields,
						'initComplete': function(inTable) {
							var $elemFilter, $elemCSV,
								idTable = inTable.sTableId,
								idxTable = idTable.split('-'),
								id = idxTable[idxTable.length - 1],
								$info = $viz('#' + idTable + '_info'),
								columns = inTable.aoColumns;

							// add the clear filter button and class on label
							$info.after('<button id="selFeat-' + id + '" class="gcviz-dg-selfeat gcviz-dg-pad"></button>');
							$elemFilter = $viz('.gcviz-dg-selfeat');
							gcvizFunc.addTooltip($elemFilter, { content: _self.lblSelectFeatures });

							// add the clear filter button and class on label
							$info.after('<button id="clearfilter-' + id + '" class="gcviz-dg-filterclear gcviz-dg-pad"></button>');
							$elemFilter = $viz('.gcviz-dg-filterclear');
							gcvizFunc.addTooltip($elemFilter, { content: _self.lblClearFilters });

							// add export csv button
							$info.after('<button id="exportcsv-' + id +'" class="gcviz-dg-exportcsv gcviz-dg-pad"></button>');
							$elemCSV = $viz('.gcviz-dg-exportcsv');
							gcvizFunc.addTooltip($elemCSV, { content: _self.lblExportTableCSV });

							// add a select all checkbox and class on label
							$info.after('<div id="gcviz-dg-sel' + mapid + id + '" class="gcviz-inline"><input type="checkbox" class="gcviz-dg-selall gcviz-dg-pad" id="cb_seletAllFeat-' + id + '">' +
										'<label for="cb_seletAllFeat" class="form-checkbox gcviz-dg-lblselall">' + _self.lblSelectAll + '</label></div>');

							// if defer render is false remove page
							if (!deferRender) {
								// no page, set visibility hidden
								$viz('#table-' + mapid + '-' + id + '_paginate').css('visibility', 'hidden');
							}

							// setup - add a text input to each header cell (for search capabilities) is searchable = true
							// for the first column add zoom to selected.
							$viz('#' + idTable + '_wrapper .dataTables_scrollHead th').each(gcvizFunc.closureFunc(function(id, columns, colIdx) {
								var elem, valueType,
									column = columns[colIdx];

								if (colIdx === 0) {
									// add zoom to selected
									elem = $viz(this).append('<button id=zoomsel-' + id + '" class="gcviz-dg-zoomsel"></button>');
									gcvizFunc.addTooltip(elem, { content: _self.lblZoomSelect });
								} else if (column.bSearchable) {
									valueType = column.type.value;

									if (valueType === 'string') {
										// add string filter
										$viz(this).append('<input type="text" class="gcviz-dg-search gcviz-dg-searchstr" placeholder="' + _self.search + ' ' + this.innerHTML + '"></text>');
									} else if (valueType === 'number') {
										// add numeric filter
										$viz(this).append('<div><input type="text" class="gcviz-dg-search gcviz-dg-searchnum" placeholder="Min"></text>' +
															'<input type="text" class="gcviz-dg-search gcviz-dg-searchnum" placeholder="Max"></text></div>');
									}
								}
							}, id, columns));

							// call finish init with the position of the table in the array
							_self.finishInit(id);
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
							// Set the highlight state and checkbox
							var val = data.gcvizcheck;
							row.getElementsByClassName('gcviz-dg-select')[0].checked = val;
							_self.highlightRow(row, val);
						},
						createdRow: function(row, data) {
							// add id on the row instead of in a columns. We have to do this because we cant hide the column
							// it creates display problems with IE
							row.id = data.gcvizid;
						}
					});

					// if there is a link, set the title, sub title and fields value to the column header
					if (link) {
						var linkCol = $viz(dataTB.column(1).header());
						linkCol.attr('gcviz-title', layer.linktable.title);
						linkCol.attr('gcviz-subtitle', layer.linktable.subtitle);
						linkCol.attr('gcviz-fields', $viz.map(layer.linktable.fields, function(value) {
							return '{"' + value.data + '":"' + value.title + '"}';
						}));
					}

					// apply the search by field
					dataTB.columns().eq(0).each(gcvizFunc.closureFunc(function(fields, colIdx) {
						var fieldValue = fields[colIdx].type.value;

						if (colIdx === 0) {
							$viz.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
								if (activeTable !== -1) {
									// even if we modify data in datatable, it is not modified in the callback event
									// we need to get the real data from settings.
									return settings.aoData[dataIndex]._aData.gcvizcheck;
								} else {
									return true;
								}
							});
						} else if (fieldValue === 'string') {
							$viz('input', dataTB.column(colIdx).header()).on('change', function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing'),
									value = this.value;
								$process.css('display', 'block');
								setTimeout(gcvizFunc.closureFunc(function(value) {
									dataTB.column(colIdx).search(value).draw();
									$process.css('display', 'none');
								}, value), 250);
							});
						} else if (fieldValue === 'number') {
							var inputs = $viz('input', dataTB.column(colIdx).header());

							// add the range filter search
							$viz.fn.dataTable.ext.search.push(gcvizFunc.closureFunc(function(inputs, settings, data) {
								var flag = false,
									min = parseFloat(inputs[0].value, 10),
									max = parseFloat(inputs[1].value, 10),
									val = parseFloat(data[colIdx]) || 0; // use data for the the column

								if ((isNaN(min) && isNaN(max)) ||
									(isNaN(min) && val <= max) ||
									(min <= val && isNaN(max)) ||
									(min <= val && val <= max)) {
									flag = true;
								}
								return flag;
							}, inputs));

							$viz('input', dataTB.column(colIdx).header()).on('change', function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing');
								$process.css('display', 'block');
								setTimeout(function() {
									dataTB.draw();
									$process.css('display', 'none');
								}, 250);
							});
						}
					}, fields));

					// FIXED COLUMNS
					// we cant use fixed column because of 2 main reasons. First it is not WCAG. When we tab, there is
					// hidden object (the checkbox and button under the freeze columns). Second, it is really hard to make
					// it work on 2 tables on different tab. If they are both on the same page it is ok. I use some
					// workaround to be able to solve this like reinitialze on tab active. but another problem always
					// arise (the redraw made the selection disapear)!
					//new $viz.fn.dataTable.FixedColumns($viz('#table-' + mapid + '-' + table), { leftColumns: 2 });

					// order the first row after select and zoom by default to remove the arrow on select column
					dataTB.order([searchInd, 'asc']).draw();

					// aply event to enable/disable select all option if selection is less then 1000
					dataTB.on('search.dt', function() {
						var len = dataTB.rows({ filter: 'applied' }).data().length,
							$select = $viz('#gcviz-dg-sel' + mapid + '0');

						if (len <= 1000) {
							$select.removeClass('gcviz-disable');
						} else {
							$select.addClass('gcviz-disable');
						}
					});

					// add the datatable and data to a global array so we can access it later
					// reverse the data to have then in the same order as the id. It will easier to find later.
					// we set the table at the right position to ensure a good link. If not, table with item 1-1
					// can be in the third position of the array. The result is the zoom function will use the wrong
					// geometry.
					if (typeof layer.layerinfo !== 'undefined') {
						objDataTable[pos] = dataTB;
					} else {
						// table added with data toolbar
						objDataTable.push(dataTB);
					}
				};

				_self.createFields = function(layer, link) {
					var field,
						fields = layer.fields,
						lenFields = fields.length;

					// add ... to string field when length is more then 40 characters
					while (lenFields--) {
						field = fields[lenFields];

						field.render = function (data, type) {
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

					// if there is alink table, add link column
					if (link) {
						fields.unshift({
							data: null,
							className: 'gcviz-dg-link',
							title: '',
							width: '30px',
							searchable: false,
							orderable: false,
							type: {
								value: 'button'
							},
							defaultContent: ''
						});
					}

					// add select column
					fields.unshift({
						data: 'gcvizcheck',
						className: 'dt-body-center',
						title: '',
						width: '45px',
						searchable: false,
						orderable: false,
						type: 'num',
						render: function (data, type) {
									if (type === 'display') {
										return '<input type="checkbox" class="gcviz-dg-select"></input>';
									}
									return data;
								}
					});

					return fields;
				};

				_self.finishInit = function(pos) {

					_self.setEvents(pos);

					// if all tables have been initialize
					if (table === tables) {

						// set tabs and refresh accordion
						$datatab.tabs({
							heightStyle: 'auto',
							activate: function(e, ui) {
								// redraw to align header and column
								var tableId = parseInt(ui.newPanel.selector.split('-')[2], 10);
								objDataTable[tableId].draw();
							}
						});
						$datagrid.accordion('refresh');

						// check if we need to open the table by default
						if (config.expand) {
							$datagrid.accordion('option', 'active', 0);
						}

						// remove progress dialog
						_self.isWait(false);

						// enable datagrid button in footerVM
						gcvizFunc.setElemValueVM(mapid, 'footer', 'isTableReady', true);

						// stop propagation of event on search by column field
						$viz('.gcviz-dg-search').on('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
							return false;
						});

						// subscribe to the full screen event. Redraw datatable because the width
						// is modified
						gcvizFunc.subscribeTo(mapid, 'header', 'isFullscreen', function() {
							var len = objDataTable.length;

							while (len--) {
								objDataTable[len].draw();
							}
						});
					}

					// new table have been added
					if (table > tables) {
						$datatab.tabs('refresh');
						$datagrid.accordion('refresh');
					}
				};

				_self.setEvents = function(pos) {
					var $table = $viz('#table-' + mapid + '-' + pos),
						$tabs = $viz('#tabs-' + mapid + '-' + pos);

					// set checkbox event
					$table.on('change', '.gcviz-dg-select', function(e) {
						// select or unselect feature on map
						var target = e.target,
							info = _self.getInfo(target, 'control');
						_self.select(target, info);
					});

					// set select/unselect all event
					$tabs.on('change', '.gcviz-dg-selall', function(e) {
						// select or unselect all features
						var target = e.target;
						_self.selectAll(target);
					});

					// set zoom selected event
					$tabs.on('click', '.gcviz-dg-zoomsel', function(e) {
						// zoom to features
						var target = e.target;
						_self.zoomSelect(target);
					});

					// export csv
					$tabs.on('click', '.gcviz-dg-exportcsv', function(e) {
						var id = parseInt(e.target.id.split('-')[1], 10),
							table = objDataTable[id],
							filterRows = table.rows({ filter: 'applied' }).data().toArray();
						_self.exportCSV(filterRows);
					});

					// set clear filters event
					$tabs.on('click', '.gcviz-dg-filterclear', function(e) {
						var target = e.target;
						_self.clearFilter(target);
					});

					// set select item on map event
					$tabs.on('click', '.gcviz-dg-selfeat', function(e) {
						// set draw box cursor
						$container.css('cursor', 'zoom-in');

						// close mneu
						$menu.accordion('option', 'active', false);

						// set active table
						activeTable = e.target.id.split('-')[1];

						// remove popup click event if it is there to avoid conflict then
						// call graphic class to draw on map.
						gisDG.removeEvtPop();
						gisGraphic.drawBox(mymap, _self.selExtent);

						// focus the map
						gcvizFunc.focusMap(mymap, true);
					});

					// set opening and closing details link info event
					// https://datatables.net/examples/api/row_details.html
					$table.on('click', 'td.gcviz-dg-link', function() {
						var col,
							tr = $viz(this).closest('tr'),
							layer = parseInt(tr[0].id.split('-')[0], 10),
							row = objDataTable[layer].row(tr);

						if (row.child.isShown()) {
							// close row
							row.child.hide();
							tr.removeClass('shown');
						} else {
							// open row
							col = $viz(this).closest('table').find('.gcviz-dg-link');
							row.child(_self.formatLink(row.data(), col)).show();
							tr.addClass('shown');
						}

						event.preventDefault();
						event.stopPropagation();
						return false;
					});

					// set click and double click on row
					// code for this section as been taken from the first answer
					// http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
					$table.on('click', 'tr', function(e) {
						var info, checkbox,
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
									checkbox = $viz(target.parentNode).find('.gcviz-dg-select')[0];

									// get the id from the table
									info = _self.getInfo(target, 'row');

									// select or unselect feature on map
									// check or uncheck select then select feature on map
									if (checkbox.checked) {
										checkbox.checked = false;
									} else {
										checkbox.checked = true;
									}
									_self.select(checkbox, info);

									// after action performed, reset counter
									clicks = 0;
								}, delay);
							} else {
								// prevent single-click action
								clearTimeout(timer);

								// perform double-click action
								// get the id from the table
								info = _self.getInfo(target, 'row');

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

				// formatting function for row details (link info)
				_self.formatLink = function(data, col) {
					// data is the original data object for the row
					var attrNames, attrValues, lenFields,
						link, fieldName,
						i = 0,
						node = '',
						title = col.attr('gcviz-title'),
						subtitle = col.attr('gcviz-subtitle'),
						fields = col.attr('gcviz-fields').split(','),
						links = data.link,
						lenLink = links.length;

					// add title and subtitle then start table
					node += '<span class="gcviz-dg-linktitle">' + title + '</span>' +
							'<span class="gcviz-dg-linksubtitle">' + subtitle + '</span>' +
							'<table class="gcviz-dg-linktable"><thead><tr role="row">';

					// get fields name from data then create header (reverse to have in the right order)
					attrNames = $viz.map(links[0], function(value, index) {
						return [index];
					}).reverse();

					lenFields = Object.keys(attrNames).length;
					while (i !== lenFields) {
						// get the title to put for the field and create node
						fieldName = JSON.parse(fields[i])[attrNames[i]];
						node += '<th class="dt-body-center sorting_disabled" rowspan="1" colspan="1" aria-label="' + fieldName +
									'" title="' + fieldName + '">' + fieldName + '</th>';
						i++;
					}
					node += '</tr></thead><tbody>';

					// loop trought item and add them to table
					while (lenLink--) {
						// get the feature attribute names and values
						link = links[lenLink];

						attrValues = $viz.map(link, function(value) {
							return [value];
						});

						lenFields = Object.keys(attrNames).length;
						node += '<tr role="row">';
						while (lenFields--) {
							node += '<td>' + attrValues[lenFields] + '</td>';
						}
						node += '</tr>';
					}

					// close table
					node += '</tbody></table>';

					return node;
				};

				_self.getInfo = function(target, type) {
					var objInfo, str, info;

					if (type === 'row') {
						str = target.parentElement.id;
					} else if (type === 'control') {
						str = target.parentElement.parentElement.id;
					}

					info = str.split('-');

					// set table number and feature number
					objInfo = {
						table: parseInt(info[0], 10),
						feat: parseInt(info[1], 10)
					};

					return objInfo;
				};

				_self.select = function(checkbox, info) {
					var feat = objDataTable[info.table].data()[info.feat],
						row = $viz(checkbox).closest('tr')[0],
						check = checkbox.checked;

					// check or uncheck select checkbox
					// get the geometry then call gisDatagrid to select feature on map (create graphic)
					// or unselect the feature (remove graphic)
					feat.gcvizcheck = check;
					_self.highlightRow(row, check);
					if (checkbox.checked) {
						gisDG.selectFeature(feat.geometry, info);
					} else {
						gisDG.unselectFeature('sel' + '-' + info.table + '-' + info.feat);
					}
				};

				_self.selectAll = function(target) {
					var row, rows, len, tableId,
						i = 0,
						info = { },
						val = target.checked;

					// it comes from the checkbox, we grab the table id (we will need it later)
					tableId = parseInt(target.id.split('-')[1], 10);
					info.table = tableId;

					rows = objDataTable[tableId].rows({ filter: 'applied' }).data();
					len = rows.length;
					while (i !== len) {
						row = rows[i];
						row.gcvizcheck = val;
						info.feat = parseInt(row.gcvizid.split('-')[1], 10);

						if (val) {
							gisDG.selectFeature(row.geometry, info);
						} else {
							gisDG.unselectFeature('sel' + '-' + tableId + '-' + info.feat);
						}
						i++;
					}

					objDataTable[tableId].draw();
				};

				_self.zoom = function(info) {
					// get feature geometry, then call gisDatagrid to create graphic and zoom
					var geom = [objDataTable[info.table].data()[info.feat].geometry];
					gisDG.zoomFeatures(geom);
				};

				_self.zoomSelect = function(target) {
					var feat,
						i = 0,
						tableId = parseInt(target.id.split('-')[1], 10),
						data = objDataTable[tableId].data(),
						len = data.length,
						features = [];

					// loop trought all the data for this table and keep all the features
					// selected
					while (i !== len) {
						feat = data[i];

						if (feat.gcvizcheck) {
							features.push(feat.geometry);
						}
						i++;
					}

					// if there is 1 feature or more, call gisDatagrid to zoom to extent
					// of selection.
					if (features.length > 0) {
						gisDG.zoomFeatures(features);
					}
				};

				_self.exportCSV = function(data) {
					var row, line, fieldsLen, j,
						i = 0,
						gcvizInd = 0,
						fields = [],
						header = '',
						output = '',
						rtnCarr = String.fromCharCode(13),
						dataLen = data.length;

					// get the row title
					row = data[0];
					for (var field in row) {
						if (row.hasOwnProperty(field)) {
							// if field value is gcvizid, stop the for we are now in the internal field
							if (field !== 'gcvizid') {
								fields.unshift(field);
								header = '"' + field + '",' + header;
								gcvizInd++;
							} else {
								break;
							}
						}
					}
					output = header.slice(0, -1) + rtnCarr;

					// loop trough the data
					while (i !== dataLen) {
						fieldsLen = fields.length;
						row = data[i];
						line = '';
						j = 0;

						while (j !== fieldsLen) {
							line += '"' + row[fields[j]] + '",';
							j++;
						}
						output += line.slice(0, -1) + rtnCarr;
						i++;
					}

					$viz.generateFile({
						filename	: 'exportCSV.csv',
						content		: output,
						script		: config.urldownload
					});
				};

				_self.clearFilter = function(target) {
					var $elems = $viz(target.parentElement.parentElement).find('.gcviz-dg-search'),
						$process = $viz('.dataTables_processing'),
						id = parseInt(target.id.split('-')[1], 10);

					// reset value then trigger a "change" event. Put the draw in
					// a timeout if not, the processing will not be shown
					$process.css( 'display', 'block' );
					$elems.val('');
					setTimeout(function() {
						activeTable = -1;
						objDataTable[id].search('').columns().search('').draw();
						$process.css('display', 'none');
					}, 250);
				};

				_self.selExtent = function(geometry) {
					var info, url;

					// remove draw box cursor
					$container.css('cursor', '');

					// pup back popup click event
					gisDG.addEvtPop();
					if (typeof geometry !== 'undefined') {
						// get layerinfo
						info = arrLayerInfo[activeTable];
						url = mymap.getLayer(info.layerinfo.id).url + info.layerinfo.index;
						gisDG.getSelection(url, mymap.vWkid, geometry, _self.setSelection);
					}

					// open mneu
					$menu.accordion('option', 'active', 0);
				};

				_self.setSelection = function(features) {
					var dataId, item,
						info = { },
						i = 0,
						tableId = parseInt(activeTable, 10),
						data = objDataTable[tableId].data(),
						lenData = data.length,
						lenFeats = features.length,
						featIds = new Array(lenFeats);




						// reset value then trigger a "change" event. Put the draw in
						// a timeout if not, the processing will not be shown
var $elems = $viz('.gcviz-dg-search');
$elems.val('');
objDataTable[tableId].search('').columns().search('').draw();


					// create an array with all the objectid to select
					while (i !== lenFeats) {
						featIds[i] = features[i].attributes.OBJECTID;
						i++;
					}

					// loop data to see if we need to select
					i = 0;
					info.table = tableId;
					while (i !== lenData) {
						item = data[i];
						dataId = item.OBJECTID;

						if (featIds.indexOf(dataId) !== -1) {
							item.gcvizcheck = true;
							info.feat = i;
							gisDG.selectFeature(item.geometry, info);
						} else if (item.gcvizcheck) {
							item.gcvizcheck = false;
							gisDG.unselectFeature('sel' + '-' + tableId + '-' + i);
						}
						i++;
					}

					// trigger filter with draw
					objDataTable[tableId].draw();
				};

				_self.highlightRow = function(row, check) {
					// set class to row if selected. We also have to set it to column with
					// sorting class. If not, the color is not applied.
					if (check) {
						row.className += ' gcviz-backYellow';
					} else {
						row.className = row.className.replace(/ gcviz-backYellow/g, '');
					}
				};

				// keep _self outiside initialize to be able to call it from outside
				// in this case we will need it to add a new tab for csv data or remove one
				innerAddTab = _self.createTab;
				innerRemoveTab = _self.removeTab;

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
								_self.layerNameHolder.push(gcvizFunc.getLookup(lookPopups, feature.layerName));
							}
						}
					}

					// disable next button if less then 2 element
					if (allIdFeatures.length < 2) {
						_self.isEnableNext(false);
					}

					// make sure array of layer is unique for select
					if (isFeatures) {
						_self.layerName(ko.utils.arrayGetDistinctValues(_self.layerNameHolder()));
						_self.changeSelectLayer();
					}
				};

				_self.displayFeature = function(currentFeature) {
					var info, linkInfo,
						attrNames, attrValues,
						field, fields, lenFields,
						layer, popups,
						staticFields = 1,
						linkNode = '',
						layerName = gcvizFunc.getLookup(lookPopups, currentFeature.layerName),
						feature = currentFeature.feature,
						attributes = feature.attributes,
						layers = config.layers,
						len = layers.length;

					// display the feature attributes in the popup
					while (len--) {
						layer = layers[len];
						popups = layer.popups;

						if (popups.enable && layerName === layer.title) {

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

							// check if there is a link table and get data
							linkInfo = layer.linktable;
							if (linkInfo.enable) {
								// set to 2 because the 2 last field are for select and link 
								staticFields = 2;

								linkNode = _self.getLinkNode(linkInfo, layer.layerinfo.id, attributes.OBJECTID);
							}

							// the last field is for select
							while (lenFields >= staticFields) {
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
							$popContent.html(info + linkNode);
						}
					}

					// highlight the feature
					gisDG.selectFeaturePop(feature.geometry);
				};

				_self.getLinkNode = function(linkInfo, layerId, objectID) {
					var links, link,
						linkAttrNames, linkAttrValues,
						lenLink, lenFields,
						fieldName,
						fieldsInfo = linkInfo.fields.reverse(),
						node = '';

					// get the feature attribute names and values
					links = gisDG.getRelRecords(layerId, objectID);
					linkAttrNames = $viz.map(links[0], function(value, index) {
						return [index];
					});

					// create table header	
					node = '<span class="gcviz-dg-linktitle">' + linkInfo.title + '</span>' +
							'<span class="gcviz-dg-linksubtitle">' + linkInfo.subtitle + '</span>' +
							'<table class="gcviz-dg-linktable"><thead><tr role="row">';

					lenLink = linkAttrNames.length;
					while (lenLink--) {
						// get the title to put for the field and create node
						fieldName = fieldsInfo[lenLink].title;
						node += '<th class="dt-body-center sorting_disabled" rowspan="1" colspan="1" aria-label="' + fieldName +
								'" title="' + fieldName + '">' + fieldName + '</th>';
					}
					node += '</tr></thead><tbody>';

					// loop trought item and add them to table
					lenLink = links.length;
					while (lenLink--) {
						// get the feature attribute names and values
						link = links[lenLink];

						linkAttrValues = $viz.map(link, function(value) {
							return [value];
						});

						lenFields = Object.keys(linkAttrValues).length;
						node += '<tr role="row">';
						while (lenFields--) {
							node += '<td>' + linkAttrValues[lenFields] + '</td>';
						}
						node += '</tr>';
					}

					// close table
					node += '</tbody></table>';

					return node;
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

							if (gcvizFunc.getLookup(lookPopups, feat.layerName) === selLayer) {
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
					} else {
						_self.isEnableNext(false);
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

				_self.setPopupSize = function(event, ui) {
					var height = ui.size.height - 140; // 140 is the height of header

					// do not let the user set to height to low. For width, we dont have
					// to do it because minWidth works.
					if (height < 200) {
						height = 200;
					}

					$popContent.css('height', height + 'px');
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
				table = innerTable;

			// setup fields
			while (lenField--) {
				// add the filed only if it is not a internal field
				field = fieldsOri[lenField];
				if (field.name.indexOf('OBJECTID') === -1) {
					delete field.type;
					delete field.render;
					delete field.editable;
					delete field.domain;
					field.title = field.alias;
					delete field.alias;
					field.data = field.name;
					delete field.name;
					field.type = {
						value: 'string'
					};

					fields.push(field);
				}
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
			layer.layerinfo = { 'pos': table };
			datas[0].layer = layer;

			// call the inner create tab function (if datagrid is enable)
			if (typeof innerAddTab !== 'undefined') {
				innerAddTab(datas);
			}
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
