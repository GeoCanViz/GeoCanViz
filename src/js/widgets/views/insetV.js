/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Inset view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-inset',
			'gcviz-func'
	], function(insetVM, gcvizFunc) {
		var initialize;

		initialize = function($mapElem) {
			var mapframe = $mapElem.mapframe,
				insetframe = $mapElem.insetframe,
				mapid = mapframe.id,
				mapSize = mapframe.size,
				insetLen = insetframe.insets.length,
				insetSize = insetframe.size,
				$inset,
				wSize, hSize,
				inset,start,end,width,height,bottom,left,label,node,
				sources, srcLen,
				margin,
				sizetype,
				insideHeight,
				insetsArray = [],
				headerHeight = gcvizFunc.getElemValueVM(mapid, ['header', 'headerHeight'], 'js'),
				perctHeight,
				id;

			// find widht and height of cells
			wSize = mapSize.width / insetSize.numcol;
			hSize = (mapSize.height - (headerHeight * 2)) / insetSize.numrow;

			while (insetLen--) {
				inset = insetframe.insets[insetLen],
				start = inset.pos.startrowcol,
				end = inset.pos.endrowcol,
				width = (end[1] - start[1]) * wSize,
				height = (end[0] - start[0]) * hSize,
				bottom = (start[0] * hSize) + headerHeight,
				left = start[1] * wSize,
				label = inset.label,
				insideHeight = height - (headerHeight / 2),
				sizetype = inset.size,
				node ='',
				margin = '',
				perctHeight = (insideHeight / height) * 100 + '%',
				id = 'inset' + insetLen + mapid;

				// if row/col start = row/start end, give size of 1 row/col
				if (width === 0) { width = wSize; }
				if (height === 0) { height = hSize; }

				// if size in percent
				if (sizetype === '%') {
					width = (width / mapSize.width) * 100;
					height = (height / mapSize.height) * 100;
				}

				// if bottom && top !0, add a margin to the the inset so it will not go outside the section
				if (bottom !== headerHeight && left !== 0) {
					margin = 'gcviz-inset-margin';
				}

				// create inset holder
				$mapElem.find('.gcviz-foot').before('<div id="' + id + '" data-bind="fullscreen: {}, insetVisibility: {}" class="gcviz-inset gcviz-inset' + mapid + ' ' + margin +
								'" style="' + ' bottom: ' + bottom + 'px; left: ' + left + 'px; width: ' + width + sizetype + '; height: ' + height + sizetype + ';"></div>');
				$inset = $mapElem.find('#' + id);

				// add label
				node = '<div class="gcviz-title"><h2>' + label.value + '</h2><button class="gcviz-inset-button" tabindex="0" data-bind="click: insetClick, tooltip: { content: tpLight }">' +
						'<img class="gcviz-imginset-button" data-bind="attr: { src: imgLightbox }"></img></button></div>';

				// add info
				if (inset.type === 'image' || inset.type === 'video') {
					sources = inset.inset.sources,
					srcLen = sources.length;

					// keep the sources info
					$inset.vSource = [];

					if (inset.type === 'image') {

						node += '<div style="width: 100%;"><div id="slides' + insetLen + mapid + '" class="' + id + '" style="height: ' + perctHeight + ';">';
						while (srcLen--) {
							var info = sources[srcLen].label;

							node += '<a data-bind="attr: { href: img[' + srcLen + '] }" title="' + info.value + '">' +
									'<img class="gcviz-img-inset" data-bind="attr: { src: img[' + srcLen + '] }" alt="' + info.alttext + '"></img>' +
									'</a>';
							$inset.vSource[srcLen] = sources[srcLen].image;
						}
						node += '</div></div>';
					} else if (inset.type === 'video') {

						node += '<a class="mp-link"></a><div id="' + id + 'v"><div class="gcviz-play-background" style="height: ' + perctHeight + ';">' +
								'<button class="gcviz-inset-button gcviz-play-button" tabindex="0" data-bind="click: videoClick, tooltip: { content: tpPlayVideo }"><img data-bind="attr: { src: imgPlayVideo }">' +
								'</img></button></div><video class="gcviz-vid-inset" data-bind="click: videoClick, enterkey: { func: \'stopVideo\', keyType: \'keyup keydown\' }" style="max-height: ' + perctHeight + ';">';
						while (srcLen--) {
							node += '<source data-bind="attr:{src: vid[' + srcLen + ']}" type="' + sources[srcLen].type + '"></source>';
							$inset.vSource[srcLen] = sources[srcLen];
						}
						node += '</div></video>';
					}
				} else if (inset.type === 'html') {
					var html = inset.inset;
					if (html.type === 'text') {
						node += '<a class="mp-link"></a><div id="' + id + 'h" class="gcviz-text-inset" style="height: ' + perctHeight + ';">' + html.tag + '</div>';
					} else if (html.type === 'page') {
						node += '<a class="mp-link"><div id="' + id + 'h"><iframe id="' + id + 'h" src="' + html.tag + '" style="height: ' + perctHeight + '; width:100%;" class="gcviz-frame-inset"></iframe></div>';
					}
				} else if (inset.type === 'map') {
					node += '<a class="mp-link"></a><div id="' + id + 'm" class="gcviz-map-inset ' + id + '" data-bind="enterkey: { func: \'applyKey\', keyType: \'keydown\' }" style="max-height: ' + perctHeight +
							'; width: 100%"><div id="load' + insetLen + mapid + '" class="gcviz-load-close gcviz-hidden"><img class="gcviz-load-img" src="http://jimpunk.net/Loading/wp-content/uploads/loading1.gif"/></div></div>';
				}

				// append the node
				$inset.append(node);

				// call the viewmodel for every inset on a map
				insetsArray.push(insetVM.initialize($inset, mapid, inset));
			}

			return insetsArray;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
