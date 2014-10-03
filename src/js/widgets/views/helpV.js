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
		var initialize;

		initialize = function($mapElem) {
			var $help,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find the help dialog box
			$mapElem.find('#' + mapid).append('<div class="gcviz-help"></div>');
			
			$help = $mapElem.find('.gcviz-help');
			
			// the full help dialog window
			node += '<div id="help-' + mapid + '" data-bind="uiDialog: { title: $root.lblHelpTitle, width: 350, height: 220, ok: $root.dialogHelpOk, close: $root.dialogHelpOk, openDialog: \'isHelpDialogOpen\' }">' +
						 // menu
            			'<section id="gcviz-help-menu">' +
            				'<span data-bind="text: urlLogo"></span>' +
            			'</section>' +

             			// toolbar draw
            			'<section id="gcviz-help-tbdraw">' +
            				'<span data-bind="text: urlLogo"></span>' +
            			'</section>' +
					'</div>';
			
			// the contextual help dialog window
			node += '<div id="helpbubble-' + mapid + '" data-bind="uiDialog: { title: $root.lblHelpBubbleTitle, width: 350, height: 220, ok: $root.dialogHelpBubbleOk, close: $root.dialogHelpBubbleOk, openDialog: \'isHelpBubbleDialogOpen\' }">' +
						'<section id="gcviz-bubble"></section>' +
					'</div>';

			$help.append(node);
			return(helpVM.initialize($help, mapid));
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
