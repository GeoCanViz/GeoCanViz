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
			'gcviz-func',
			'esri/request'
	], function($viz, ko, gcvizFunc, esriRequest) {
		var initialize,
			vm;

		initialize = function($mapElem, mapid, config) {

			// data model				
			var datagridViewModel = function($mapElem, mapid, config) {
				var _self = this,
					objDataTable = [],
					table = 0,
					tables = config.layers.length,
					mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
					$datagrid = $viz('#gcviz-datagrid' + mapid),
					$datatab = $viz('#gcviz-datatab' + mapid),
					$datatabUl = $datatab.find('ul');

				_self.init = function() {
					var layers = config.layers,
						lenLayers = layers.length;
					
					// init accordion and hide header
					$viz('#gcviz-datagrid' + mapid).accordion({
						collapsible: true,
						active: false,
						activate: function( event, ui ) {
							// WORKAROUND, when we set scrollX and scrollY on datatable, the headers dont match the columns.
							// to solve this we have to adjust the columns when the datatable is shown. For the fist tab, there
							// no click so we put the function on the accordion. This is done for every time the accordion is
							// active. If it becomes to slow we can do it once then unbind the event.
							_self.calcColumns();
						}
					});
					$viz('.ui-accordion-header').hide();
					
					// loop all layers
					while (lenLayers--) {
						_self.getData(layers[lenLayers]);
					}
				};

				_self.getData = function(layer) {
					var url = mymap.getLayer(layer.layerid).url + '0/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();
					
					esriRequest({
						url: url,
						content: { f: 'json' },
						handleAs: 'json',
						callbackParamName: 'callback',
						load: function(response) {
							var feat,
								data = [],
								features = response.features,
								len = features.length;

							while (len--) {
								feat = features[len];
								data.push(feat.attributes);
							}
							
							// create tab
							_self.createTab(data, layer);
						},
						error: function(err) { console.log('datagrid error: ' + err); }
					});
							
				};
				
				_self.createTab = function(data, layer) {
					// increment table
					table += 1;
					
					// add the tab
					$datatabUl.append('<li><a href="#tabs-' + mapid + table + '">' + layer.title + '</a></li>');					
					$datatab.append('<div id="tabs-' + mapid + table + '" class="gcviz-datagrid-tab"><table id="table-' + mapid + table + '" class="gcviz-datatable display"></table></div>');
					
					// create datatable
					_self.createTable(data, layer);
				};
				
				_self.createTable = function(data, layer) {
					objDataTable.push($viz('#table-' + mapid + table).on( 'init.dt', _self.finishInit()).DataTable({
						'data': data,
						'scrollY': '500',
						'scrollX': true,
						'scrollCollapse': true,
						'pagingType': 'full_numbers',
						'autoWidth': false,
						'deferRender': true,
						'processing': true,
						'columns': layer.fields
					}));
				};
				
				_self.finishInit = function() {
					
					if (table === tables) {
						$datagrid.accordion('refresh');
						$datatab.tabs({
							// WORKAROUND, when we set scrollX and scrollY on datatable, the headers dont match the columns.
							// to solve this we have to adjust the columns when the datatable is shown. When tab is click,
							// the adjustment is made. This is done for every tables every time. If it becomes to slow we can
							// try to do it only for the active tab.
							activate: function( event, ui ) {
								_self.calcColumns();
							}
						});
						
						// enable datagrid button in footerVM
						gcvizFunc.setElemValueVM(mapid, 'footer', 'isTableReady', true);
					}
				};

				_self.calcColumns = function() {
					var table,
						len = objDataTable.length;
								
					while (len--) {
						objDataTable[len].columns.adjust().draw();
					}
				};
				
				_self.init();
			};

			vm = new datagridViewModel($mapElem, mapid, config);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
