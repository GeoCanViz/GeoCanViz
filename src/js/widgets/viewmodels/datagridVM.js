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
					lookPopups = new Array(),
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
				_self.lblClearFilters = i18n.getDict('%datagrid-clearfilters');

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

				_self.openWait = function(event) {
					$(event.target.parentElement).find('.ui-dialog-titlebar-close').addClass('gcviz-dg-wait');
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
					var tmpLook, urlFull,
						layerInfo = layer.layerinfo,
						layerIndex = layerInfo.index,
						type = layerInfo.type,
						url = mymap.getLayer(layerInfo.id).url,
						popup = layer.popups;

					// set position in the array too be able to create unique id later
					layerInfo.pos = pos;

					if (type === 4) {
						// datatable (dynamic layer, need layer index to select one layer in the dynamic service)
						urlFull = url + layerIndex + '/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();
						gisDG.getData(urlFull, layer, _self.createTab);

						// popup
						if (popup.enable) {
							gisDG.createIdTask(url, layerIndex, _self.returnIdTask);

							// add title and layer name alias to a lookup table for popups
							lookPopups.push([popup.layeralias, layer.title]);
						}
					} else if (type === 5) {
						// datatable (feature layer)
						urlFull = url + '/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();
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
						searchInd = 2,
						$table = $viz('#table-' + mapid + '-' + pos);

					// check if we need to add a columns to open/close link info
					if (typeof data[0].link !== 'undefined') {
						link = true;
						searchInd = 3;
					}

					// if there is too much data on the page we need to use defer render to speed up the process
					if (data.length > 2500) {
						deferRender = true;
					}

					// create fields
					fields = _self.createFields(layer, link);

					dataTB = $table.DataTable({
						'data': data,
						'deferRender': deferRender,
						'autoWidth': false,
						'serverSide': false,
						'scrollY': 400,
						'scrollX': true,
						'scrollCollapse': true,
						'pagingType': 'full',
						'processing': true,
						'columns': fields,
						'initComplete': function(inTable) {
							var elem,
								idTable = inTable.sTableId,
								idxTable = idTable.split('-'),
								id = idxTable[idxTable.length - 1],
								$filter = $viz('#' + idTable + '_filter'),
								$len = $viz('#' + idTable + '_wrapper .dataTables_length');

							// if defer render is true, do not add the select all because it wont work
							// properly. The rows are not created until user navigate to them.
							if (!deferRender) {
								// add a select all checkbox and class on label
								$len.append('<div><input type="checkbox" class="gcviz-dg-selall" id="cb_seletAllFeat-' + id + '">' +
											'<label for="cb_seletAllFeat" class="form-checkbox gcviz-dg-lblselall">' + _self.lblSelectAll + '</label></div>');
								$len.children().addClass('gcviz-dg-pad');
							}

							// add the clear filter button and class on label
							elem = $filter.prepend('<button class="gcviz-dg-filterclear"></button>');
							gcvizFunc.addTooltip(elem, { content: _self.lblClearFilters });
							$filter.children().addClass('gcviz-dg-pad').attr('id', 'clearfilter-' + id);

							// setup - add a text input to each header cell (for search capabilities)
							// for the first 2 columns add zoom to selected and clear zoom.
							$viz('#' + idTable + '_wrapper .dataTables_scrollHead th').each(gcvizFunc.closureFunc(function(id, colIdx) {
								var elem;

								if (colIdx === 0) {
									// add zoom to selected
									elem = $viz(this).append('<button id=zoomsel-' + id + '" class="gcviz-dg-zoomsel"></button>');
									gcvizFunc.addTooltip(elem, { content: _self.lblZoomSelect });
								} else if (colIdx === 1) {
									// add clear zoom
									elem = $viz(this).append('<button class="gcviz-dg-zoomclear"></button>');
									gcvizFunc.addTooltip(elem, { content: _self.lblClearZoom });
								} else if (!$viz(this).hasClass('gcviz-dg-link')){
									// add filter
									$viz(this).append('<input type="text" class="gcviz-dg-search" placeholder="' + _self.search + ' ' + this.innerHTML +'"></text>');
								}
							}, id));

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
							// Set the checked state of the checkbox in the table
							var item = $viz('.gcviz-dg-select', row),
								val = data.gcvizcheck;
							item.prop('checked', val === true);
							_self.highlightRow(item, val);
						},
						createdRow: function(row, data, index) {
							// add id on the row instead of in a columns. We have to do this because we cant hide the column
							// it creates display problems with IE
							row.id = data.gcvizid;
						}
					});

					// if there is a link, set the title, sub title and fields value to the column header
					if (link) {
						var linkCol = $viz(dataTB.column(2).header());
						linkCol.attr('gcviz-title', layer.linktable.title);
						linkCol.attr('gcviz-subtitle', layer.linktable.subtitle);
						linkCol.attr('gcviz-fields', $viz.map(layer.linktable.fields, function(value) {
							return '{"' + value.data + '":"' + value.title + '"}';
						}));
					}

					// Apply the search by field
					dataTB.columns().eq(0).each(function(colIdx) {
						$viz('input', dataTB.column(colIdx).header()).on('keyup change', function() {
							dataTB.column(colIdx).search(this.value).draw();
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
					dataTB.order([searchInd, 'asc']).draw();

					// add the datatable and data to a global array so we can access it later
					// reverse the data to have then in the same order as the id. It will easier to find later.
					// we set the table at the right position to ensure a good link. If not, table with item 1-1
					// can be in the third position of the array. The result is the zoom function will use the wrong
					// geometry.
					if (typeof layer.layerinfo !== 'undefined') {
						objDataTable[pos] = dataTB;
						objData[pos] = data.reverse();
					} else {
						// table added with data toolbar
						objDataTable.push(dataTB);
						objData.push(data.reverse());
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

					if (link) {
						fields.unshift({
							data: null,
							className: 'gcviz-dg-link',
							searchable: false,
							orderable: false,
							defaultContent: '',
							width: '10px'
						});
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

					return fields;
				};

				_self.finishInit = function(pos) {

					_self.setEvents(pos);

					// if all tables have been initialize
					if (table === tables) {

						// set tabs and refresh accordion
						$datatab.tabs({
							heightStyle: 'auto',
							activate: function() {
								// order the first row after select and zoom to align header and column
								var len = objDataTable.length;

								while (len--) {
									objDataTable[len].draw();
								}						
							}
						});
						$datagrid.accordion('refresh');

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
						
						// subscribe to the open datagrid event. The firts time we need to redraw
						// the table
						gcvizFunc.subscribeTo(mapid, 'footer', 'isOpenDG', function() {
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
						var $checkbox = $viz(e.target.parentNode.parentNode).find('.gcviz-dg-select'),
							info = _self.getInfo(e, 'control');

						// select or unselect feature on map
						_self.select($checkbox, info);
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
					$tabs.on('click', '.gcviz-dg-zoomclear', function() {
						// clear zoom features
						gisDG.unselectFeature('zoom');
					});

					// set clear filters event
					$tabs.on('click', '.gcviz-dg-filterclear', function(e) {
						var $elems = $viz(e.target.parentElement.parentElement).find('.gcviz-dg-search'),
							id = parseInt(e.target.id.split('-')[1], 10);

						// reset value then trigger a "change" event.
						$elems.val('');
						objDataTable[id].search('').columns().search('').draw();
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

					// set opening and closing details link info event
					// https://datatables.net/examples/api/row_details.html
					$table.on('click', 'td.gcviz-dg-link', function() {
						var col, title, subtitle, fields,
							tr = $viz(this).closest('tr'),
							layer = parseInt(tr[0].id.split('-')[0]),
							row = objDataTable[layer].row(tr);

						if (row.child.isShown()) {
							// close row
							row.child.hide();
							tr.removeClass('shown');
						} else {
							// open row
							col = $viz(this).closest('table').find('.gcviz-dg-link');
							title = col.attr('gcviz-title');
							subtitle = col.attr('gcviz-subtitle');
							fields = col.attr('gcviz-fields').split(',').reverse();
							row.child(_self.formatLink(row.data(), title, subtitle, fields)).show();
							tr.addClass('shown');
						}

						event.preventDefault();
						event.stopPropagation();
						return false;
					});
				};

				// formatting function for row details (link info)
				_self.formatLink = function(data, title, subtitle, fields) {
					// data is the original data object for the row
					var attrNames, attrValues, lenFields,
						link, fieldName,
						fieldObj = [],
						node = '',
						links = data.link,
						lenLink = links.length,
						lenTitle = fields.length;

					// add title and subtitle then start table
					node += '<span class="gcviz-dg-linktitle">' + title + '</span>' +
							'<span class="gcviz-dg-linksubtitle">' + subtitle + '</span>' +
							'<table class="gcviz-dg-linktable"><thead><tr role="row">';

					// get fields name from data then create header
					attrNames = $viz.map(links[0], function(value, index) {
						return [index];
					});

					lenFields = Object.keys(attrNames).length;
					while (lenFields--) {
						// get the title to put for the field and create node
						fieldName = JSON.parse(fields[lenFields])[attrNames[lenFields]];
						node += '<th class="dt-body-center sorting_disabled" rowspan="1" colspan="1" aria-label="' + fieldName +
									'" title="' + fieldName + '">' + fieldName + '</th>';
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

				_self.getInfo = function(e, type) {
					var objInfo,
						str,
						info;

					if (type === 'row') {
						str = e.target.parentElement.id;
					} else if (type === 'control') {
						str = e.target.parentElement.parentElement.id;
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
						tableId = parseInt(e.target.id.split('-')[1], 10),
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
					var feat = objData[info.table][info.feat];

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
					var tableId, table, lenTable, lenRows,
						val, td, rows, lenIds, id,
						ids = [],
						info = { },
						target = e.target,
						checks = target.parentElement.parentElement.parentElement.getElementsByClassName('gcviz-dg-select'),
						len = checks.length;

					// it comes from the checkbox, we grab the table id (we will need it later)
					tableId = parseInt(target.id.split('-')[1], 10);
					info.table = tableId;

					// update the ui with the selected value for the row filtered
					// add the id to an array to be able to check the data as well
					val = target.checked;
					rows = objDataTable[tableId].$('tr', {"filter":"applied"});
					while (len--) {
						td = $viz('.gcviz-dg-select', rows[len]);
						checks[len].checked = val;
						_self.highlightRow(td, val);
					}

					// apply the check value to all filtered features from the table
					// we also apply the select on unselect task for every of those features.
					// we need to do this to applyt he chedck/uncheck to item on other pages
					table = objData[tableId];
					lenRows = rows.length;
					lenTable = table.length;

					if (val) {
						// if select, do it for filtered feartures
						while (lenRows--) {
							id = parseInt(rows[lenRows].id.split('-')[1], 10);
							info.feat = id;
							table[id].gcvizcheck = true;
							gisDG.selectFeature(table[id].geometry, info);
						}
					} else {
						// if unselect, do it for all features
						while (lenTable--) {
							table[lenTable].gcvizcheck = false;
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

						if (popups && layerName === layer.title) {

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
								staticFields = 2;
								
								linkNode = _self.getLinkNode(linkInfo, layer.layerinfo.id, attributes.OBJECTID);
							}

							// the last 2 fields are for select and zoom
							while (lenFields > staticFields) {
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
						fieldName = linkAttrNames[lenLink];
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
