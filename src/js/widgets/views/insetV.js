/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Inset view widget
 */
/* global tbHeight: false */
(function() {
	'use strict';
	define(['jquery',
			'gcviz-vm-inset'
	], function($, insetVM) {
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
				insetsArray = [];
			
			// find widht and height of cells
			wSize = mapSize.width/insetSize.numcol;
			hSize = (mapSize.height - (tbHeight * 2))/insetSize.numrow;
			
			while (insetLen--) {
				inset = insetframe.insets[insetLen],
				start = inset.pos.startrowcol,
				end = inset.pos.endrowcol,
				width = (end[1] - start[1]) * wSize,
				height = (end[0] - start[0]) * hSize,
				bottom = (start[0] * hSize) + tbHeight,
				left = start[1] * wSize,
				label = inset.label,
				insideHeight = height - (tbHeight / 2),
				sizetype = inset.size,
				node ='',
				margin = '';
				
				// if row/col start = row/start end, give size of 1 row/col
				if (width === 0) { width = wSize; }
				if (height === 0) { height = hSize; }	
				
				// if size in percent
				if (sizetype === '%') {
					width = (width / mapSize.width) * 100;
					height = (height / mapSize.height) * 100;
				}

				// if bottom && top !0, add a margin to the the inset so it will not go outside the section
				if (bottom !== tbHeight && left !== 0) {
					margin = 'gcviz-inset-margin';
				}
				
				// create inset holder
				$mapElem.find('.gcviz-foot').before('<div id="inset' + insetLen + mapid + '" data-bind="fullscreen: {}, insetVisibility: {}, enterkey: insetClick, click: function(data, event){ insetClick($data, event) }" class="gcviz-inset gcviz-inset' + mapid + ' ' + margin + '" tabindex="1" style="' + ' bottom: ' + bottom + 'px; left: ' + left + 'px; width: ' + width + sizetype + '; height: ' + height + sizetype + ';"></div>');
				$inset = $mapElem.find('#inset' + insetLen + mapid);
				
				// add label
				node = '<h2>' + label.value + '</h2>';
				
				// add info
				if (inset.type === 'image' || inset.type === 'video') {
					sources = inset.inset.sources,
					srcLen = sources.length;
					
					// keep the sources info
					$inset.vSource = [];
					
					if (inset.type === 'image') {
						
						node += '<div style="width: 100%;"><div id="slides' + insetLen + mapid + '" class="inset' + insetLen + mapid + '" style="height: ' + insideHeight + 'px;">';
						while (srcLen--) {
							var info = sources[srcLen].label;
							
							node += '<a data-bind="attr:{href: img[' + srcLen + ']}" title="' + info.value + '">' +
									'<img class="gcviz-img-inset" data-bind="attr:{src: img[' + srcLen + ']}" alt="' + info.alttext + '"></img>' +
									'</a>';
							$inset.vSource[srcLen] = sources[srcLen].image;
						}
						node += '</div></div>';
					} else if (inset.type === 'video') {
					
						node += '<a class="mp-link"><div id="inset' + insetLen + mapid + 'v"><video class="gcviz-vid-inset" style="height: ' + insideHeight + 'px;">';
						while (srcLen--) {
							node += '<source data-bind="attr:{src: vid[' + srcLen + ']}" type="' + sources[srcLen].type + '"></source>';
							$inset.vSource[srcLen] = sources[srcLen];
						}
						node += '</div></video>';
					}
				} else if (inset.type === 'html') {
					var html = inset.inset;
					if (html.type === 'text') {
						node += '<a class="mp-link"></a><div id="inset' + insetLen + mapid + 'h" class="gcviz-html-inset">' + html.tag + '</div>';	
					} else if (html.type === 'page') {
						node += '<a class="mp-link"><div id="inset' + insetLen + mapid + 'h"><iframe class="gcviz-html-inset" src="' + html.tag + '" style="height: ' + insideHeight + 'px;"></iframe></div>';
					}
				} else if (inset.type === 'map') {
					node += '<a class="mp-link"></a><div id="inset' + insetLen + mapid + 'm" class="gcviz-map-inset inset' + insetLen + mapid + '" style="height: ' + insideHeight + 'px;"><div id="load' + insetLen + mapid + '" class="gcviz-load-close gcviz-hidden"><img class="gcviz-load-img" src="http://jimpunk.net/Loading/wp-content/uploads/loading1.gif"/></div></div>';
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