/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * GIS data functions
 */
(function () {
	'use strict';
	define(['jquery-private',
			'gcviz-func',
			'gcviz-gisgeo',
			'gcviz-gismap',
			'gcviz-vm-datagrid',
			'gcviz-vm-tbdata',
			'gcviz-vm-tblegend',
			'dojox/data/CsvStore',
			'esri/layers/FeatureLayer',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'esri/layers/KMLLayer',
			'esri/layers/FeatureLayer',
			'esri/layers/GeoRSSLayer'
	], function($viz, gcvizFunc, gisGeo, gisMap, vmDatagrid, vmTbData, vmTbLegend, esriCSVStore, esriFeatLayer, esriSR, esriPoint, esriKML, esriFL, esriGeoRSS) {
		var reorderGraphicLayer,
			addCSV,
			addKML,
			addFeatLayer,
			addGeoRSS,
			addLegend,
			finishAdd,
			createLayer,
			getSeparator,
			getFeatCollectionTemplateCSV,
			featCollection, guuid, gfileName,
			mymap;

		reorderGraphicLayer = function(map, layerId, position) {
			// check position
			if (position === -1) {
				position = map.graphicsLayerIds.length - 1;
			}
			map.reorderLayer(map.getLayer(layerId), position);
		};

		// https://developers.arcgis.com/javascript/jssamples/exp_dragdrop.html
		// we dont use the drag and drop because it is not WCAG but we use the way they
		// add CSV info on map
		addCSV = function(map, data, uuid, fileName) {
			var firstLine, separator, csvStore,
				latFields = ['lat', 'latitude', 'y', 'ycenter'], // list of lat field strings
				longFields = ['lon', 'long', 'longitude', 'x', 'xcenter'], // list of lon field strings
				def = $viz.Deferred();

			// there is 2 end of line character. If the first one doesnt work, use the other
			firstLine = data.substr(0, data.indexOf('\r'));
			if (firstLine === '') {
				firstLine = data.substr(0, data.indexOf('\n'));
			}

			// get the separator and start process
			separator = getSeparator(firstLine),
			csvStore = new esriCSVStore({
				data: data,
				separator: separator
			}),

			csvStore.fetch({
				onComplete: function (items) {
					var latField, longField, field,
						item, attrs, attributes, lenAttrs,
						attr, value, latitude, longitude, inSR, pt,
						outWkid = map.vWkid,
						ptArr = [],
						objectId = 0,
						fieldNames = csvStore.getAttributes(items[0]),
						lenNames = fieldNames.length,
						lenItems = items.length;

					// set global because they will be use in a callback after projection
					featCollection = getFeatCollectionTemplateCSV(csvStore, items);
					guuid = uuid;
					gfileName = fileName;
					mymap = map;

					// get lat long field name
					while (lenNames--) {
						field = fieldNames[lenNames];

						if (gcvizFunc.returnIndexMatch(latFields, field) !== -1) {
							latField = field;
						}
						if (gcvizFunc.returnIndexMatch(longFields, field) !== -1) {
							longField = field;
						}
					}

					// check if file is valid
					if (typeof latField === 'undefined' || typeof longField === 'undefined') {
						def.resolve(1);
					} else if (typeof csvStore.separator === 'undefined') {
						def.resolve(2);
					}

					// add feature
					while (lenItems--) {
						item = items[lenItems];
						attrs = csvStore.getAttributes(item).reverse();
						attributes = {};
						lenAttrs = attrs.length;

						// add attributes
						while (lenAttrs--) {
							attr = attrs[lenAttrs];
							value = Number(csvStore.getValue(item, attr));
							attributes[attr] = isNaN(value) ? csvStore.getValue(item, attr) : value;
						}
						attributes.__OBJECTID = objectId;
						objectId++;

						// get lat and long values
						latitude = parseFloat(attributes[latField]);
						longitude = parseFloat(attributes[longField]);
						if (isNaN(latitude) || isNaN(longitude)) {
							def.resolve(3);
							return;
						}

						// create point then add it to the array
						inSR = new esriSR({ 'wkid': 4326 }),
						pt = new esriPoint(longitude, latitude, inSR);
						pt.attributes = attributes;
						ptArr.push(pt);
					}

					// project the points and add to feature layer
					// WORKAROUND: we need to use a timeout here because if not, __OBJECTID field is not define
					// and sometimes layer will not be created.
					setTimeout(function() {
						gisGeo.projectPoints(ptArr, outWkid, createLayer);
						def.resolve(0);
					}, 0);
				},
				onError: function (error) {
					def.resolve(error.message);
				}
			});

			return def;
		};

		createLayer = function(features) {
			var featureLayer, feature, item, attr,
				len = features.length,
				config = { expand: true,
								visibility: true,
								opacity: 1,
								zoom: true };

			while (len--) {
				item = features[len];
				attr = item.attributes,
				delete item['attributes'];
				feature = {
					'geometry': item,
					'attributes': attr
				};
				featCollection.featureSet.features.push(feature);
			}

			featureLayer = new esriFeatLayer(featCollection, { 'id': guuid });
			featureLayer.name = gfileName;

			// finish add by reordering layer and add the layer to map
			finishAdd(mymap, featureLayer, config.zoom);

			// add to user array so knockout will generate legend
			// we cant add it from the VM because the projection can take few second and the symbol is not define before.
			// to avoid this, we add the layer only when it is done.
			//gArray.push({ label: gReader.fileName, id: guuid });

			// set legend
			addLegend(gfileName, guuid, 7, JSON.stringify(featureLayer.renderer.toJson()), config);

			// add the data to the datagrid
			vmDatagrid.addTab(mymap.vIdName, featCollection, gfileName, guuid);

			// there is a problem with the define. the gcviz-vm-tbdata is not able to be set.
			// With the require, we set the reference to gcviz-vm-tbdata (hard way)
			require(['gcviz-vm-tbdata'], function(vmTbData) {
				// notify toolbar data the new layer is finish
				vmTbData.notifyAdd();
			});
		};

		getSeparator = function(string) {
			var length, separator,
				separators = [',', '      ', ';', '|'],
				maxSeparatorLength = 0,
				maxSeparatorValue = '',
				len = separators.length;

			while (len--) {
				separator = separators[len],
				length = string.split(separator).length;
				if (length > maxSeparatorLength) {
					maxSeparatorLength = length;
					maxSeparatorValue = separator;
				}
			}

			return maxSeparatorValue;
		};

		getFeatCollectionTemplateCSV = function(store, items) {
			//create a feature collection for the input csv file
			var value, field, parsedValue, options,
				fields = store.getAttributes(items[0]).reverse(),
				len = fields.length,
				featCollection = {
					'layerDefinition': null,
					'featureSet': {
						'features': [],
						'geometryType': 'esriGeometryPoint'
					}
				};

			featCollection.layerDefinition = {
				'geometryType': 'esriGeometryPoint',
				'objectIdField': '__OBJECTID',
				'type': 'Feature Layer',
				'typeIdField': '',
				'drawingInfo': {
					'renderer': {
						'type': 'simple',
						'symbol': {
							'type': 'esriSMS',
							'style': 'esriSMSCircle',
							'color': gcvizFunc.getRandomColor(),
							'size': 10,
							'angle': 0,
							'xoffset': 0,
							'yoffset': 0
						}
					}
				},
				'fields': [{
					'name': '__OBJECTID',
					'alias': '__OBJECTID',
					'type': 'esriFieldTypeOID',
					'editable': false,
					'domain': null
				}],
				'types': [],
				'capabilities': 'Query'
			};

			while (len--) {
				field = fields[len];
				value = store.getValue(items[0], field);
				parsedValue = Number(value);
				options = {
					'name': field,
					'alias': field,
					'type': '',
					'editable': true,
					'domain': null
				};

				if (isNaN(parsedValue)) { //check first value and see if it is a number
					options.type = 'esriFieldTypeString';
				} else {
					options.type = 'esriFieldTypeDouble';
				}

				featCollection.layerDefinition.fields.push(options);
			}

			return featCollection;
		};

		addKML = function(map, url, uuid, fileName, config) {
			var layer,
				def = $viz.Deferred();

			layer = new esriKML(url, { outSR: new esriSR({ wkid: map.vWkid }) });
			layer.id = 'tempAddDataKML';
			layer.visible = false;

			// trap error
			layer.on('error', function(error) {
				// return info
				def.resolve(1, error.target.url);
			});

			layer.on('load', gcvizFunc.closureFunc(function(map, uuid, fileName, config, input) {
				var interval,
					graphics, lenGraphics, attributes, graphic,
					name, id, fieldName, defaultFields,
					field, fields, lenFields, outFields,
					layerDef, featureLayer,
					output = [],

					layerDefs = input.layer._fLayers,
					lenLayerDef = layerDefs.length;

				// remove the kml layer
				map.removeLayer(map.getLayer('tempAddDataKML'));

				interval = setInterval(function() {
					while (lenLayerDef--) {
						outFields = new Array(2);
						name = fileName + '-' + lenLayerDef;
						id = uuid + lenLayerDef;

						// create layer from definition
						layerDef = JSON.parse(layerDefs[lenLayerDef]._json);
						featureLayer = new esriFeatLayer(layerDef);

						// set feature layer parameters
						featureLayer.visible = config.visibility;
						featureLayer.type = 5;
						featureLayer.name = name;
						featureLayer.id = id;

						// finish add by reordering layer and add the layer to map
						finishAdd(map, featureLayer, config.zoom);

						// clean fields to keep name and description
						fields = layerDef.layerDefinition.fields;
						lenFields = fields.length;
						defaultFields ='id, snippet, visibility, styleUrl, balloonStyleText';

						while (lenFields--) {
							field = fields[lenFields];
							fieldName = field.name;

							// filter to remove default internal fields
							if (defaultFields.indexOf(fieldName) === -1) {
								if (fieldName === 'name') {
									field.alias = 'name';
									outFields[0] = field;
								} else if (fieldName === 'description') {
									field.alias = 'description';
									outFields[1] = field;
								} else {
									field.alias = fieldName;
									outFields.push(field);
								}
							}
						}
						layerDef.layerDefinition.fields = outFields;

						// loop the graphics to add to the feature layer from where they come from. It will be use in the popup
						// at the same time check if there is feature without fields. It happen when the value is null in the kml
						// the field is not created on the feature.
						graphics = featureLayer.graphics;
						lenGraphics = graphics.length;
						while (lenGraphics--) {
							graphic = graphics[lenGraphics];
							attributes = graphic.attributes;

							// set layer name
							graphic._layer.name = name;

							lenFields = outFields.length;
							while (lenFields--) {
								field = outFields[lenFields].alias;

								if (!attributes.hasOwnProperty(field)){
									attributes[field] = '';
								}
							}
						}

						// set legend
						addLegend(name, id, 7, JSON.stringify(featureLayer.renderer.toJson()), config);

						// add the data to the datagrid
						vmDatagrid.addTab(map.vIdName, layerDef, name, id);

						// add output info
						output.push({ name: name, id: id });
					}

					// layers created, remove interval
					clearInterval(interval);

					// return info
					def.resolve(0, output);
				}, 500);

			}, map, uuid, fileName, config));

			// add layer visible false because we use it only to be able to generate feature layer from it.
			// when we are done, we remove the layer.
			map.addLayer(layer);

			return def;
		};

		addFeatLayer = function(map, url, uuid, config) {
			var layer,
				def = $viz.Deferred();

			layer = new esriFL(url, {
					mode: esriFL.MODE_SNAPSHOT,
					outFields: ['*'],
					id: uuid,
					outSR: new esriSR({ wkid: map.vWkid })
				});

			// add layer visible false because we use it only to be able to generate feature layer from it.
			// when we are done, we remove the layer.
			map.addLayer(layer);

			// trap error
			layer.on('error', function(error) {
				// return info
				def.resolve(1, error.target.url);
			});

			layer.on('load', gcvizFunc.closureFunc(function(map, uuid, config, input) {
				var layer = input.layer,
					name = layer.name;

				// set legend
				layer.visible = config.visibility;
				addLegend(name, uuid, 5, JSON.stringify(layer.renderer.toJson()), config);

				// finish add by reordering layer and add the layer to map
				finishAdd(map, layer, config.zoom);

				// add the data to the datagrid
				vmDatagrid.addRestTab(url, layer);

				// return info
				def.resolve(0, { name: name, id: uuid });
			}, map, uuid, config));

			return def;
		};

		addGeoRSS = function(map, url, uuid, fileName) {
			var layer;
			layer = new esriGeoRSS(url, { outSR: new esriSR({ wkid: map.vWkid }) });
			layer.name = fileName;
			layer.id = uuid;
			map.addLayer(layer);

			// the GeoRSS layer contains one feature layer for each geometry type
			// TODO: loop trought getFEatureLayers
			layer.on('load', function(input) {
				var field,
					newFields = [],
					featLayer = input.layer.getFeatureLayers()[0],
					fields = featLayer.fields,
					lenFields = fields.length,
					graphics = featLayer.graphics,
					lenGraphs = graphics.length,
					featColl = { 'layerDefinition': {
										'fields': []
										},
										'featureSet': {
											'features': []
										}
									};

				// There hiddend key on the fields (e.g. constructor, inhireted, ...) that screw up datatable
				// to solve this, create a new array of field only for what we need.
				while (lenFields--) {
					field = fields[lenFields];
					delete field.length;
					delete field.nullable;
					if (field.name === 'id' || field.name === 'visibility') {
						fields.splice(lenFields,1);
					} else {
						newFields.push({
										'name': field.name,
										'alias': field.name,
										'type': ''
										});
					}
				}

				featColl.layerDefinition.fields = newFields;
				featColl.featureSet.features = graphics;

				// add the data to the datagrid
				vmDatagrid.addTab(input.layer._map.vIdName, featColl, 'test georss', input.layer.id);

				// remove info template to disable default esri popup
				input.layer.getLayers()[0].setInfoTemplate(null);
			});
		};

		addLegend = function(name, id, type, symbol, config) {
			var outConfig = {
					'expand': config.expand,
					'last': false,
					'type': type,
					'id': id,
					'graphid': 'custom',
					'displayfields': false,
					'label': {
						'value': name,
						'alttext': name
					},
					'metadata': {
						'enable': false
					},
					'opacity': {
						'enable': true,
						'min': 0,
						'max': 1,
						'initstate': config.opacity
					},
					'visibility': {
						'enable': true,
						'initstate': config.visibility,
						'type': 1,
						'radioid': 0
					},
					'displaychild': {
						'enable': true,
						'symbol': symbol
					},
					'customimage': {
						'enable': false,
						'images': []
					},
					'items': []
				};

			vmTbLegend.addLegend(outConfig);
		};

		finishAdd = function(mymap, layer, zoom) {
			var graphics, layerId,
				graph, geomType,
				layerIds = mymap.graphicsLayerIds,
				len = layerIds.length;

			// add layer to the map
			mymap.addLayer(layer);

			// set map scale
			layer.minScale = 0;
			layer.maxScale = 0;

			// reoder layers to make sure symbol and datagrid are on top
			if (layerIds.indexOf('gcviz-symbol') !== -1) {
				reorderGraphicLayer(mymap, 'gcviz-symbol', -1);
			}
			if (layerIds.indexOf('gcviz-datagrid') !== -1) {
				reorderGraphicLayer(mymap, 'gcviz-datagrid', -1);
			}

			// remove intern graphic layers added in the process
			while (len--) {
				layerId = layerIds[len];
				if (layerId.indexOf('graphicsLayer') !== -1) {
					mymap.removeLayer(mymap.getLayer(layerId));
				}
			}

			// get the extent then zoom. If there is only one point we need to call zoom to feature
			if (zoom) {
				graphics = layer.graphics;

				if (graphics.length === 1) {
					graph = graphics[0];
					geomType = graph.geometry.type;

					if (geomType === 'point') {
						gisMap.zoomFeature(mymap, graph);
					} else {
						gisMap.zoomGraphics(mymap, layer.graphics);
					}
				} else if (graphics.length > 1) {
					gisMap.zoomGraphics(mymap, layer.graphics);
				}
			}
		};

		return {
			addCSV: addCSV,
			addKML: addKML,
			addFeatLayer: addFeatLayer,
			addGeoRSS: addGeoRSS
		};
	});
}());
