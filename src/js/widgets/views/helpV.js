/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Help widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-help'
	], function(helpVM) {
		var initialize,
			getDrawHelp;

		initialize = function($mapElem) {
			var $help,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find the help dialog box
			$mapElem.find('#' + mapid).append('<div class="gcviz-help"></div>');
			
			$help = $mapElem.find('.gcviz-help');
			
			// the full help dialog window
			node += '<div id="help-' + mapid + '" data-bind="uiDialog: { title: $root.lblHelpTitle, width: 600, height: 350, ok: $root.dialogHelpOk, close: $root.dialogHelpOk, openDialog: \'isHelpDialogOpen\' }">' +
						// menu
						'<section id="gcviz-help-menu" class="gcviz-help">' +
							'<ul>' +
								'<li><a href="#gcviz-help-over" data-bind="text: overTitle"></a></li>' +
								'<li><a href="#gcviz-help-draw" data-bind="text: drawTitle"></a></li>' +
							'</ul>' +
						'</section>';

			// application overview
			node += '<section id="gcviz-help-over" class="gcviz-help">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: overTitle"></span>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc1"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc2"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc2"></span></div>' +
					'</section>';
						
            // toolbar draw
			node += getDrawHelp();
			
			// close div
			node += '</div>';

			// the contextual help dialog window. The content will be populated when user click on a bubble
			node += '<div id="helpbubble-' + mapid + '" data-bind="uiDialog: { title: $root.lblHelpBubbleTitle, width: 600, height: 220, ok: $root.dialogHelpBubbleOk, close: $root.dialogHelpBubbleOk, openDialog: \'isHelpBubbleDialogOpen\' }">' +
						'<section id="gcviz-bubble"></section>' +
					'</div>';

			$help.append(node);
			return(helpVM.initialize($help, mapid));
		};
		
		getDrawHelp = function() {
 			var node = '';
 			
 			node = '<section id="gcviz-help-tbdraw" class="gcviz-help">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: drawTitle"></span>' +
						'<div class="row">' +
							'<div class="span4 gcviz-draw-cholder">' +
								'<button class="gcviz-draw-black" tabindex="-1"</button>' +
								'<button class="gcviz-draw-blue" tabindex="-1"></button>' +
								'<button class="gcviz-draw-green" tabindex="-1"></button>' +
								'<button class="gcviz-draw-red" tabindex="-1"></button>' +
								'<button class="gcviz-draw-yellow" tabindex="-1"></button>' +
								'<button class="gcviz-draw-white" tabindex="-1"></button>' +
								'<button class="gcviz-draw-arrow" tabindex="-1"></button>' +
							'</div>' +
							'<span class="span8 gcviz-help-textbtn" data-bind="text: drawColorSelect"></span>' +
						'</div>' +		
						'<div class="row"><div class="row span12">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-line" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawLine"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-text" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawText"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-length" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawLength"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-area" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawArea"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-del" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawEraseAll"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-delsel" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawEraseSel"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-undo" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawUndo"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-redo" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawRedo"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-imp" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawImport"></span>' +
						'</div>' +
						'<div class="row">' +
	            			'<div class="span1">' +
								'<button class="gcviz-draw-exp" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: drawExport"></span>' +
						'</div>' +
            		'</section>';
			
			return node;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
