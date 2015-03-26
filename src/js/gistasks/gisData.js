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
			'gcviz-gislegend',
			'gcviz-vm-datagrid',
			'gcviz-vm-tbdata',
			'dojox/data/CsvStore',
			'esri/layers/FeatureLayer',
			'esri/SpatialReference',
			'esri/geometry/Point',
			'esri/layers/KMLLayer',
			'esri/layers/GeoRSSLayer',
			'dojo/_base/array'
	], function($viz, gcvizFunc, gisGeo, gisMap, gisLegend, vmDatagrid, vmTbData, esriCSVStore, esriFeatLayer, esriSR, esriPoint, esriKML, esriGeoRSS, array) {
		var reorderGraphicLayer,
			addCSV,
			addKML,
			addGeoRSS,
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
				len = features.length;

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
			mymap.addLayer(featureLayer);

			// reoder layers to make sure symbol and datagrid are on top
			reorderGraphicLayer(mymap, 'gcviz-symbol', -1);
			reorderGraphicLayer(mymap, 'gcviz-datagrid', -1);

			// get the extent then zoom
			gisMap.zoomGraphics(mymap, featureLayer.graphics);
				
			// add to user array so knockout will generate legend
			// we cant add it from the VM because the projection can take few second and the symbol is not define before.
			// to avoid this, we add the layer only when it is done.
			//gArray.push({ label: gReader.fileName, id: guuid });

			// set legend symbol
			gisLegend.getFeatureLayerSymbol(JSON.stringify(featureLayer.renderer.toJson()), $viz('#symbol' + guuid)[0], guuid);

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

		addKML = function(map, url, uuid, fileName) {
			var layer;
			layer = new esriKML(url, { outSR: new esri.SpatialReference({ wkid: map.vWkid }) });
			layer.id = 'tempAddDataKML';
			layer.visible = false;

			// add layer visible false because we use it only to be able to generate feature layer from it.
			// when we are done, we remove the layer.
			map.addLayer(layer);

			layer.on('load', gcvizFunc.closureFunc(function(map, uuid, fileName, input) {
				var graphics, lenGraphics,
					name, id, fieldName,
					outFields = new Array(2),
					field, fields, lenFields,
					layerDef, jsonDef, featureLayer,
					layerDefs = input.layer._fLayers,
					lenLayerDef = layerDefs.length;

				while (lenLayerDef--) {
					name = fileName + '-' + lenLayerDef;
					id = uuid + lenLayerDef;

					// create layer from definition
					layerDef = JSON.parse(layerDefs[lenLayerDef]._json);
					featureLayer = new esriFeatLayer(layerDef);
					
					// set feature layer parameters
					featureLayer.visible = true;
					featureLayer.type = 5;
					featureLayer.name = name;
					featureLayer.id = id;
	
					// loop the graphics to add to the feature layer from where they come from. It will be use in the popup
					graphics = featureLayer.graphics;
					lenGraphics = graphics.length;
					while (lenGraphics--) {
						graphics[lenGraphics]._layer.name = name;
					}
	
					// add the feature layer and remove the kml layer
					map.addLayer(featureLayer);
					map.removeLayer(map.getLayer('tempAddDataKML'));

					// reoder layers to make sure symbol and datagrid are on top
					reorderGraphicLayer(mymap, 'gcviz-symbol', -1);
					reorderGraphicLayer(mymap, 'gcviz-datagrid', -1);

					// clean fields to keep name and description
					fields = layerDef.layerDefinition.fields;
					lenFields = fields.length;

					while (lenFields--) {
						field = fields[lenFields];
						fieldName = field.name;
						
						if (fieldName === 'name') {
							field.alias = 'name';
							outFields[0] = field;
						} else if (fieldName === 'description') {
							field.alias = 'description';
							outFields[1] = field;
						}
					}
					layerDef.layerDefinition.fields = outFields;

					// set legend symbol
					gisLegend.getFeatureLayerSymbol(JSON.stringify(featureLayer.renderer.toJson()), $viz('#symbol' + id)[0], id);

					 // add the data to the datagrid
					vmDatagrid.addTab(map.vIdName, layerDef, name, id);
				}
			}, map, uuid, fileName));
		};

		addGeoRSS = function(map, url, uuid, fileName) {
			var layer;
			layer = new esriGeoRSS(url, { outSR: new esri.SpatialReference({ wkid: map.vWkid }) });
			layer.name = fileName;
			layer.id = uuid;
			map.addLayer(layer);

			// the GeoRSS layer contains one feature layer for each geometry type
			// TODO: loop trought getFEatureLayers
			layer.on('load', function(input) {
				var field, graph, atts, lenAtts,
					newFields = [],
					featLayer = input.layer.getFeatureLayers()[0],
					fields = featLayer.fields,
					lenFields = fields.length,
					graphics = featLayer.graphics,
					lenGraphs = graphics.length,
					featColl = { 'layerDefinition': {
										'fields': [],
										},
										'featureSet': {
											'features': [],
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
										'type': '',
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

		return {
			addCSV: addCSV,
			addKML: addKML,
			addGeoRSS: addGeoRSS
		};
	});
}());
