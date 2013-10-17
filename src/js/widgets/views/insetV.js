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
				types, typeLen, sources, srcLen;
			
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
				if (inset.type === 'image') {
					types = inset.image.images,
					typeLen = types.length;
					
					// keep the sources info
					$inset.vType = 'image';
					$inset.vSource = [];
					
					node += '<div id="slides' + insetLen + mapid + '" style="width: ' + width + 'px; height: ' + (height - 20) + 'px; float: left;">';
					while (typeLen--) {
						node += '<img class="gcviz-img-inset" data-bind="attr:{src: img[' + typeLen + ']}"></img>';
						$inset.vSource[typeLen] = types[typeLen].sources;
					}
					node += '</div>';
				} else if (inset.type === 'video') {
					types = inset.video.videos,
					typeLen = types.length;
					
					// keep the sources info
					$inset.vType = 'video';
					$inset.vSource = [];
					
					while (typeLen--) {
						sources = types[typeLen].sources,
						srcLen = sources.length;
						
						node += '<video id="test" class="gcviz-vid-inset">';
						
						while (srcLen--) {
							node += '<source data-bind="attr:{src: vid[' + typeLen + ']}" type="' + sources[srcLen].type + '"></source>';
							$inset.vSource[typeLen] = types[typeLen].sources;
						}
						
						node += '</video>';
					}
				} else if (inset.type === 'html') {
					types = inset.html.htmls,
					typeLen = types.length;
					
					// keep the sources info
					$inset.vType = 'html';
					
					while (typeLen--) {
						
						if (types[typeLen].type === 'text') {
							node += types[typeLen].tag;
						} else if (types[typeLen].type === 'page') {
							node += '<iframe src="' + types[typeLen].tag + '"></iframe>'
						}
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