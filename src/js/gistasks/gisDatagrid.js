/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS datagrids functions
 */
/* global dojo: false */
(function () {
	'use strict';
	define(['jquery-private',
			'gcviz-gismap',
			'gcviz-gisgeo',
			'gcviz-func',
			'esri/layers/GraphicsLayer',
			'esri/layers/FeatureLayer',
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
			drawSpatialExtent,
			showSpatialExtent,
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
			gMapid,
			params = { };

		initialize = function(map) {
			var idParams,
				param = { },
				color = [224,255,255,50],
				colorOut = [0,255,255,255],
				spatial = [230, 230, 250, 50],
				spatialOut = [221, 160, 221, 255],
				graphIds = map.graphicsLayerIds;

			param.wkid = map.vWkid;
			param.mapid =  map.vIdName;
			param.map = map;

			// event and params for identify task
			param.idFeatures = map.on('click', executeIdTask);
			idParams = new esriIdParams();
			idParams.tolerance = 3;
			idParams.returnGeometry = true;
			idParams.layerOption = esriIdParams.LAYER_OPTION_VISIBLE; // layer option all
			param.idParams = idParams;

			// add the graphic layers to the map and set global variable
			map.addLayer(new esriGraphLayer({ id: 'gcviz-datagrid' }));
			param.selectLayer = map.getLayer('gcviz-datagrid');

			// get the last layer loaded from service id. If there is no layer before symbol and datagrid
			// set lastLayerId to -1
			param.lastLayerId = graphIds[graphIds.length - 3];
			if (typeof lastLayerId === 'undefined') {
				param.lastLayerId = -1;
			}

			// there is a problem with the define. the gcviz-gissymbol is not able to be set. The weird thing
			// is if I replace gisgeo with gissymbol in the define, gisgeo will be set as gissymbol but I can't
			// have access to gisgeo anymore. With the require, we set the reference to gissymbol (hard way)
			require(['gcviz-gissymbol'], function(gissymb) {
				// set symbologies
				param.symbPoint = gissymb.getSymbPoint(color, 14, colorOut, 1.5);
				param.symbLine = gissymb.getSymbLine(colorOut, 3);
				param.symbPoly = gissymb.getSymbPoly(colorOut, color, 1.5);
				param.symbSpatial = gissymb.getSymbPoly(spatialOut, spatial, 1);
			});

			// set params for futher use
			param.relRecords = {};
			param.idTasksArr = [];
			param.idTaskIndex = 0;
			param.deferredGraph = [];

			params[map.vIdName] = param;
		};

		getData = function(mapid, url, layer, success) {
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
						len = features.length,
						map = params[mapid].map;

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
						relatedQuery.relationshipId = linkInfo.relationshipid;
						relatedQuery.objectIds = gcvizFunc.getObjectIds(response.features);

						// query the link table
						featLayer = map.getLayer(id);
						featLayer.queryRelatedFeatures(relatedQuery, function(relatedRecords) {
							data = createDataArray(features, len, fields, sr, id, pos, relatedRecords);
							closeGetData(mapid, data, layer, success);

							// keep related records to be access later by popups
							setRelRecords(mapid, id, relatedRecords);
						});
					} else {
						data = createDataArray(features, len, fields, sr, id, pos);
						closeGetData(mapid, data, layer, success);
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
				fieldType = field.fieldtype;

				if (fieldType.informat === 1 && fieldType.value === 3) {
					dates.push(field.data + ';' + fieldType.outformat);
				}
				i++;
			}

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
				datesLen = dates.length;
				while (datesLen--) {
					attTmp = dates[datesLen].split(';');
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
				}

				// set attributes
				geometry.attributes = feat.attributes;

				// add a unique id, the select checkbox and layerid
				geometry.attributes.gcvizid = pos + '-' + i;
				geometry.attributes.gcvizcheck = false;
				geometry.attributes.gcvizspatial = false;
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

		closeGetData = function(mapid, data, layer, success) {
			var feat,
				i = 0,
				len = data.length,
				features = new Array(len),
				item = data[0],
				mapWkid = params[mapid].wkid;

			// set mapid to layer to make the function more global for data added with
			// data toolbar
			layer.mapid = mapid;

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

		createGraphic = function(mapid, geometry, key, spatial) {
			var symb,
				graphic,
				type = geometry.type;

			// from geometry type, select symbol
			if (!spatial) {
				if (type === 'point') {
					symb = params[mapid].symbPoint;
				} else if (type === 'polyline') {
					symb = params[mapid].symbLine;
				} else if (type === 'polygon'){
					symb = params[mapid].symbPoly;
				}
			} else {
				symb = params[mapid].symbSpatial;
			}

			// generate graphic and asign symbol
			graphic = new esriGraph(geometry);
			graphic.symbol = symb;

			// add the key to be able to find back the graphic
			graphic.key = key;

			return graphic;
		};

		zoomFeatures = function(mapid, geometries) {
			var graphic,
				i = 0,
				len = geometries.length,
				graphics = new Array(len),
				map = params[mapid].map;

			// if only one element, zoom feature instead
			if (len === 1) {
				graphic = createGraphic(mapid, geometries[0], 'zoom', false);
				gisMap.zoomFeature(map, graphic);
			} else {
				// create an array of graphics to get extent. Do not add them
				// to the map because it is already there from the selection
				while (i !== len) {
					graphic = createGraphic(mapid, geometries[i], 'zoom', false);
					graphics[i] = graphic;
					i++;
				}

				// get the extent then zoom
				gisMap.zoomGraphics(map, graphics);
			}

			// there is a bug when in full screen and do a zoom to select. There is an offset in y
			// so popup is not available. To resolve this, resize map.
			map.resize();

			// focus the map
			require(['gcviz-vm-map'], function(mapVM) {
				mapVM.focusMap(mapid, true);
			});
		};

		drawSpatialExtent = function(mapid, geometry, key) {
			var graphic = createGraphic(mapid, geometry, key, true);

			// remove previous graphic then add new graphic
			unselectFeature(mapid, key);
			params[mapid].selectLayer.add(graphic);
		};

		showSpatialExtent = function(mapid, key) {
			var graphic,
				graphics = params[mapid].selectLayer.graphics,
				len = graphics.length;

			while (len--) {
				graphic = graphics[len];
				if (graphic.key === key) {
					graphic.show();
				} else {
					graphic.hide();
				}
			}
		};

		selectFeature = function(mapid, geometry, info) {
			var graphic = createGraphic(mapid, geometry, 'sel' + '-' + info.table + '-' + info.feat, false);

			// remove previous graphic then add new graphic
			params[mapid].selectLayer.add(graphic);
		};

		selectFeaturePop = function(mapid, geometry) {
			var graphic = createGraphic(geometry, 'popup', false);

			// add graphic
			params[mapid].selectLayer.add(graphic);
		};

		unselectFeature = function(mapid, key) {
			var graphic,
				selectLayer = params[mapid].selectLayer,
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

		createIdTask = function(mapid, url, index, id, type, success) {
			var idTask,
				param = params[mapid];

			// set return function
			param.idRtnFunc = success;

			// create id task (set the layer index on the task to retrieve it later)
			// keep layer id to set on and off popup in function of visibility
			idTask = new esriIdTask(url);
			idTask.layerIndex = index;
			idTask.layerId = id;
			idTask.layerType = type;
			param.idTasksArr[param.idTaskIndex] = idTask;
			param.idTaskIndex++;
		};

		executeIdTask = function(event) {
			var dlTasks, idTask,
				info, layerType, layerIndex, lyrDef,
				layer, arrDef,
				i = 0,
				mapid = event.currentTarget.id.split('_')[0],
				deferred = [],
				defList = [],
				param = params[mapid],
				idParams = param.idParams,
				idTasksArr = param.idTasksArr,
				lenTask = idTasksArr.length,
				map = param.map;

			// reset task for file layer
			param.deferredGraph = [];

			// set all the info for added file layer
			setFileLayerTask(event, mapid);

			// returnIdentifyResults will be called after all tasks have completed
			while (i < lenTask) {
				info = idTasksArr[i];
				layerType = info.layerType;
				layerIndex = info.layerIndex;
				layer = map.getLayer(info.layerId);

				// identify tasks setup parameters
				idParams.geometry = event.mapPoint;
				idParams.mapExtent = map.extent;
				idParams.width = map.width;
				idParams.height = map.height;
				idParams.tolerance = 10;

				// set definition query
				if (layerType === 4) {
					arrDef = layer.layerDefinitions;
				} else if (layerType === 5) {
					lyrDef = layer.getDefinitionExpression();
					if (typeof lyrDef === 'undefined') {
						lyrDef = '';
					}

					arrDef = new Array(layerIndex + 1);
					arrDef[layerIndex] = lyrDef;
				}
				idParams.layerDefinitions = arrDef;

				// set layer to query then excute (if layer is visible)
				idTask = idTasksArr[i];
				if (layer.visible) {
					// define deferred functions
					deferred[i] = new dojo.Deferred(); // bug, use the real object instead of AMD because it wont work!!!
					defList.push(deferred[i]);

					// set task parameters and execute
					idParams.layerIds = [idTask.layerIndex];
					idTask.execute(idParams, deferred[i].callback);
				}
				i++;
			}

			// launch task (put a time out to let the file layer be executed before)
			setTimeout(function() {
				gMapid = mapid;
				dlTasks = new dojoDefList(defList);
				dlTasks.then(returnIdResults);
			}, 100);
		};

		setFileLayerTask = function(event, mapid) {
			var task, results, item, layer, featLen,
				feature, features,
				index,
				query = new esriQuery(),
				param = params[mapid],
				lastLayerId = param.lastLayerId,
				map = param.map,
				graphId = map.graphicsLayerIds,
				len = graphId.length - 2; // gcviz-symbol and gcviz-datagrid

			// if !== -1, use layer id to find index. If === -1, no layer was added at init, use 0.
			if (lastLayerId !== -1) {
				index = gcvizFunc.returnIndexMatch(graphId, lastLayerId) + 1;
			} else {
				index = 0;
			}

			// loop trought all the file layer added with add data
			query.geometry = gisGeo.createExtent(event.mapPoint, map, 10);
			while (index < len) {
				layer = map.getLayer(graphId[index]);

				// do it only for visible layer, not internal esri graphic layer or REST feature layer
				if (layer.visible && layer.id.search('graphicsLayer') !== 0 && layer.id.search('gcviz-') !== 0 && layer.type !== 'Feature Layer') {
					task = layer.selectFeatures(query, esriFeatLayer.SELECTION_NEW);

					// reset feature
					features = [];

					// use same syntax as id task for url layer
					results = task.results[0][0];
					featLen = results.length;

					while (featLen--) {
						feature = results[featLen];
						features.push({
								'layerName': feature._layer.name,
								'feature': {
									'attributes': feature.attributes,
									'geometry': feature.geometry
								}
						});
					}

					// if there is features, create the deferred object
					if (features.length > 0) {
						item = {
								0: true,
								1: features
						};
						param.deferredGraph.push(item);
					}
				}

				index++;
			}
		};

		returnIdResults = function(response) {
			var mapid = gMapid,
				deferredGraph = params[mapid].deferredGraph,
				len = deferredGraph.length;

			// clean global mapid
			gMapid = '';

			// clean response if all layer are not visible
			if (response[0] === 0) {
				response.shift();
			}

			if (response[0].length === 0) {
				response.shift();
			}

			// add items from graphic layer added to map
			while (len--) {
				response.push(deferredGraph[len]);
			}

			// send the resonse to the calling view model
			params[mapid].idRtnFunc(response);
		};

		setRelRecords = function(mapid, id, data) {
			params[mapid].relRecords[id] = data;
		};

		getRelRecords = function(mapid, layerID, objectID) {
			var i = 0,
				items = params[mapid].relRecords[layerID][objectID].features,
				len = items.length,
				outArr = new Array(len);

			while (i !== len) {
				outArr[i] = (items[i].attributes);
				i++;
			}

			return outArr;
		};

		removeEvtPop = function(mapid) {
			var param = params[mapid];

			if (typeof param !== 'undefined') {
				params[mapid].idFeatures.remove();
			}
		};

		addEvtPop = function(mapid) {
			var param = params[mapid];

			if (typeof param !== 'undefined') {
				// make sure there is no event then add it
				param.idFeatures.remove();
				param.idFeatures = param.map.on('click', executeIdTask);
			}
		};

		return {
			initialize: initialize,
			getData: getData,
			getSelection: getSelection,
			zoomFeatures: zoomFeatures,
			drawSpatialExtent: drawSpatialExtent,
			showSpatialExtent: showSpatialExtent,
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
