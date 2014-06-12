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
			'gcviz-gislegend',
			'dojox/data/CsvStore',
			'esri/layers/FeatureLayer',
			'esri/SpatialReference',
			'esri/geometry/Point'
	], function($viz, gcvizFunc, gisGeo, gisLegend, esriCSVStore, esriFeatLayer, esriSR, esriPoint) {
		var addCSV,
			createLayer,
			getSeparator,
			getFeatCollectionTemplateCSV,
			featCollection, guuid,
			mymap;

		// https://developers.arcgis.com/javascript/jssamples/exp_dragdrop.html
		// we dont use the drag and drop because it is not WCAG but we use the way they
		// add CSV info on map
		addCSV = function(map, data, uuid)  {
			var latFields = ['lat', 'latitude', 'y', 'ycenter'], // list of lat field strings
				longFields = ['lon', 'long', 'longitude', 'x', 'xcenter'], // list of lon field strings
				firstLine = data.substr(0, data.indexOf('\n')),
				separator = getSeparator(firstLine),
				csvStore = new esriCSVStore({
					data: data,
					separator: separator
				});

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
					mymap = map;

					// get lat long field name
					while (lenNames--) {
						field = fieldNames[lenNames];

						if (gcvizFunc.checkMatch(latFields, field)) {
							latField = field;
						}
						if (gcvizFunc.checkMatch(longFields, field)) {
							longField = field;
						}
					}

					// add feature
					while (lenItems--) {
						item = items[lenItems];
						attrs = csvStore.getAttributes(item);
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
							return;
						}

						// create point then add it to the array
						inSR = new esriSR({ 'wkid': 4326 }),
						pt = new esriPoint(longitude, latitude, inSR);
						pt.attributes = attributes;
						ptArr.push(pt);
					}

					// project the points and add to feature layer
					gisGeo.projectPoints(ptArr, outWkid, createLayer);
				},
				onError: function (error) {
					console.error('Error fetching items from CSV store: ', error);
				}
			});
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
			mymap.addLayer(featureLayer);

			// set legend symbol
			gisLegend.getFeatureLayerSymbol(JSON.stringify(featureLayer.renderer.toJson()), $viz('#symbol' + guuid)[0], guuid);
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

		return {
			addCSV: addCSV
		};
	});
}());
