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
			'esri/layers/FeatureLayer'
,			'esri/symbols/SimpleLineSymbol',
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
			'esri/tasks/IdentifyParameters',
			'esri/tasks/QueryTask',
			'esri/tasks/query',
			'gcviz-gissymbol'
	], function($viz, gisMap, gisGeo, gcvizFunc, esriGraphLayer, esriFeatLayer, esriLine, esriFill, esriMarker, esriPoint, esriPoly, esriPolyline, esriSR, esriGraph, esriRequest, esriRelRequest, dojoDefList, esriIdTask, esriIdParams, esriQueryTsk, esriQuery) {
		var initialize,
			getData,
			getSelection,
			createDataArray,
			closeGetData,
			createGraphic,
			zoomFeatures,
			selectFeature,
			selectFeaturePop,
			unselectFeature,
			createIdTask,
			executeIdTask,
			setFileLayerTask,
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
			deferredGraph = [],
			idFeatures,
			idRtnFunc;

		initialize = function(map) {
			var color = [255,255,102,125],
				colorOut = [255,255,0,255];

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

			// there is a problem with the define. the gcviz-gissymbol is not able to be set. The weird thing
			// is if I replace gisgeo with gissymbol in the define, gisgeo will be set as gissymbol but I can't
			// have access to gisgeo anymore. With the require, we set the reference to gissymbol (hard way)
			require(['gcviz-gissymbol'], function(gissymb) {
				// set symbologies
				symbPoint = gissymb.getSymbPoint(color, 18, colorOut, 1);
				symbLine = gissymb.getSymbLine(color, 5 , colorOut);
				symbPoly = gissymb.getSymbPoly(colorOut, color, 1);
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
						fields = layer.fields,
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
							data = createDataArray(features, len, fields, sr, id, pos, relatedRecords);
							closeGetData(data, layer, success);

							// keep related records to be access later by popups
							setRelRecords(id, relatedRecords);
						});
					} else {
						data = createDataArray(features, len, fields, sr, id, pos);
						closeGetData(data, layer, success);
					}
				},
				error: function(err) { console.log('datagrid error: ' + err); }
			});
		};

		getSelection = function(url, wkid, geometry, success) {
			var query,
				queryTask = new esriQueryTsk(url);

			// define query
			query = new esriQuery();
			query.returnGeometry = false;
			query.outFields = ['OBJECTID'];
			query.outSpatialReference = {
				'wkid': wkid
			};
			query.geometry = geometry;
			query.spatialRelationship = esriQuery.SPATIAL_REL_INTERSECTS;
			queryTask.execute(query);

			// call the success function with the result
			queryTask.on('complete', function(evt) {
				success(evt.featureSet.features);
			});
		};

		createDataArray = function(features, len, fields, sr, id, pos, relRecords) {
			var linkLen, linkFeats, linkFeat,
				feat, geom, geometry,
				field, fieldType,
				datesLen, tmpDate, attDate, attFormat, attTmp,
				data = new Array(len),
				fieldsLen = fields.length,
				dates = [],
				flag = false,
				i = 0;

			if (typeof relRecords !== 'undefined') {
				flag = true;
			}

			// check is there field date. If so, keep name and output format
			while (i !== fieldsLen) {
				field = fields[i];
				fieldType = field.type;

				if (fieldType.informat === 'esri' && fieldType.value === 'date') {
					dates.push(field.data + ';' + fieldType.outformat);
				}
				i++;
			}
			datesLen = dates.length;

			// loop trought data
			i = 0;
			while (i !== len) {
				feat = features[i];
				geom = feat.geometry;

				// select geometry type then create geometry 
				if (typeof geom.x !== 'undefined') {
					geometry = new esriPoint({ 'x': geom.x, 'y': geom.y, 'spatialReference': sr });
				} else if (typeof geom.paths !== 'undefined') {
					geometry = new esriPolyline({ 'paths': geom.paths, 'spatialReference': sr });
				} else {
					geometry = new esriPoly({ 'rings': geom.rings, 'spatialReference': sr });
				}

				// if there is esri date field, we need to reformat them
				if (datesLen === 0) {
					geometry.attributes = feat.attributes;
				} else {
					attTmp = dates[0].split(';');
					attDate = attTmp[0];
					attFormat = attTmp[1];
					tmpDate = feat.attributes[attDate];
					if (tmpDate !== null) {
						tmpDate = new Date(tmpDate).toISOString();
						
						if (attFormat === 'long') {
							tmpDate = tmpDate.replace('T', ' - ');
						} else {
							tmpDate = tmpDate.substring(0, 10);
						}
						feat.attributes[attDate] = tmpDate;
					} else {
						feat.attributes[attDate] = '';
					}
					geometry.attributes = feat.attributes;
				}

				// add a unique id, the select checkbox and layerid
				geometry.attributes.gcvizid = pos + '-' + i;
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
				data[i] = geometry;
				i++;
			}

			return data;
		};

		closeGetData = function(data, layer, success) {
			var feat,
				i = 0,
				len = data.length,
				features = new Array(len),
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
				// put the attributes on first level
				while (i !== len) {
					feat = { };
					feat = data[i].attributes;
					feat.geometry = data[i];
					features[i] = feat;
					i++;
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

		zoomFeatures = function(geometries) {
			var extent,
				graphic,
				i = 0,
				len = geometries.length,
				graphics = new Array(len);

			// if only one element, zoom feature instead
			if (len === 1) {
				graphic = createGraphic(geometries[0], 'zoom');
				gisMap.zoomFeature(mymap, graphic);
			} else {
				// create an array of graphics to get extent. Do not add them
				// to the map because it is already there from the selection
				while (i !== len) {
					graphic = createGraphic(geometries[i], 'zoom');
					graphics[i] = graphic;
					i++;
				}

				// get the extent then zoom
				extent = esri.graphicsExtent(graphics); // can't load AMD
				mymap.setExtent(extent.expand(1.75));
			}

			// there is a bug when in full screen and do a zoom to select. There is an offset in y
			// so popup is not available. To resolve this, resize map.
			mymap.resize();

			// focus the map
			gcvizFunc.focusMap(mymap, true);
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

		createIdTask = function(url, index, id, success) {
			// set return function
			idRtnFunc = success;

			// set layer index for identify task parameters
			layerIndex = index;

			// create id task (set the layer index on the task to retrieve it later)
			// keep layer id to set on and off popup in function of visibility
			idTask = new esriIdTask(url);
			idTask.layerIndex = index;
			idTask.layerId = id;
			idTasksArr[idTaskIndex] = idTask;
			idTaskIndex++;
		};

		executeIdTask = function(event) {
			var dlTasks, idTask,
				i = 0,
				deferred = [],
				defList = [],
				lenTask = idTasksArr.length,
				lenDef = lenTask;

			// reset task for file layer
			deferredGraph = [];

			// identify tasks setup parameters
			idParams.geometry = event.mapPoint;
			idParams.mapExtent = mymap.extent;
			idParams.width = mymap.width;
			idParams.height = mymap.height;
			idParams.tolerance = 10;

			// returnIdentifyResults will be called after all tasks have completed
			while (i < lenTask) {
				// set layer to query then excute (if layer is visible)
				idTask = idTasksArr[i];
				if (mymap.getLayer(idTask.layerId).visible) {
					// define deferred functions
					deferred[i] = new dojo.Deferred(); // bug, use the real object instead of AMD because it wont work!!!
					defList.push(deferred[i]);

					// set task parameters
					idParams.layerIds = [idTask.layerIndex];
					idTask.execute(idParams, deferred[i].callback);
				}
				i++;
			}

			// launch task
			dlTasks = new dojoDefList(defList);
			dlTasks.then(returnIdResults);

			// set all the info for added file layer
			setFileLayerTask(event);
		};

		setFileLayerTask = function(event) {
			var task, results, item, layer,
				query = new esriQuery(),
				graphId = mymap.graphicsLayerIds,
				index = gcvizFunc.returnIndexMatch(graphId, 'gcviz-datagrid') + 1,
				len = graphId.length;

			// loop trought all the file layer added with add data
			query.geometry = gisGeo.createExtent(event.mapPoint, mymap, 10);
			while (index < len) {
				layer = mymap.getLayer(graphId[index]);

				// do it only for visible layer
				if (layer.visible) {
					task = layer.selectFeatures(query, esriFeatLayer.SELECTION_NEW);
	
					// use same syntax as id task for url layer
					results = task.results[0][0][0];
	
					// if there is no item, the results will be undefined
					if (typeof results !== 'undefined') {
						item = {
								0: true,
								1: [{
									'layerName': results._layer.name,
									'feature': {
										'attributes': results.attributes,
										'geometry': results.geometry
									}
									}]
						};
						deferredGraph.push(item);
					}
				}

				index++;
			}
		};

		returnIdResults = function(response) {
			var len = deferredGraph.length;

			// add items from graphic layer added to map
			while (len--) {
				response.push(deferredGraph[len]);
			}

			// send the resonse to the calling view model
			idRtnFunc(response);
		};

		setRelRecords = function(id, data) {
			relRecords[id] = data;
		};

		getRelRecords = function(layerID, objectID) {
			var i = 0,
				items = relRecords[layerID][objectID].features,
				len = items.length,
				outArr = new Array(len);

			while (i !== len) {
				outArr[i] = (items[i].attributes);
				i++;
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
			getSelection: getSelection,
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
