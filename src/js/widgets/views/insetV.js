/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Inset view widget
 */
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
				sources, srcLen;
			
			// find widht and height of cells
			wSize = mapSize.width/insetSize.numcol;
			hSize = (mapSize.height - 80)/insetSize.numrow;
			
			while (insetLen--) {
				inset = insetframe.insets[insetLen],
				start = inset.pos.startrowcol,
				end = inset.pos.endrowcol,
				width = (end[1] - start[1]) * wSize,
				height = (end[0] - start[0]) * hSize,
				bottom = (start[0] * hSize) + 40,
				left = start[1] * wSize,
				label = inset.label,
				node ='';
				
				if (width === 0) {width = wSize;}
				if (height === 0) {height = hSize;}	
				
				// create inset holder
				// , hasfocus: FirstName.focused, hoverToggle: \'hover\'
				$mapElem.find('.gcviz-tbfoot').before('<div id="inset' + insetLen + mapid + '" data-bind="click: insetClick" class="gcviz-inset gcviz-inset' + mapid + '" tabindex="1" style="bottom: ' + bottom + 'px; left: ' + left + 'px; width: ' + width + 'px; height: ' + height + 'px;"></div>');
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
						$inset.vType = 'image';
						
						node += '<div style="width: 100%;"><div id="slides' + insetLen + mapid + '" style="height: ' + (height - 20) + 'px;">';
						while (srcLen--) {
							var info = sources[srcLen].label;
							
							node += '<a class="lb-' + mapid + '_' + insetLen + '" data-bind="attr:{href: img[' + srcLen + ']}" data-lightbox="lb-' + mapid + '_' + insetLen + '" title="' + info.value + '">' +
									'<img class="gcviz-img-inset" data-bind="attr:{src: img[' + srcLen + ']}" alt="' + info.alttext + '"></img>' +
									'</a>';
							$inset.vSource[srcLen] = sources[srcLen].image;
						}
						node += '</div></div>';
					} else if (inset.type === 'video') {
						$inset.vType = 'video';
					
						node += '<video id="test" class="gcviz-vid-inset" style="height: ' + (height - 20) + 'px;">';
						while (srcLen--) {
							node += '<source data-bind="attr:{src: vid[' + srcLen + ']}" type="' + sources[srcLen].type + '"></source>';
							$inset.vSource[srcLen] = sources[srcLen];
						}
						node += '</video>';
					}
				} else if (inset.type === 'html') {
					var html = inset.inset;
					
					// keep the sources info
					$inset.vType = 'html';
					
					if (html.type === 'text') {
						node += '<div class="gcviz-html-inset">' + html.tag + '</div>';
					} else if (html.type === 'page') {
						node += '<iframe class="gcviz-html-inset" src="' + html.tag + '" style="height: ' + (height - 20) + 'px;"></iframe>';
					}
				}

				// append the node
				$inset.append(node);
				
				// call the viewmodel for every inset on a map
				insetVM.initialize($inset, mapid);
			}
		};
		
		return {
			initialize: initialize
		};
	});
}).call(this);