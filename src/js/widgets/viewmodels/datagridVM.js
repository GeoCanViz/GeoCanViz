/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Datagrid view model widget
 */
/* global $: false */
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
			subscribeIsTableReady,
			addTab,
			addRestTab,
			removeTab,
			vm = {};

		initialize = function($mapElem, mapid, config) {

			// data model				
			var datagridViewModel = function($mapElem, mapid, config) {
				var _self = this,
					mapVM,
					objDataTable, menuState,
					drawTool = [],
					triggerTableId = [],
					activeTableId = -1,
					delay = 400, clicks = 0, timer = null,
					arrLayerInfo = { },
					lookPopups = [],
					tables = config.layers.length,
					selectIdFeatures = [],
					allIdFeatures = [],
					currFeatIndex = 0,
					totalFeatures = 0,
					tableReady = false,
					$datagrid = $viz('#gcviz-datagrid' + mapid),
					$datatab = $viz('#gcviz-datatab' + mapid),
					$datatabUl = $datatab.find('ul'),
					$popContent = $viz('#gcviz-popup-content' + mapid),
					$container = $viz('#' + mapid + '_holder_layers'),
					$menu = $viz('#gcviz-menu' + mapid);

				// there is a problem with the define. The gcviz-vm-map is not able to be set.
				// We set the reference to gcviz-vm-map (hard way)
				require(['gcviz-vm-map'], function(vmMap) {
					mapVM = vmMap;
				});

				// viewmodel mapid to be access in tooltip and wcag custom binding
				_self.mapid = mapid;

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
				_self.tpClearFilters = i18n.getDict('%datagrid-tpclearfilters');
				_self.tpExportSelCSV = i18n.getDict('%datagrid-tpexportselcsv');
				_self.tpExportTableCSV = i18n.getDict('%datagrid-tpexporttblcsv');
				_self.tpSelectFeatures = i18n.getDict('%datagrid-tpselfeat');
				_self.tpApplyFilters = i18n.getDict('%datagrid-tpapplyfilters');
				_self.lblClearFilters = i18n.getDict('%datagrid-lblclearfilters');
				_self.lblExportTableCSV = i18n.getDict('%datagrid-lblexporttblcsv');
				_self.lblSelectFeatures = i18n.getDict('%datagrid-lblselfeat');
				_self.lblApplyfilters = i18n.getDict('%datagrid-lblapplyfilters');

				// text for popup
				_self.lblSelectAll = i18n.getDict('%datagrid-selectall');
				_self.lblZoomSelect = i18n.getDict('%datagrid-zoomselect');
				_self.popupDialogTitle = i18n.getDict('%datagrid-poptitle');

				// text for progress dialog
				_self.progressTitle = i18n.getDict('%datagrid-protitle');
				_self.progressDesc = i18n.getDict('%datagrid-prodesc');

				// text for export dialog
				_self.exportTitle = i18n.getDict('%datagrid-exptitle');
				_self.exportDesc = i18n.getDict('%datagrid-expdesc');

				// WCAG
				_self.WCAGTitle = i18n.getDict('%wcag-title');
				_self.lblWCAGx = i18n.getDict('%wcag-xlong');
				_self.lblWCAGy = i18n.getDict('%wcag-ylat');
				_self.lblWCAGmsgx = i18n.getDict('%wcag-msgx');
				_self.lblWCAGmsgy = i18n.getDict('%wcag-msgy');
				_self.xValueMin = ko.observable(140).extend({ numeric: { precision: 3, validation: { min: 40, max: 150 } } });
				_self.yValueMin = ko.observable(40).extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.xValueMax = ko.observable(50).extend({ numeric: { precision: 3, validation: { min: 40, max: 150 } } });
				_self.yValueMax = ko.observable(80).extend({ numeric: { precision: 3, validation: { min: 40, max: 80 } } });
				_self.isWCAG = ko.observable(false);
				_self.isDialogWCAG = ko.observable(false);

				// observable for popup
				_self.layerNameHolder = ko.observableArray([]);
				_self.layerName = ko.observableArray([_self.lblAllLayer]); // create with value so the binding is not fire when we add the value
				_self.featLayerName = ko.observable('');
				_self.selectedLayer = ko.observable(0);
				_self.isPopupDialogOpen = ko.observable(false);
				_self.isEnablePrevious = ko.observable(false);
				_self.isEnableNext = ko.observable(false);
				_self.popupCounter = ko.observable('');

				// variable to start the progress dialog and notify all tables are created
				_self.isWait = ko.observable(false);
				_self.isTableReady = ko.observable(false);

				// variable to start export csv message
				_self.isExport = ko.observable(false);

				_self.table = 0;

				_self.init = function() {
					// init accordion and hide header
					$datagrid.accordion({
						collapsible: true,
						active: false,
						activate: function() {
							// redraw to align header and column
							if (tables) {
								objDataTable[0].draw();
							}
						}
					});
					$viz('.ui-accordion-header').hide();

					// wait for the map to load
					mapVM.registerEvent(mapid, 'load', _self.onLoadMap);
				};

				_self.onLoadMap = function(evt) {
					var interval, intervalModal,
						layers = config.layers,
						lenLayers = layers.length,
						i = 0;

					// intialize gisdatagrid. It will create the grahic layer for selection
					gisDG.initialize(evt.map);

					// initialize array length to position the data at the right place later.
					// if a table initialize slower then next one, position can be messed up.
					objDataTable = new Array(lenLayers);

					// if there is no tables, set is ready to true.
					if (lenLayers === 0) {
						_self.isTableReady(true);
					} else {
						// start progress dialog. Put in a timer if not, the variable is not initialize
						intervalModal = setInterval(function() {
							// check if identity manager window is open. If so wait until finish before show modal
							var id = $viz('.esriSignInDialog');

							// if table are created, do not show modal
							if (tableReady) {
								_self.isWait(false);
								clearInterval(intervalModal);
							} else if (id.length === 0 || id[0].style.display === 'none') { // if no id or id is display, show modal
								_self.isWait(true);
							} else {
								_self.isWait(false);
							}
						}, 1000);

						// loop all layers inside an interval to make sure there is no mess up with the index
						// When they start at the same time, index can be switch to another table and the geometries
						// doesn't match the table anymore.
						interval = setInterval(function() {
							_self.getData(layers[i], i);
							i++;

							if (i === lenLayers) {
								clearInterval(interval);
							}
						}, 500);
					}
				};

				_self.focusTables = function() {
					var element = document.getElementById('gcviz-datatab' + mapid);

					element.focus();
					if (scroll) {
						element.scrollIntoView();
					}
				};

				_self.openWait = function(event) {
					// remove close icon to have a real modal window.
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
					var urlFull, strField, field, fieldType,
						layerInfo = layer.layerinfo,
						layerIndex = layerInfo.index,
						type = layerInfo.type,
						id = layerInfo.id,
						url = mapVM.getLayerURL(mapid, id),
						popup = layer.popups,
						fields = layer.fields,
						fieldsLen = fields.length;

					// set position in the array too be able to create unique id later
					layerInfo.pos = pos;

					// get list of fields to query
					strField = '';
					while (fieldsLen--) {
						field = fields[fieldsLen];
						fieldType = field.fieldtype;
						strField += field.data + ',';

						// add url value field if type field === url
						if (fieldType.type === 3) {
							strField += fieldType.urlfield + ',';
						}
					}

					// add the objectid (if not present)
					if (strField.indexOf('OBJECTID') === -1) {
						strField += 'OBJECTID';
					} else {
						strField = strField.slice(0, -1);
					}

					if (type === 4) {
						// datatable (dynamic layer, need layer index to select one layer in the dynamic service)
						urlFull = url + layerIndex + '/query?where=OBJECTID+>+0&outFields=' + strField + '&dirty=' + (new Date()).getTime();
						gisDG.getData(mapid, urlFull, layer, _self.createTab);

						// popup
						if (popup.enable) {
							gisDG.createIdTask(mapid, url, layerIndex, id, 4, _self.returnIdTask);

							// add title and layer name alias to a lookup table for popups
							lookPopups.push([popup.layeralias, layer.title]);
						}
					} else if (type === 5) {
						// datatable (feature layer)
						urlFull = url + '/query?where=OBJECTID+>+0&outFields=' + strField + '&dirty=' + (new Date()).getTime();
						gisDG.getData(mapid, urlFull, layer, _self.createTab);

						// popup (remove layer index)
						if (popup.enable) {
							url = url.substring(0, url.indexOf('MapServer/') + 10);
							gisDG.createIdTask(mapid, url, layerIndex, id, 5, _self.returnIdTask);

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

					// increment table
					_self.table += 1;

					// create datatable
					_self.createTable(data, layer, pos);
				};

				_self.createTable = function(data, layer, pos) {
					var dataTB, fields,
						deferRender = false,
						link = false,
						searchInd = 1,
						$table = $('#table-' + mapid + '-' + pos),
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
						'oScroller': {},
						'deferRender': deferRender,
						'orderClasses': false,
						'order': [searchInd, 'asc'], // order the first row after select and zoom by default to remove the arrow on select column
						'autoWidth': false,
						'scrollY': 400,
						'scrollX': true,
						'pageLength': 50, // dot set more then 100. If there is many fields it will slow down the entire browser.
						'scrollCollapse': true,
						'processing': true,
						'lengthChange': false,
						'pagingType': 'simple_numbers',
						'columns': fields,
						'initComplete': function(inTable) {
							_self.initCompl(inTable, deferRender);
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
							return '{ "' + value.data + '":"' + value.title + '" }';
						}));
					}

					// add search by column
					_self.addSearcFields(dataTB, fields);

					// FIXED COLUMNS
					// we cant use fixed column because of 2 main reasons. First it is not WCAG. When we tab, there is
					// hidden object (the checkbox and button under the freeze columns). Second, it is really hard to make
					// it work on 2 tables on different tab. If they are both on the same page it is ok. I use some
					// workaround to be able to solve this like reinitialze on tab active. but another problem always
					// arise (the redraw made the selection disapear)!
					//new $viz.fn.dataTable.FixedColumns($viz('#table-' + mapid + '-' + table), { leftColumns: 2 });

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

				_self.initCompl = function(inTable) {
					var $elemFilter, $elemCSV, $tools,
						idTable = inTable.sTableId,
						idxTable = idTable.split('-'),
						id = idxTable[idxTable.length - 1],
						$info = $viz('#' + idTable + '_info'),
						columns = inTable.aoColumns,
						type = arrLayerInfo[parseInt(id, 10)].layerinfo.type;

					// add the tools holder and link to it
					$info.after('<div class="gcviz-dg-tools"></div>');
					$tools = $viz($info[0].parentElement.getElementsByClassName('gcviz-dg-tools'));

					// filter on map for layer not type 4 or 5
					// FeatureLayer: layer created by value (from a feature collection) does not support definition expressions and time definitions
					if (type === 4 || type === 5) {
						// add the show selection on map button
						$tools.append('<button id="applyfilter-' + id + '" class="gcviz-dg-applyfilter gcviz-dg-pad"></button><label class="gcviz-label" for="applyfilter-' + id + '">' + _self.lblApplyfilters + '</label>');
						$elemFilter = $viz('.gcviz-dg-applyfilter');
						gcvizFunc.addTooltip($elemFilter, { content: _self.tpApplyFilters });
					}

					// add the clear filter button
					$tools.append('<button id="clearfilter-' + id + '" tableid="' + idTable + '" class="gcviz-dg-filterclear gcviz-dg-pad"></button><label class="gcviz-label" for="clearfilter-' + id + '">' + _self.lblClearFilters + '</label>');
					$elemFilter = $viz('.gcviz-dg-filterclear');
					gcvizFunc.addTooltip($elemFilter, { content: _self.tpClearFilters });

					// disable spatial for layer not type 4 or 5
					// FeatureLayer: layer created by value (from a feature collection) does not support definition expressions and time definitions
					if (type === 4 || type === 5) {
						$tools.append('<button id="selFeat-' + id + '" class="gcviz-dg-selfeat gcviz-dg-pad"></button><label class="gcviz-label" for="selFeat-' + id + '">' + _self.lblSelectFeatures + '</label>');
						$elemFilter = $viz('.gcviz-dg-selfeat');
						gcvizFunc.addTooltip($elemFilter, { content: _self.tpSelectFeatures });
					}

					// add export csv button
					$tools.append('<button id="exportcsv-' + id +'" class="gcviz-dg-exportcsv gcviz-dg-pad"></button><label class="gcviz-label" for="exportcsv-' + id + '">' + _self.lblExportTableCSV + '</label>');
					$elemCSV = $viz('.gcviz-dg-exportcsv');
					gcvizFunc.addTooltip($elemCSV, { content: _self.tpExportTableCSV });

					// setup - add a text input to each header cell (for search capabilities) is searchable = true
					// for the first column add zoom to selected.
					$viz('#' + idTable + '_wrapper .dataTables_scrollHead th').each(gcvizFunc.closureFunc(function(id, columns, colIdx) {
						var elem, valueType,
							column = columns[colIdx];

						if (colIdx === 0) {
							// add zoom to selected
							elem = $viz(this).append('<label class="gcviz-gd-zoomlbl" for="zoomSel-' + id + '">Zoom</label><button id="zoomSel-' + id + '" class="gcviz-dg-zoomsel"></button>');
							gcvizFunc.addTooltip(elem, { content: _self.lblZoomSelect });
						} else if (column.bSearchable) {
							valueType = column.fieldtype.value;

							if (valueType === 1) {
								// add string filter
								$viz(this).append('<input type="text" class="gcviz-dg-search gcviz-dg-searchstr" gcviz-name="' + column.data + '" placeholder="' + _self.search + '"></input>');
							} else if (valueType === 2) {
								// add numeric filter
								$viz(this).append('<div><input type="text" class="gcviz-dg-search gcviz-dg-searchnum" gcviz-name="' + column.data + '" placeholder="Min"></input>' +
													'<input type="text" class="gcviz-dg-search gcviz-dg-searchnum" gcviz-name="' + column.data + '" placeholder="Max"></input></div>');
							} else if (valueType === 4) {
								// dropdowm select box
								$viz(this).append('<select class="gcviz-dg-search gcviz-dg-searchdrop" gcviz-name="' + column.data + '"><option value=""></option></select>');
							} else if (valueType === 3) {
								// date picker
								$viz(this).append('<div><input type="text" class="gcviz-dg-search gcviz-dg-searchdate" gcviz-name="' + column.data + '" placeholder="Date Min"></text>' +
													'<input type="text" class="gcviz-dg-search gcviz-dg-searchdate" gcviz-name="' + column.data + '" placeholder="Date Max"></text></div>');
							}
						}
					}, id, columns));

					// call finish init with the position of the table in the array
					_self.finishInit(id);
				};

				_self.addSearcFields = function(table, fields) {
					// apply the search by field
					table.columns().eq(0).each(gcvizFunc.closureFunc(function(fields, table, colIdx) {
						var fieldValue = fields[colIdx].fieldtype.value,
							tableId = table.settings()[0].sTableId;

						if (colIdx === 0) { // select checkbox
							$.fn.dataTable.ext.search.push(gcvizFunc.closureFunc(function(tableId, settings, data, dataIndex) {
								var dataId = settings.sTableId,
									index = dataId.split('-')[2];

								// if it is active table and spatial filter trigger, filter data. If not return all data
								if (tableId === dataId && triggerTableId[index] !== '') {
									// even if we modify data in datatable, it is not modified in the callback event
									// we need to get the real data from settings.
									return settings.aoData[dataIndex]._aData.gcvizspatial;
								} else {
									return true;
								}
								return true;
							}, tableId));
						} else if (fieldValue === 1 && fields[colIdx].bSearchable) {
							// set a debounce functiojn to apply filter only after 1 second of inactivity
							$viz('input', table.column(colIdx).header()).on('keyup', gcvizFunc.debounce(function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing'),
									val = this.value;

								$process.css('display', 'block');
								setTimeout(gcvizFunc.closureFunc(function(value) {
									// generate regex
									if (value !== '') {
										value = value.replace(/\*/g, '.*');
										value = '^' + value + '.*$';
									}

									table.column(colIdx).search(value, true, false).draw();
									$process.css('display', 'none');
								}, val), 100);
							}, 750, false));
						} else if (fieldValue === 2 && fields[colIdx].bSearchable) {
							// https://datatables.net/examples/plug-ins/range_filtering.html
							var $inputs = $viz('input', table.column(colIdx).header());

							// add the range filter search
							$.fn.dataTable.ext.search.push(gcvizFunc.closureFunc(function(inputs, tableId, settings, data) {
								var min, max, val,
									flag = false,
									dataId = settings.sTableId;

								// if it is active table filter data, if not return all data
								if (tableId === dataId) {
									min = parseFloat(inputs[0].value, 10),
									max = parseFloat(inputs[1].value, 10),
									val = parseFloat(data[colIdx]) || 0; // use data for the the column

									if ((isNaN(min) && isNaN(max)) ||
										(isNaN(min) && val <= max) ||
										(min <= val && isNaN(max)) ||
										(min <= val && val <= max)) {
										flag = true;
									}
								} else {
									flag = true;
								}

								return flag;
							}, $inputs, tableId));

							// set a debounce functiojn to apply filter only after 1 second of inactivity
							$inputs.on('keyup', gcvizFunc.debounce(function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing');

								$process.css('display', 'block');
								setTimeout(function() {
									table.draw();
									$process.css('display', 'none');
								}, 250);
							}, 750, false));

						} else if (fieldValue === 4) {
							// http://datatables.net/examples/api/multi_filter_select.html
							var $select = $viz('select', table.column(colIdx).header());

							// add values to dropdown
							table.column(colIdx).data().unique().sort().each(function(d) {
								$select.append('<option value="' + d + '">' + d + '</option>');
							});

							$select.on('change', function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing'),
									val = $.fn.dataTable.util.escapeRegex($(this).val());

								$process.css('display', 'block');
								setTimeout(function() {
									table.column(colIdx).search(val ? '^.*\\b' + val + '\\b.*$' : '', true, false).draw();
									$process.css('display', 'none');
								}, 100);
							});
						} else if (fieldValue === 3) {
							var $inputs = $viz('input', table.column(colIdx).header()),
								lang = window.langext.substring(0,2),
								opts = {
									changeMonth: true,
									changeYear: true,
									dateFormat: 'yy-mm-dd'
								};

							// set language then create date picker
							if (lang === 'fr') {
								$viz.datepicker.regional['fr'] = {
									clearText: 'Effacer', clearStatus: '',
								    closeText: 'Fermer', closeStatus: 'Fermer sans modifier',
								    prevText: '&lt;Préc', prevStatus: 'Voir le mois précédent',
								    nextText: 'Suiv&gt;', nextStatus: 'Voir le mois suivant',
								    currentText: 'Courant', currentStatus: 'Voir le mois courant',
								    monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin',
								    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
								    monthNamesShort: ['Jan','Fév','Mar','Avr','Mai','Jun',
								    'Jul','Aoû','Sep','Oct','Nov','Déc'],
								    monthStatus: 'Voir un autre mois', yearStatus: 'Voir un autre année',
								    weekHeader: 'Sm', weekStatus: '',
								    dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
								    dayNamesShort: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
								    dayNamesMin: ['Di','Lu','Ma','Me','Je','Ve','Sa'],
								    dayStatus: 'Utiliser DD comme premier jour de la semaine', dateStatus: 'Choisir le DD, MM d',
								    dateFormat: 'dd/mm/yy', firstDay: 0, 
								    initStatus: 'Choisir la date', isRTL: false};
								$viz.datepicker.setDefaults($viz.datepicker.regional[lang]);
							}
							$viz($inputs[0]).datepicker(opts);
							$viz($inputs[1]).datepicker(opts);

							// add the column index to access it from filter. We need to do this because filter
							// are global to all table and field
							$inputs.closest('th').attr('col-index', colIdx);

							// add the date range filter search
							$.fn.dataTable.ext.search.push(gcvizFunc.closureFunc(function(inputs, tableId, settings, data) {
								var min, max, val,
									isMinDate, isMaxDate, isValDate,
									flag = false,
									dataId = settings.sTableId;

								// if it is active table filter data, if not return all data
								if (tableId === dataId) {
									min = new Date(inputs[0].value),
									max = new Date(inputs[1].value),
									val = new Date(data[colIdx].substring(0, 10)), // use data for the the column
									isMinDate = !isNaN(min.getYear()),
									isMaxDate = !isNaN(max.getYear()),
									isValDate = !isNaN(val.getYear());

									// test if dates are valid and compare 
									if (!isMinDate && !isMaxDate) {
										// if no filter return true
										flag = true;
									} else if ((isMinDate || isMaxDate) && !isValDate) {
										// if dates are provided and the data is not a date, return false.
										flag = false;
									} else if (val >= min && !isMaxDate) {
										flag = true;
									} else if (!isMinDate && val <= max) {
										flag = true;
									} else if (val >= min && val <= max) {
										flag = true;
									}
								} else {
									flag = true;
								}

								return flag;
							}, $inputs, tableId));

							$inputs.on('change', function() {
								// put the draw in a timeout if not, the processing will not be shown
								var $process = $viz('.dataTables_processing');

								$process.css('display', 'block');
								setTimeout(function() {
									table.draw();
									$process.css('display', 'none');
								}, 100);
							});
						}
					}, fields, table));
				};

				_self.createFields = function(layer, link) {
					var field, typeObj,
						fields = layer.fields,
						lenFields = fields.length;

					// field value can be (field: 1, keyurl: 2, url: 3, fieldurl: 4, fieldkeyurl: 5, control: 99)
					// field type can be (string: 1, number: 2, date: 3, select: 4, image: 5, string-list: 6, image-list: 7)
					// for field, nothing special, value can be anything
					// for keyurl, (value: string, display: value to display, url: url to use with the key)
					// for url, nothing special, just display the link (value: string, image, string-list, image-list)
					// for fieldurl, (value: string, urlfield: name of the field where to get url, urlfieldalias: alias name of the field where to get url)
					// for fieldkeyurl, (value: string, string-list, image, image-list, url: url to use with the key, fieldkey: name of the field where to get url, urlfieldalias: alias name of the field where to get url)
					// for value date (informat: esri: 1, outformat: short: 1, long: 2)
					while (lenFields--) {
						field = fields[lenFields];
						typeObj = field.fieldtype;

						// if url, construct it.
						// if nothing, add ... to string field when length is more then 40 characters
						if (typeObj.type === 3) {
							field.render = gcvizFunc.closureFunc(function(typeObj, data, type, full) {
								var field,
									urlLink = full[typeObj.urlfield];

								if (urlLink !== null) {
									field = '<a href="' + urlLink + '" target="_blank">' + data + '</a>';
								} else {
									field = '<span>' + data + '</span>';
								}
								return field;
							}, typeObj);
						} else {
							field.render = function(data, type) {
								if (data !== null && typeof data !== 'undefined') {
									// remove double quote
									if (typeof data === 1) {
										data = data.replace(/"/g, '');
									}

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
					}

					// if there is a link table, add link column
					if (link) {
						fields.unshift({
							data: null,
							className: 'gcviz-dg-link',
							title: '',
							width: '30px',
							searchable: false,
							orderable: false,
							fieldtype: {
								value: 99
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
						fieldtype: {
							value: 99
						},
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
					if (_self.table >= tables) {

						// set tabs and refresh accordion
						$datatab.tabs({
							heightStyle: 'auto',
							activate: function(e, ui) {
								// redraw to align header and column
								activeTableId = parseInt(ui.newPanel[0].id.split('-')[2], 10);
								objDataTable[activeTableId].draw();

								// show spatial filter only for this table
								gisDG.showSpatialExtent(mapid, 'spatial-' + activeTableId);
							}
						});
						$datagrid.accordion('refresh');

						// set active table id the first table
						activeTableId = 0;

						// check if we need to open the table by default
						if (config.expand) {
							require(['gcviz-vm-footer'], function(footerVM) {
								footerVM.toggleDatagrid(mapid);
							});
						}

						// remove progress dialog and notify all table are created
						_self.isWait(false);
						tableReady = true;

						// enable datagrid button in footerVM
						require(['gcviz-vm-footer'], function(footerVM) {
							footerVM.notifyTableReady();
						});

						// stop propagation of event on search by column field
						$viz('.gcviz-dg-search').on('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
							return false;
						});

						// subscribe to the full screen event. Redraw datatable because the width
						// is modified
						require(['gcviz-vm-header'], function(headerVM) {
							headerVM.subscribeIsFullscreen(mapid, function() {
								var len = objDataTable.length;

								while (len--) {
									objDataTable[len].draw();
								}
							});
						});

						// notify tables are ready
						_self.isTableReady(true);
					}

					// new table have been added
					if (_self.table > tables) {
						$datatab.tabs('refresh');
						$datagrid.accordion('refresh');

						// make sure the wait window is close
						_self.isWait(false);

						// there is a problem with the define. The gcviz-vm-tbdata is not able to be set.
						// We set the reference to gcviz-vm-tbdata (hard way)
						require(['gcviz-vm-tbdata'], function(vmData) {
							vmData.notifyAdd(mapid);
						});
					}

					// increment triggerTableId
					triggerTableId.push('');
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

					// set zoom selected event
					$tabs.on('click', '.gcviz-dg-zoomsel', function(e) {
						// zoom to features
						var target = e.target;
						_self.zoomSelect(target);
					});

					// export csv
					$tabs.on('click', '.gcviz-dg-exportcsv', function() {
						var table = objDataTable[activeTableId],
							filterRows = table.rows({ filter: 'applied' }).data().toArray();
						_self.exportCSV(filterRows);
					});

					// set clear filters event
					$tabs.on('click', '.gcviz-dg-filterclear', function(e) {
						var target = e.target;
						_self.clearFilter(target);
					});

					// set select item on map event
					$tabs.on('click', '.gcviz-dg-selfeat', function() {
						// check if WCAG mode is enable, if so use dialog box instead)
						if (!_self.isWCAG()) {
							// set draw box cursor
							$container.css('cursor', 'crosshair');

							// get active menu and close it if open
							menuState = $menu.accordion('option', 'active');
							if (menuState !== false) {
								$menu.accordion('option', 'active', false);
							}

							// set event for the toolbar
							$menu.on('accordionbeforeactivate', function() {
								$menu.off();
								_self.selExtent();
							});

							// remove popup click event if it is there to avoid conflict then
							// call graphic class to draw on map.
							mapVM.removePopupEvent(mapid);

							// there is a bug when in full screen and do a zoom to select. There is an offset in y
							// so popup is not available. To resolve this, resize map.
							mapVM.resizeMap(mapid);

							drawTool = mapVM.drawBox(mapid, true, _self.selExtent);

							// focus the map
							mapVM.focusMap(mapid, true);
						} else {
							_self.isDialogWCAG(true);
						}
					});

					// set apply filters on map event
					$tabs.on('click', '.gcviz-dg-applyfilter', function(e) {
						var target = e.target;
						_self.applyFilterMap(target);
					});

					// set opening and closing details link info event
					// https://datatables.net/examples/api/row_details.html
					$table.on('click', 'td.gcviz-dg-link', function() {
						var col,
							tr = $viz(this).closest('tr'),
							row = objDataTable[activeTableId].row(tr);

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
						gisDG.selectFeature(mapid, feat.geometry, info);
					} else {
						gisDG.unselectFeature(mapid, 'sel' + '-' + info.table + '-' + info.feat);
					}
				};

				_self.selectAll = function(fields, val, graphic) {
					var row, rows, len, fieldsLen,
						i = 0,
						info = { };

					info.table = activeTableId;

					rows = objDataTable[activeTableId].rows().data();
					len = rows.length;
					while (i !== len) {
						row = rows[i];

						// loop trought fields
						fieldsLen = fields.length;
						while (fieldsLen--) {
							row[fields[fieldsLen]] = val;
						}

						// set info and select or unselect
						info.feat = parseInt(row.gcvizid.split('-')[1], 10);
						if (!val || !graphic) {
							gisDG.unselectFeature(mapid, 'sel' + '-' + activeTableId + '-' + info.feat);
						} else {
							gisDG.selectFeature(mapid, row.geometry, info);
						}
						i++;
					}

					objDataTable[activeTableId].draw();
				};

				_self.zoom = function(info) {
					// get feature geometry, then call gisDatagrid to create graphic and zoom
					var geom = [objDataTable[info.table].data()[info.feat].geometry];
					gisDG.zoomFeatures(mapid, geom);
				};

				_self.zoomSelect = function() {
					var feat,
						i = 0,
						data = objDataTable[activeTableId].rows({ filter: 'applied' }).data(),
						len = data.length,
						features = [],
						allFeatures = [];

					// loop trought all the data for this table and keep all the features
					// selected
					while (i !== len) {
						feat = data[i];

						if (feat.gcvizcheck) {
							features.push(feat.geometry);
						}

						// keep all the features so if no selection use all extent
						allFeatures.push(feat.geometry);
						i++;
					}

					// if there is 1 feature or more, call gisDatagrid to zoom to extent
					// of selection. If not, call it with all filtered features
					if (features.length > 0) {
						gisDG.zoomFeatures(mapid, features);
					} else {
						gisDG.zoomFeatures(mapid, allFeatures);
					}
				};

				_self.exportCSV = function(data) {
					var row, line, fieldsLen, j, content,
						i = 0,
						gcvizInd = 0,
						fields = [],
						header = '',
						output = '',
						rtnCarr = String.fromCharCode(13),
						dataLen = data.length;

					// show info window only there is a huge amount of data to process
					if (dataLen > 2000) {
						// show info window
						_self.isExport(true);
					}

					// get the row title
					row = data[0];
					for (var field in row) {
						if (row.hasOwnProperty(field)) {
							// skip internal field
							if (field !== 'gcvizid' && field !== 'layerid' && field !== 'geometry' && field.indexOf('OBJECTID') === -1) {
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
							content = row[fields[j]];

							// remove double quotes
							if (typeof content === 'string') {
								content = content.replace(/"/g, '');
							}

							line += '"' + content + '",';
							j++;
						}
						output += line.slice(0, -1) + rtnCarr;
						i++;
					}

					$viz.generateFile({
						filename	: 'exportCSV.csv',
						filetype		: 'text/csv',
						content		: output,
						script		: config.urldownload
					});
				};

				_self.dialogExportOk = function() {
					_self.isExport(false);
				};

				_self.clearFilter = function(target) {
					var $elems = $viz(target.parentElement.parentElement).find('.gcviz-dg-search'),
						$process = $viz('#table-' + mapid + '-' + activeTableId + '_processing'),
						index = triggerTableId.indexOf($viz(target).attr('tableid').split('-')[2]),
						infoLayer = arrLayerInfo[activeTableId].layerinfo;

					// remove table from spatial filter array.
					if (index !== -1) {
						triggerTableId[index] = '';
					}

					// remove spatial selection and selection for zoom
					_self.selectAll(['gcvizspatial', 'gcvizcheck'], false, false);

					// remove spatial filter extent
					gisDG.unselectFeature(mapid, 'spatial-' + activeTableId);

					// clear definition query
					_self.applyDefQuery(infoLayer, '');

					// reset value then trigger a "change" event. Put the draw in
					// a timeout if not, the processing will not be shown
					$process.css( 'display', 'block' );
					$elems.val('');
					$elems.prop('selectedIndex', 0);
					setTimeout(function() {
						// remove search
						objDataTable[activeTableId].search('').columns().search('').draw();
						$process.css('display', 'none');
					}, 250);
				};

				_self.applyFilterMap = function(target) {
					var input, val, name, dateTmp, valClean,
						defs = [],
						definition = '',
						info = arrLayerInfo[activeTableId].layerinfo,
						inputs = $viz(target).parent().parent().find('.gcviz-dg-search'),
						len = inputs.length;

					while (len--) {
						input = $viz(inputs[len]);
						val = input.val();
						name = input.attr('gcviz-name');

						if (val !== '') {
							if (input.hasClass('gcviz-dg-searchstr')) {
								valClean = val.toUpperCase().replace(/\*/g, '%');
								defs.push('UPPER(' + name + ') LIKE \'' + valClean + '%\'');
							} else if (input.hasClass('gcviz-dg-searchnum')) {
								if (input.attr('placeholder') === 'Min') {
									defs.push(name + ' >= ' + val);
								} else if (input.attr('placeholder') === 'Max') {
									defs.push(name + ' <= ' + val);
								}
							} else if (input.hasClass('gcviz-dg-searchdrop')) {
								defs.push('UPPER(' + name + ') LIKE \'%' + val.toUpperCase() + '%\'');
							} else if (input.hasClass('gcviz-dg-searchdate')) {
								if (input.attr('placeholder') === 'Date Min') {
									dateTmp = val.split('-');
									defs.push(name + ' >= DATE \'' + dateTmp[1] + '/' + dateTmp[2] + '/' + dateTmp[0] + ' 00:00:00\'');
								} else if (input.attr('placeholder') === 'Date Max') {
									dateTmp = val.split('-');
									defs.push(name + ' <= DATE \'' + dateTmp[1] + '/' + dateTmp[2] + '/' + dateTmp[0] + ' 00:00:00\'');
								}
							}
						}
					}

					// stringnify the array and set query
					definition = defs.join(' AND ');

					// concat if there is an existing query and set query
					definition = _self.concatDefQuery(info, definition, 0, false);
					_self.applyDefQuery(info, definition);
				};

				_self.applyDefQuery = function(layerInfo, defQuery) {
					var layerType = layerInfo.type,
						layerId = layerInfo.id;

					mapVM.setDefQuery(mapid, defQuery, layerId, layerType, layerInfo.index);
				};

				_self.concatDefQuery = function(layerInfo, defQuery, nbFeatures, spatial) {
					var iStart, iEnd, tmpStrLen,
						queryNoId = '',
						tmpStr = '',
						lyrDef = '',
						layerType = layerInfo.type,
						layerId = layerInfo.id;

					// get actual def query
					lyrDef = mapVM.getDefQuery(mapid, layerId, layerType, layerInfo.index);

					// check if query never been initialize
					if (typeof lyrDef === 'undefined') {
						lyrDef = '';
					}

					// if it is a statial query remove spatial part then concat
					// If not, add the spatial part then concat.
					if (lyrDef !== '') {
						// extract spatial part
						iStart = lyrDef.indexOf('OBJECTID IN (');
						if (iStart !== -1) {
							tmpStr = lyrDef.substring(iStart, lyrDef.length);
							iEnd = tmpStr.indexOf(')') + 1;
							tmpStr = lyrDef.substring(iStart, iStart + iEnd);
						} else {
							tmpStr = '';
						}

						if (spatial) {
							// remove spatial part and leading and ending AND
							tmpStr = lyrDef.replace(tmpStr, '');
							tmpStrLen = tmpStr.length;
							if (tmpStr.indexOf(' AND ') === 0) {
								tmpStr = tmpStr.substring(5, tmpStrLen);
							}
							if (tmpStr.lastIndexOf(' AND ') === tmpStrLen - 5) {
								tmpStr = tmpStr.substring(0, tmpStrLen - 5);
							}

							queryNoId = tmpStr;
						} else {
							queryNoId = defQuery;
						}

						// combine query
						if (tmpStr !== '' && defQuery !== '') {
							defQuery += ' AND ' + tmpStr;
						} else if (tmpStr !== '') {
							defQuery = tmpStr;
						}
					}

					// combine query if theres is more then 1000 features because there is a bug (max record count on layer set to 1000
					// and we cant change the value in ArcGIS server 10.1)
					if (nbFeatures >= 1000) {
						defQuery = queryNoId;
					}

					return defQuery;
				};

				_self.dialogWCAGOk = function() {
					var ymin = _self.yValueMin(),
						xmin = _self.xValueMin(),
						ymax = _self.yValueMax(),
						xmax = _self.xValueMax();

					// draw box
					gisGraphic.drawWCAGBox(xmin, ymin, xmax, ymax, 4326, mapVM.getSR(mapid), _self.selExtent);

					// close window
					_self.isDialogWCAG(false);
				};

				_self.dialogWCAGCancel = function() {
					_self.isDialogWCAG(false);
				};

				_self.dialogWCAGClose = function() {
					_self.isDialogWCAG(false);
				};

				_self.selExtent = function(geometry) {
					var info, url, layerInfo,
						type,
						len, i, graphic, graphics, features;

					// remove draw box cursor
					$container.css('cursor', '');

					// deactivate tool and click event if user opens menu or press esc
					drawTool[0].deactivate();
					drawTool[1].remove();

					// put back popup click event
					mapVM.addPopupEvent(mapid);

					if (typeof geometry !== 'undefined') {
						// geometry can be object or array
						if (typeof geometry.length !== 'undefined') {
							geometry = geometry[0].geometry;
						}

						// get layerinfo
						info = arrLayerInfo[activeTableId];
						layerInfo = info.layerinfo;
						type = layerInfo.type;

						// if it as an added layer, the type is 7 and it is a graphic layer.
						// graphic layer are process differently then other layers
						if (type !== 7) {
							url = mapVM.getLayerURL(mapid, layerInfo.id);

							// add index if dynamic
							if (layerInfo.type === 4) {
								url += '/' + layerInfo.index;
							}

							// draw extent for spatial filter then call query task to get selection
							gisDG.drawSpatialExtent(mapid, geometry, 'spatial-' + activeTableId, true);
							gisDG.getSelection(url, mapVM.getSR(mapid), geometry, _self.setSelection);
						} else {
							graphics = mapVM.getGraphics(mapid, layerInfo.id);
							features = [];
							len = graphics.length - 1;
							i = 0;

							// loop trought graphics, add them to array and call setSelection
							while (i <= len) {
								graphic = graphics[i];
								if (geometry.contains(graphic.geometry)) {
									features.push(graphic);
								}
								i++;
							}

							// draw extent for spatial filter then set selection
							gisDG.drawSpatialExtent(mapid, geometry, 'spatial-' + info.table, true);
							_self.setSelection(features);
						}
					}

					// open menu if it was open
					if (menuState !== false) {
						$menu.accordion('option', 'active', 0);
					}
				};

				_self.setSelection = function(features) {
					var dataId, item, definition,
						i = 0,
						info = arrLayerInfo[activeTableId].layerinfo,
						data = objDataTable[activeTableId].data(),
						lenData = data.length,
						lenFeats = features.length,
						oriLenFeats = lenFeats,
						featIds = new Array(lenFeats);

					// create an array with all the objectid to select
					while (i !== lenFeats) {
						featIds[i] = features[i].attributes.OBJECTID;
						i++;
					}

					// loop data to see if we need to select
					i = 0;
					while (i !== lenData) {
						item = data[i];
						dataId = item.OBJECTID;

						if (featIds.indexOf(dataId) !== -1) {
							item.gcvizspatial = true;
						} else if (item.gcvizspatial) {
							item.gcvizspatial = false;
						}
						i++;
					}

					// if a spatial filter is applied to the table, add it
					// to the array of spatial filter. It will be use in the
					// search to apply only to table who are filtered
					if (triggerTableId[activeTableId] === '') {
						triggerTableId[activeTableId] = activeTableId.toString();
					}

					// clear search then trigger the spatial one with draw
					objDataTable[activeTableId].draw();

					// stringnify the array
					definition = 'OBJECTID IN (' + featIds.join(',') + ')';

					// concat if there is an existing query and set query
					definition = _self.concatDefQuery(info, definition, oriLenFeats, true);
					_self.applyDefQuery(info, definition);
				};

				_self.highlightRow = function(row, check) {
					// set class to row if selected. We also have to set it to column with
					// sorting class. If not, the color is not applied.
					if (check) {
						row.className += ' gcviz-backYellow';
					} else {
						row.className = row.className.replace(/gcviz-backYellow/g, '');
					}
				};

				// keep _self outiside initialize to be able to call it from outside
				// in this case we will need it to add a new tab for csv data or remove one
				_self.innerAddTab = function(datas, title, layer) {
					// add the popup title to lookup table
					lookPopups.push([title, title]);

					// add layer definition to config file
					config.layers.push(layer);

					// add tab and table
					_self.createTab(datas);
				};

				_self.innerAddRestTab = function(url, layer) {
					var urlFull = url + '/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime(),
						layerInfo = layer.layerinfo;

					// get data
					gisDG.getData(mapid, urlFull, layer, _self.createTab);

					// popup (remove layer index)
					url = url.substring(0, url.indexOf('MapServer/') + 10);
					gisDG.createIdTask(mapid, url, layerInfo.index, layerInfo.id, 5, _self.returnIdTask);

					// add title and layer name alias to a lookup table for popups
					lookPopups.push([layer.popups.layeralias, layer.title]);

					// add layer definition to config file
					config.layers.push(layer);
				};

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
						fieldType,
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
								// set to 2 because the 2 last field are for select graphic and link 
								staticFields = 2;

								linkNode = _self.getLinkNode(linkInfo, layer.layerinfo.id, attributes.OBJECTID);
							}

							// the last field is for select
							while (lenFields >= staticFields) {
								field = fields[lenFields];
								lenFields--;

								for (var l = 0; l < attrNames.length; l++) {
									if (field.dataalias.toUpperCase() === attrNames[l].toUpperCase()) {
										fieldType = field.fieldtype.type;

										// if url, construct it
										if (fieldType === 3) {
											info = '<span class="gcviz-prop">' + field.title + '</span></br>' +
													'<a class="gcviz-popup-val" href="' + attrValues[gcvizFunc.returnIndexMatch(attrNames, field.fieldtype.urlfieldalias)] + '" target="_blank">' + attrValues[l] + '</a></br>' +
													info;
										} else {
											info = '<span class="gcviz-prop">' + field.title + '</span>' +
													'<p class="gcviz-popup-val">' + attrValues[l] + '</p>' +
													info;
										}
									}
								}
							}

							// update content
							$popContent.html(info + linkNode);
						}
					}

					// highlight the feature
					gisDG.selectFeaturePop(mapid, feature.geometry);
				};

				_self.getLinkNode = function(linkInfo, layerId, objectID) {
					var links, link,
						linkAttrNames, linkAttrValues,
						lenLink, lenFields,
						fieldName,
						fieldsInfo = linkInfo.fields.reverse(),
						node = '';

					// get the feature attribute names and values
					links = gisDG.getRelRecords(mapid, layerId, objectID);
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
					gisDG.unselectFeature(mapid, 'popup');
				};

				_self.changeSelectLayer = function() {
					var feat,
						allLayer = _self.lblAllLayer,
						selLayer = _self.selectedLayer(),
						len = allIdFeatures.length;

					// remove highlight
					gisDG.unselectFeature(mapid, 'popup');

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
					mapVM.zoomFeature(mapid, feature);
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
						gisDG.unselectFeature(mapid, 'popup');
						gisDG.selectFeaturePop(mapid, currentFeature.feature.geometry);
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
						gisDG.unselectFeature(mapid, 'popup');
						gisDG.selectFeaturePop(mapid, currentFeature.feature.geometry);
					}
				};

				_self.setPopupSize = function(event, ui) {
					var height = ui.size.height - 140; // 140 is the height of header

					// do not let the user set to height too low. For width, we dont have
					// to do it because minWidth works.
					if (height < 100) {
						height = 100;
					}

					$popContent.css('height', height + 'px');
				};

				_self.init();
			};

			// put view model in an array because we can have more then one map in the page
			vm[mapid] = new datagridViewModel($mapElem, mapid, config);
			ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		// *** PUBLIC FUNCTIONS ***
		subscribeIsTableReady = function(mapid, funct) {
			return vm[mapid].isTableReady.subscribe(funct);
		};

		addTab = function(mapid, featColl, title, layerId) {
			var field, feat, table,
				data = { },
				fields = [],
				viewModel = vm[mapid],
				i = 0,
				datas = [],
				fieldsOri = featColl.layerDefinition.fields,
				lenField = fieldsOri.length,
				layer = { },
				feats = featColl.featureSet.features,
				lenFeat = feats.length;

			// call the inner create tab function (if datagrid is enable)
			if (typeof viewModel !== 'undefined') {
				table = viewModel.table;

				// setup fields
				while (i < lenField) {
					// add the field only if it is not a internal field
					field = fieldsOri[i];
					if (field.name.indexOf('OBJECTID') === -1) {
						delete field.type;
						delete field.render;
						delete field.editable;
						delete field.domain;
						field.title = field.alias;
						delete field.alias;
						field.data = field.name;
						field.dataalias = field.name;
						delete field.name;
						field.width = '80px';
						field.searchable = true;
						field.fieldtype = {
							type: 1,
							value: 1
						};

						fields.push(field);
					}
					i++;
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
					data.gcvizspatial = false;
					datas.push(data);
				}

				// reverse the array to have data in the right order
				datas = datas.reverse();
				
				// recreate layerinfo like we have in config file from data added from
				// data toollbar.
				layer.title = title;
				layer.mapid = mapid;
				layer.fields = fields;
				layer.globalsearch = false;
				layer.popups = { 'enable': true,
								'layeralias': title };
				layer.linktable = { 'enable': false };

				// add layer info to first element
				layer.layerinfo = {
									'pos': table,
									'id': layerId,
									'type': 7
								};
				datas[0].layer = layer;

				viewModel.innerAddTab(datas, title, layer);
			} else {
				// there is a problem with the define. The gcviz-vm-tbdata is not able to be set.
				// We set the reference to gcviz-vm-tbdata (hard way)
				require(['gcviz-vm-tbdata'], function(vmData) {
					vmData.notifyAdd(mapid);
				});
			}
		};

		addRestTab = function(url, featLayer, mapid) {
			var field, outfield, fieldName, fieldType, table,
				defaultFields ='OBJECTID, Shape, SHAPE.AREA, SHAPE.LEN',
				outFields = [],
				layer = { },
				viewModel = vm[mapid],
				name = featLayer.name,
				fields = featLayer.fields,
				lenFields = fields.length;

			// call the inner create tab function (if datagrid is enable)
			if (typeof viewModel !== 'undefined') {
				table = viewModel.table;

				// remove shape fields. Recreate fields instead of copying them because
				// there is hidden key that makes datatable to crash.
				while (lenFields--) {
					field = fields[lenFields];
					fieldName = field.name;
					fieldType = field.fieldtype;

					if (defaultFields.indexOf(fieldName) === -1) {
						outfield = { },
						outfield.title = field.alias;
						outfield.data = field.name;
						outfield.dataalias = field.name;
						outfield.width = '100px';
						outfield.searchable = true;
						outfield.fieldtype = {
								type: 1
							};
						if (fieldType === 'esriFieldTypeDate') {
							outfield.fieldtype.value = 3;
							outfield.fieldtype.informat = 1;
							outfield.fieldtype.outformat = 1;
							outfield.width = '200px';
						} else if (fieldType === 'esriFieldTypeDouble' || fieldType === 'esriFieldTypeInteger' || fieldType === 'esriFieldTypeSmallInteger') {
							outfield.fieldtype.value = 2;
						} else {
							outfield.fieldtype.value = 1;
						}

						outFields.push(outfield);
					}
				}

				// recreate layerinfo like we have in config file from data added from
				// data toollbar.
				layer.title = name;
				layer.mapid = mapid;
				layer.fields = outFields;
				layer.globalsearch = false;
				layer.popups = { 'enable': true,
								'layeralias': name };
				layer.linktable = { 'enable': false };
				layer.layerinfo = {
									'pos': table,
									'id': featLayer.id,
									'type': 5,
									'index': featLayer.layerId
								};

				viewModel.innerAddRestTab(url, layer);
			} else {
				// there is a problem with the define. The gcviz-vm-tbdata is not able to be set.
				// We set the reference to gcviz-vm-tbdata (hard way)
				require(['gcviz-vm-tbdata'], function(vmData) {
					vmData.notifyAdd(mapid);
				});
			}
		};

		removeTab = function(mapid, id) {
			var viewModel = vm[mapid];

			if (typeof viewModel !== 'undefined') {
				viewModel.removeTab(id);
			}
		};

		return {
			initialize: initialize,
			subscribeIsTableReady: subscribeIsTableReady,
			addTab: addTab,
			addRestTab: addRestTab,
			removeTab: removeTab
		};
	});
}).call(this);
