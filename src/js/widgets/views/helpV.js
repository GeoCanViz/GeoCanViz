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
			getKeyHelp,
			getHeaderHelp,
			getDrawHelp,
			getNavHelp,
			getDataHelp;

		initialize = function($mapElem) {
			var $help,
				mapid = $mapElem.mapframe.id,
				node = '';

			// find the help dialog box
			$mapElem.find('#' + mapid).append('<div class="gcviz-help"></div>');

			$help = $mapElem.find('.gcviz-help');

			// the full help dialog window
			node += '<div id="help-' + mapid + '" class="gcviz-help-sect" data-bind="uiDialog: { title: $root.lblHelpTitle, width: 600, height: 350, ok: $root.dialogHelpOk, close: $root.dialogHelpOk, openDialog: \'isHelpDialogOpen\' }">' +
						// menu
						'<section id="gcviz-help-menu" class="gcviz-help">' +
							'<ul>' +
								'<li><a href="#gcviz-help-over" data-bind="text: overTitle, click: function() { scrollTo(\'over\') }"></a></li>' +
								'<li><a href="#gcviz-help-key" data-bind="text: keyTitle, click: function() { scrollTo(\'key\') }"></a></li>' +
								'<li><a href="#gcviz-help-head" data-bind="text: headTitle, click: function() { scrollTo(\'head\') }"></a></li>' +
								'<li><a href="#gcviz-help-tbdraw" data-bind="text: drawTitle, click: function() { scrollTo(\'draw\') }"></a></li>' +
								'<li><a href="#gcviz-help-tbnav" data-bind="text: navTitle, click: function() { scrollTo(\'nav\') }"></a></li>' +
								'<li><a href="#gcviz-help-tbdata" data-bind="text: dataTitle, click: function() { scrollTo(\'data\') }"></a></li>' +
							'</ul>' +
						'</section>';

			// application overview
			node += '<section id="gcviz-help-over" class="gcviz-help gcviz-help-over">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: overTitle"></span>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc1"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc2"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc2"></span></div>' +
					'</section>';

			// get keyboard navigation help
			node += getKeyHelp();

			// header
			node += getHeaderHelp();

            // toolbar draw
			node += getDrawHelp();

			// toolbar navigation
			node += getNavHelp();

			// toolbar navigation
			node += getDataHelp();

			// close div
			node += '</div>';

			// the contextual help dialog window. The content will be populated when user click on a bubble
			node += '<div id="helpbubble-' + mapid + '" class="gcviz-help-sect" data-bind="uiDialog: { title: $root.lblHelpBubbleTitle, width: 600, height: 350, ok: $root.dialogHelpBubbleOk, close: $root.dialogHelpBubbleOk, openDialog: \'isHelpBubbleDialogOpen\' }">' +
						'<section id="gcviz-bubble"></section>' +
					'</div>';

			$help.append(node);
			return(helpVM.initialize($help, mapid));
		};

		getKeyHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-key" class="gcviz-help gcviz-help-key">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: keyTitle"></span>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyFocusNextTitle"></span>' +
							'<span class="span9" data-bind="text: keyFocusNext"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyFocusPrevTitle"></span>' +
							'<span class="span9" data-bind="text: keyFocusPrev"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyZoomTitle"></span>' +
							'<span class="span9" data-bind="text: keyZoom"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyPanTitle"></span>' +
							'<span class="span9" data-bind="text: keyPan"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyEnterTitle"></span>' +
							'<span class="span9" data-bind="text: keyEnter"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keySpaceTitle"></span>' +
							'<span class="span9" data-bind="text: keySpace"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: keyWCAGTitle"></span>' +
							'<span class="span9" data-bind="text: keyWCAG"></span>' +
						'</div>' +
					'</section>';

			return node;
		};

		getHeaderHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-head" class="gcviz-help gcviz-help-head">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: headTitle"></span>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-help" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headHelp"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-about" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headAbout"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-print" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headPrint"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-fs" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headFS"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span1 gcviz-help-textsub" data-bind="text: headMenuTitle"></span>' +
							'<span class="span11" data-bind="text: headMenu"></span>' +
						'</div>' +
					'</section>';

			return node;
		};

		getDrawHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-tbdraw" class="gcviz-help gcviz-help-tbdraw">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: drawTitle"></span>' +
						'<div class="row">' +
							'<div class="span4 gcviz-draw-cholder">' +
								'<button class="gcviz-draw-black" tabindex="-1"</button>' +
								'<button class="gcviz-draw-blue" tabindex="-1"></button>' +
								'<button class="gcviz-draw-green" tabindex="-1"></button>' +
								'<button class="gcviz-draw-red" tabindex="-1"></button>' +
								'<button class="gcviz-draw-yellow" tabindex="-1"></button>' +
								'<button class="gcviz-draw-white" tabindex="-1"></button>' +
							'</div>' +
							'<span class="span8 gcviz-help-textbtn" data-bind="text: drawColorSelect"></span>' +
						'</div>' +
						'<div class="row">' +
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

		getNavHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-tbnav" class="gcviz-help gcviz-help-tbnav">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: navTitle"></span>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: navZoomtoTitle"></span>' +
							'<span class="span9" data-bind="text: navZoomto"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-nav-pos" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: navPos"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span6">' +
								'<img class="gcviz-help-img" data-bind="attr: { src: imgHelpOV, title: navAltOV }"></img>' +
							'</div>' +
							'<span class="span6 gcviz-help-textbtn" data-bind="text: navOV"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: navScalebarTitle"></span>' +
							'<span class="span9" data-bind="text: navScalebar"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span3 gcviz-help-textsub" data-bind="text: navScaleTitle"></span>' +
							'<span class="span9" data-bind="text: navScalebar"></span>' +
						'</div>' +
					'</section>';

			return node;
		};

		getDataHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-tbdata" class="gcviz-help gcviz-help-tbdata">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: dataTitle"></span>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-data-add" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: dataAdd"></span>' +
						'</div>' +
						'<div class="row">' +
							'<span class="span2 gcviz-help-textsub" data-bind="text: dataSampleTitle"></span>' +
							'<div class="span10">' +
								'<div class="row">' +
									'<div class="span4">' +
										'<img class="gcviz-help-img" data-bind="attr: { src: imgHelpDataSamp, title: dataSample }"></img>' +
									'</div>' +
									'<span class="span6" data-bind="text: dataSample"></span>' +
								'</div>' +
								'<div class="row">' +
									'<div class="span2">' +
										'<button class="gcviz-data-del" tabindex="-1"</button>' +
									'</div>' +
									'<span class="span8 gcviz-help-textbtn" data-bind="text: dataRemove"></span>' +
							'</div>' +
							'</div>' +
						'</div>' +
					'</section>';

			return node;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
