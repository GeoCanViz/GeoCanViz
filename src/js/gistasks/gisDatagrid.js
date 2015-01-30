/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS datagrids functions
 */
/* global esri: false, dojo: false */
(function () {
	'use strict';
	define(['jquery-private',
			'gcviz-gismap',
			'gcviz-gisgeo',
			'gcviz-func',
			'esri/layers/GraphicsLayer',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/geometry/Point',
			'esri/geometry/Polygon',
			'esri/geometry/Polyline',
			'esri/SpatialReference',
			'esri/graphic',
			'esri/request',
			'esri/tasks/RelationshipQuery',
			'dojo/DeferredList',
			'esri/tasks/IdentifyTask',
			'esri/tasks/IdentifyParameters'
	], function($viz, gisMap, gisGeo, gcvizFunc, esriGraphLayer, esriLine, esriFill, esriMarker, esriPoint, esriPoly, esriPolyline, esriSR, esriGraph, esriRequest, esriRelRequest, dojoDefList, esriIdTask, esriIdParams) {
		var initialize,
			getData,
			createDataArray,
			closeGetData,
			createGraphic,
			zoomFeature,
			zoomFeatures,
			selectFeature,
			selectFeaturePop,
			unselectFeature,
			createIdTask,
			executeIdTask,
			returnIdResults,
			setRelRecords,
			getRelRecords,
			removeEvtPop,
			addEvtPop,
			wkid,
			selectLayer,
			symbPoint,
			symbLine,
			symbPoly,
			mymap,
			relRecords = {},
			idTask,
			idTasksArr = [],
			idTaskIndex = 0,
			layerIndex,
			idParams = new esriIdParams(),
			idFeatures,
			idRtnFunc;

		initialize = function(map) {
			var color = [255,255,102,125],
				outline = { 'type': 'esriSLS',
						'style': 'esriSLSSolid',
						'color': [255,255,0,255],
						'width': 1
				};

			wkid = map.vWkid;
			mymap = map;

			// event and params for identify task
			idFeatures = mymap.on('click', executeIdTask);
			idParams.tolerance = 3;
			idParams.returnGeometry = true;
			idParams.layerOption = esriIdParams.LAYER_OPTION_VISIBLE; // layer option all

			// add the graphic layers to the map and set global variable
			mymap.addLayer(new esriGraphLayer({ id: 'gcviz-datagrid' }));
			selectLayer = map.getLayer('gcviz-datagrid');

			// set symbologies
			symbPoint = new esriMarker({
								'type': 'esriSMS',
								'style': 'esriSMSCircle',
								'color': color,
								'size': 18,
								'angle': 0,
								'xoffset': 0,
								'yoffset': 0,
								'outline': outline
							});

			symbLine = new esriLine({
								'type': 'esriSLS',
								'style': 'esriSLSSolid',
								'color': color,
								'width': 5,
								'outline': outline
							});

			symbPoly = new esriFill({
								'type': 'esriSFS',
								'style': 'esriSFSSolid',
								'color': color,
								'outline': outline
							});
		};

		getData = function(url, layer, success) {
			esriRequest({
				url: url,
				content: { f: 'json' },
				handleAs: 'json',
				callbackParamName: 'callback',
				load: function(response) {
					var relatedQuery, featLayer,
						layerInfo = layer.layerinfo,
						linkFields, lenLinkFields, strLinkFields,
						pos = layerInfo.pos,
						linkInfo = layer.linktable,
						id = layerInfo.id,
						sr = response.spatialReference,
						data = [],
						features = response.features,
						len = features.length - 1;

					// if there is a link table to retrieve info from, set it here.
					// it only work with feature layer who have a valid OBJECTID field
					if (linkInfo.enable) {
						// get the link field to query
						linkFields = linkInfo.fields;
						lenLinkFields = linkFields.length;

						strLinkFields = '';
						while (lenLinkFields--) {
							strLinkFields += linkFields[lenLinkFields].data + ',';
						}

						// create the query
						relatedQuery = new esriRelRequest();
						relatedQuery.outFields = [strLinkFields.slice(0, -1)];
						relatedQuery.relationshipId = linkInfo.relationshipId;
						relatedQuery.objectIds = gcvizFunc.getObjectIds(response.features);

						// query the link table
						featLayer = mymap.getLayer(id);
						featLayer.queryRelatedFeatures(relatedQuery, function(relatedRecords) {
							data = createDataArray(features, len, sr, id, pos, relatedRecords);
							closeGetData(data, layer, success);
							
							// keep related records to be access later by popups
							setRelRecords(id, relatedRecords);
						});
					} else {
						data = createDataArray(features, len, sr, id, pos);
						closeGetData(data, layer, success);
					}
				},
				error: function(err) { console.log('datagrid error: ' + err); }
			});
		};

		createDataArray = function(features, len, sr, id, pos, relRecords) {
			var linkLen, linkFeats, linkFeat,
				feat, geom, geometry,
				data = [],
				flag = false;

			if (typeof relRecords !== 'undefined') {
				flag = true;
			}

			while (len--) {
				feat = features[len];
				geom = feat.geometry;

				// select geometry type then create geometry 
				if (typeof geom.x !== 'undefined') {
					geometry = new esriPoint({ 'x': geom.x, 'y': geom.y, 'spatialReference': sr });
				} else if (typeof geom.paths !== 'undefined') {
					geometry = new esriPolyline({ 'paths': geom.paths, 'spatialReference': sr });
				} else {
					geometry = new esriPoly({ 'rings': geom.rings, 'spatialReference': sr });
				}

				// add a unique id and wkid
				geometry.attributes = feat.attributes;
				geometry.attributes.gcvizid = pos + '-' + len;
				geometry.attributes.gcvizcheck = false;
				geometry.attributes.layerid = id;

				// if present, add the related records from a link table
				if (flag) {
					// Get the right data from OBJECTID
					linkFeats = relRecords[geometry.attributes.OBJECTID].features;
					linkLen = linkFeats.length;

					geometry.attributes.link = [];
					while (linkLen--) {
						linkFeat = linkFeats[linkLen];
						geometry.attributes.link.push(linkFeat.attributes);
					}
				}

				// push geometry to array of data
				data.push(geometry);
			}

			return data;
		};

		closeGetData = function(data, layer, success) {
			var feat, len,
				features = [],
				item = data[0],
				mapWkid = mymap.vWkid;

			// set mapid to layer to make the function more global for data added with
			// data toolbar
			layer.mapid = mymap.vIdName;

			// check if we need to reproject geometries
			// add layer info to first element. This way we will be able to get back to it
			// after the reprojection.
			if (mapWkid !== item.spatialReference.wkid) {
				item.attributes.layer = layer;
				gisGeo.projectGeoms(data, mapWkid, success);
			} else {
				len = data.length;
				data = data.reverse();

				// put the attributes on first level
				while (len--) {
					feat = { };
					feat = data[len].attributes;
					delete data[len].attributes;
					feat.geometry = data[len];
					features.push(feat);
				}
				features[0].layer = layer;
				success(features);
			}
		};

		createGraphic = function(geometry, key) {
			var symb,
				graphic,
				type = geometry.type;

			// from geometry type, select symbol
			if (type === 'point') {
				symb = symbPoint;
			} else if (type === 'polyline') {
				symb = symbLine;
			} else if (type === 'polygon'){
				symb = symbPoly;
			}

			// generate graphic and asign symbol
			graphic = new esriGraph(geometry);
			graphic.symbol = symb;

			// add the key to be able to find back the graphic
			graphic.key = key;

			return graphic;
		};

		zoomFeature = function(geometry) {
			var graphic = createGraphic(geometry, 'zoom');

			// clear previous graphics
			unselectFeature('zoom');

			// add graphic
			selectLayer.add(graphic);

			// zoom graphic
			gisMap.zoomFeature(mymap, graphic);

			// focus the map
			gcvizFunc.focusMap(mymap);
		};

		zoomFeatures = function(geometries) {
			var extent,
				graphic,
				graphics = [],
				len = geometries.length;

			// create an array of graphics to get extent. Do not add them
			// to the map because it is already there from the selection
			while (len--) {
				graphic = createGraphic(geometries[len], 'zoom');
				graphics.push(graphic);
			}

			// clear previous graphics
			unselectFeature('zoom');

			// get the extent then zoom
			extent = esri.graphicsExtent(graphics); // can't load AMD
			mymap.setExtent(extent.expand(1.75));

			// focus the map
			gcvizFunc.focusMap(mymap);
		};

		selectFeature = function(geometry, info) {
			var graphic = createGraphic(geometry, 'sel' + '-' + info.table + '-' + info.feat);

			// add graphic
			selectLayer.add(graphic);
		};

		selectFeaturePop = function(geometry) {
			var graphic = createGraphic(geometry, 'popup');

			// add graphic
			selectLayer.add(graphic);
		};

		unselectFeature = function(key) {
			var graphic,
				graphics = selectLayer.graphics,
				len = graphics.length;

			// get key from layer to delete
			while (len--) {
				graphic = graphics[len];
				if (graphic.key === key) {
					selectLayer.remove(graphic);
				}
			}
		};

		createIdTask = function(url, index, success) {
			// set return function
			idRtnFunc = success;

			// set layer index for identify task parameters
			layerIndex = index;

			// create id task (set the layer index on the task to retrieve it later)
			idTask = new esriIdTask(url);
			idTask.layerIndex = index;
			idTasksArr[idTaskIndex] = idTask;
			idTaskIndex++;
		};

		executeIdTask = function(event) {
			var dlTasks,
				deferred = [],
				defList = [],
				lenTask = idTasksArr.length,
				lenDef = lenTask;

			// identify tasks setup parameters
			idParams.geometry = event.mapPoint;
			idParams.mapExtent = mymap.extent;
			idParams.width = mymap.width;
			idParams.height = mymap.height;
			idParams.tolerance = 10;

			// define all deferred functions
			while (lenDef--) {
				deferred[lenDef] = new dojo.Deferred(); // bug, use the real object instead of AMD because it wont work!!!
				defList.push(deferred[lenDef]);
			}
			dlTasks = new dojoDefList(defList);
			dlTasks.then(returnIdResults);

			// returnIdentifyResults will be called after all tasks have completed
			while (lenTask--) {
				// set layer to query then excute
				idParams.layerIds = [idTasksArr[lenTask].layerIndex];
				idTasksArr[lenTask].execute(idParams, deferred[lenTask].callback);
			}
		};

		returnIdResults = function(response) {
			// send the resonse to the calling view model
			idRtnFunc(response);
		};

		setRelRecords = function(id, data) {
			relRecords[id] = data;
		};

		getRelRecords = function(layerID, objectID) {
			var outArr = [],
				items = relRecords[layerID][objectID].features,
				len = items.length;

			while (len--) {
				outArr.push(items[len].attributes);
			}
					
			return outArr;
		};

		removeEvtPop = function() {
			if (typeof idFeatures !== 'undefined') {
				idFeatures.remove();
			}
		};

		addEvtPop = function() {
			if (typeof idFeatures !== 'undefined') {
				// make sure there is no event then add it
				idFeatures.remove();
				idFeatures = mymap.on('click', executeIdTask);
			}
		};

		return {
			initialize: initialize,
			getData: getData,
			zoomFeature: zoomFeature,
			zoomFeatures: zoomFeatures,
			selectFeature: selectFeature,
			selectFeaturePop: selectFeaturePop,
			unselectFeature: unselectFeature,
			createIdTask: createIdTask,
			getRelRecords: getRelRecords,
			removeEvtPop: removeEvtPop,
			addEvtPop: addEvtPop
		};
	});
}());
