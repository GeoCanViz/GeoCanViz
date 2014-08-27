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

		initialize = function($mapElem, mapid) {

			// data model				
			var datagridViewModel = function($mapElem, mapid) {
				var _self = this;

				_self.init = function() {
					var mymap = gcvizFunc.getElemValueVM(mapid, ['map', 'map'], 'js'),
						url = "http://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCC/Geochronology/MapServer/" + '0/query?where=OBJECTID+>+0&outFields=*&dirty=' + (new Date()).getTime();

					esriRequest({
						url: url,
						content: { f: 'json' },
						handleAs: 'json',
						callbackParamName: 'callback',
						load: function(response) {
							var feat,
								data = [],
								node = '',
								features = response.features,
								len = features.length;

							console.log('before: ' + (new Date()).getTime());
							len = 100;
							while (len--) {
								feat = features[len];
								data.push(feat.attributes);
								node = node + '<tr><td>' + feat.attributes.SAMPLENO + '</td>' +
												'<td>' + feat.attributes.AGE + '</td>' +
												'<td>' + feat.attributes.ERR_PLUS + '</td>' +
												'<td>' + feat.attributes.ERR_MINUS + '</td>' +
												'<td>' + feat.attributes.AGE_METHOD + '</td>' +
												'<td>' + feat.attributes.AGE_INTERP + '</td>' +
												'<td>' + feat.attributes.AGE_NOTE + '</td>' +
												'<td>' + feat.attributes.PROV + '</td>' +
												'<td>' + feat.attributes.LATITUDE + '</td>' +
												'<td>' + feat.attributes.LONGITUDE + '</td>' +
												'<td>' + feat.attributes.LOCATION + '</td>' +
												'<td>' + feat.attributes.ROCKTYPE + '</td>' +
												'<td>' + feat.attributes.ROCKDESC + '</td>' +
												'<td>' + feat.attributes.AUTHORS + '</td>' +
												'<td>' + feat.attributes.YEAR_ + '</td>' +
												'<td>' + feat.attributes.TITLE + '</td>' +
												'<td>' + feat.attributes.AGE_MATERIAL + '</td>' +
												'<td>' + feat.attributes.AGE_TECHNIQUE + '</td>' +
												'<td>' + feat.attributes.AGE_QUALIFIER + '</td>' +
												'<td>' + feat.attributes.GEOLOGICAL_PROVINCE + '</td>' +
												'<td>' + feat.attributes.GEOLOGICAL_INFO + '</td>' +
												'<td>' + feat.attributes.REFERENCE_INFO + '</td>' +
												'<td>' + feat.attributes.COMPILATION_NAME + '</td>' +
												'<td>' + feat.attributes.OBJECTID + '</td></tr>';
							}
							console.log('create node done: ' +  (new Date()).getTime());
							$viz('.gcviz-datagrid').find('tbody').append(node);
							console.log('append node done: ' + (new Date()).getTime());
							// var objDataTable = $viz('.gcviz-datagrid').DataTable( {
								// 'sScrollY': '400',
								// 'sScrollX': '100%',
								// 'sScrollXInner': '300',
						        // 'sScrollCollapse': true,
						        // 'bPaginate': true,
								// 'bAutoWidth': false,
						        // 'bDeferRender': true,
						        // 'bProcessing': true
							// } );
// 							
							// //objDataTable.fnSettings().oScroll.sX = "100%";
							// objDataTable.fnDraw();


// TEST AVEC UN ARRAY
							// var data = [
    // [
        // "Tiger Nixon",
        // "System Architect sfdsfsfsdf sfdsfsdfdfsdf sdfdfsdfdsfdsfsd sdfdfdsfsfdsfsd fdsfdsfdsfdsfdsf sdfdsfsfdfsfsd dsfdsfsdfdsfdsfsd",
        // "Edinburgh",
        // "5421 sfdfdfsdfsfs",
        // "2011/04/25 sdfsdfsd sfdfdfsd",
        // "$3,120 sfdsdffsds"
    // ],
    // [
        // "Garrett Winters",
        // "Director",
        // "Edinburgh",
        // "8422",
        // "2011/07/25",
        // "$5,300"
    // ]
// ];
// 
// var objDataTable = $viz('.gcviz-datagrid').DataTable( {
	// "aaData": data,
	// "aaSorting": [[0, 'asc']]
							// } );
							
							
							
// TEST AVEC OBJET
var data = [
    {
        "name":       "Tiger Nixon",
        "position":   "System Architect",
        "salary":     "$3,120",
        "office":     "Edinburgh",
    },
    {
        "name":       "Garrett Winters",
        "position":   "Director",
        "salary":     "$5,300",
        "office":     "Edinburgh",
    }
];

var objDataTable = $viz('.gcviz-datagrid').DataTable( {
	"aaData": data,
	"aaSorting": [[0, 'asc']],
	"aoColumns": [
        { 'sTitle': 'SAMPLENO', 'data': 'name' },
        { 'sTitle': 'AGE', 'data': 'position' },
        { 'sTitle': 'ERR_PLUS', 'data': 'salary' },
        { 'sTitle': 'ERR_MINUS', 'data': 'office' }
    ]
							} );
							
							console.log('datatable done: ' + (new Date()).getTime());
						},
						error: function(err) { console.log('datagrid error: ' + err); }
					});
				};
				
				_self.getData = function() {
					
				};

				_self.init();
			};

			vm = new datagridViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
