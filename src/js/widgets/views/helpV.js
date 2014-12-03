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
			getMapTools,
			getFooterHelp,
			getHeaderHelp,
			getDrawHelp,
			getNavHelp,
			getLegHelp,
			getDataHelp,
			getDevHelp;

		initialize = function($mapElem) {
			var $help,
				mapid = $mapElem.mapframe.id,
				head = $mapElem.header,
				foot = $mapElem.footer,
				map = $mapElem.mapframe.map,
				tbDraw = $mapElem.toolbardraw,
				tbLeg = $mapElem.toolbarlegend,
				tbNav = $mapElem.toolbarnav,
				tbData = $mapElem.toolbardata,
				node = '';

			// find the help dialog box
			$mapElem.find('#' + mapid).append('<div class="gcviz-help-cont"></div>');

			$help = $mapElem.find('.gcviz-help-cont');

			// the full help dialog window
			node += '<div id="help-' + mapid + '" class="gcviz-help-sect" data-bind="uiDialog: { title: lblHelpTitle, width: 600, height: 350, ok: dialogHelpOk, close: dialogHelpOk, openDialog: \'isHelpDialogOpen\', modal: false, draggable: true }">' +
						// menu
						'<section id="gcviz-help-menu" class="gcviz-help">' +
							'<ul>' +
								'<li><a href="#gcviz-help-over" data-bind="text: overTitle, click: function() { scrollTo(\'over\') }"></a></li>' +
								'<li><a href="#gcviz-help-key" data-bind="text: keyTitle, click: function() { scrollTo(\'key\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noMap }"><a href="#gcviz-help-map" data-bind="text: mapTitle, click: function() { scrollTo(\'map\') }"></a></li>' +
								'<li><a href="#gcviz-help-head" data-bind="text: headTitle, click: function() { scrollTo(\'head\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noFoot }"><a href="#gcviz-help-foot" data-bind="text: footTitle, click: function() { scrollTo(\'foot\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noDraw }"><a href="#gcviz-help-tbdraw" data-bind="text: drawTitle, click: function() { scrollTo(\'draw\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noNav }"><a href="#gcviz-help-tbnav" data-bind="text: navTitle, click: function() { scrollTo(\'nav\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noLeg }"><a href="#gcviz-help-tbleg" data-bind="text: legTitle, click: function() { scrollTo(\'leg\') }"></a></li>' +
								'<li data-bind="css: { \'gcviz-hidden\': noData }"><a href="#gcviz-help-tbdata" data-bind="text: dataTitle, click: function() { scrollTo(\'data\') }"></a></li>' +
								'<li><a href="#gcviz-help-dev" data-bind="text: devTitle, click: function() { scrollTo(\'dev\') }"></a></li>' +
							'</ul>' +
						'</section>';

			// application overview
			node += '<section id="gcviz-help-over" class="gcviz-help gcviz-help-over">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: overTitle"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc1"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: overDesc2"></span></div>' +
					'</section>';

			// get keyboard navigation help
			node += getKeyHelp();

			// get map tools navigation
			node += getMapTools(map);

			// header
			node += getHeaderHelp(head);

			// footer
			node += getFooterHelp(foot);

			// toolbar draw
			node += getDrawHelp(tbDraw);

			// toolbar navigation
			node += getNavHelp(tbNav);

			// toolbar legend
			node += getLegHelp(tbLeg);

			// toolbar data
			node += getDataHelp(tbData);

			// developer's corner
			node += getDevHelp();

			// close div
			node += '</div>';

			// the contextual help dialog window. The content will be populated when user click on a bubble
			node += '<div id="helpbubble-' + mapid + '" class="gcviz-help-sect" data-bind="uiDialog: { title: lblHelpBubbleTitle, width: 600, height: 350, ok: dialogHelpBubbleOk, close: dialogHelpBubbleOk, openDialog: \'isHelpBubbleDialogOpen\', modal: false, draggable: true }">' +
						'<section id="gcviz-bubble"></section>' +
					'</div>';

			$help.append(node);
			return(helpVM.initialize($help, mapid));
		};

		getKeyHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-key" class="gcviz-help gcviz-help-key">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: keyTitle"></span></div>' +
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
						'<div class="row">' +
							'<span class="span12" data-bind="text: keyPref"></span>' +
						'</div>' +
					'</section>';

			return node;
		};

		getMapTools = function(config) {
			var zoom = config.zoombar,
				zoommax = zoom.zoom,
				zoombar = zoom.bar,
				node = '';

			if (zoommax || zoombar) {
				node = '<section id="gcviz-help-map" class="gcviz-help gcviz-help-map">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: mapTitle"></span></div>';

				if (zoommax) {
					node +='<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-map-zoommax" tabindex="-1"</button>' +
								'</div>' +
								'<span class="span11" data-bind="text: mapZoom"></span>' +
							'</div>';
				}

				if (zoombar) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<img class="gcviz-foot-logo" data-bind="attr: { src: imgHelpZoombar, alt: devLogoAlt }" tabindex="-1"></img>' +
								'</div>' +
								'<span class="span11" data-bind="text: mapZoombar"></span>' +
							'</div>';
				}

				node += '</section>';
			}

			return node;
		};

		getHeaderHelp = function(config) {
			var menu = config.tools.enable,
				about = config.about.enable,
				print = config.print.enable,
				fullscreen = config.fullscreen,
				node = '';

			node = '<section id="gcviz-help-head" class="gcviz-help gcviz-help-head">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: headTitle"></span></div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-help" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headHelp"></span>' +
						'</div>';

			if (about) {
				node += '<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-about" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headAbout"></span>' +
						'</div>';
			}

			if (print) {
				node += '<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-print" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headPrint"></span>' +
						'</div>';
			}

			if (fullscreen) {
				node += '<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-fs" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headGoFS"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-head-reg" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11 gcviz-help-textbtn" data-bind="text: headExitFS"></span>' +
						'</div>';
			}

			if (menu) {
				node += '<div class="row">' +
							'<span class="span1 gcviz-help-textsub" data-bind="text: headMenuTitle"></span>' +
							'<span class="span11" data-bind="text: headMenu"></span>' +
						'</div>';
			}

			node += '</section>';

			return node;
		};

		getFooterHelp = function(config) {
			var arrow = config.northarrow.enable,
				coord = config.mousecoords.enable,
				scale = config.scalebar.enable,
				node = '';

			if (arrow || coord || scale) {
				node = '<section id="gcviz-help-foot" class="gcviz-help gcviz-help-foot">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: footTitle"></span></div>';

				if (scale) {
					node += '<div class="row">' +
								'<span class="span3 gcviz-help-textsub" data-bind="text: footScalebarTitle"></span>' +
								'<span class="span9" data-bind="text: footScalebar"></span>' +
							'</div>';
				}

				if (coord) {
					node += '<div class="row">' +
								'<span class="span3 gcviz-help-textsub" data-bind="text: footCoordTitle"></span>' +
								'<span class="span9" data-bind="text: footCoord"></span>' +
							'</div>';
				}

				if (arrow) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-help-arrow" tabindex="-1"</button>' +
								'</div>' +
								'<span class="span11" data-bind="text: footArrow"></span>' +
							'</div>';
				}

				node += '</section>';
			}

			return node;
		};

		getDrawHelp = function(config) {
			var enable = config.enable,
				drawline = config.drawline.enable,
				drawtext = config.drawtext.enable,
				measline = config.measureline.enable,
				measarea = config.measurearea.enable,
				impexp = config.importexport.enable,
				node = '';

			if (enable && (drawline || drawtext || measline || measarea || impexp)) {
				node = '<section id="gcviz-help-tbdraw" class="gcviz-help gcviz-help-tbdraw">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: drawTitle"></span></div>' +
						'<div class="row">' +
							'<div class="span4 gcviz-draw-cholder">' +
								'<button class="gcviz-draw-black" tabindex="-1"</button>' +
								'<button class="gcviz-draw-blue" tabindex="-1"></button>' +
								'<button class="gcviz-draw-green" tabindex="-1"></button>' +
								'<button class="gcviz-draw-red" tabindex="-1"></button>' +
								'<button class="gcviz-draw-yellow" tabindex="-1"></button>' +
								'<button class="gcviz-draw-white" tabindex="-1"></button>' +
							'</div>' +
							'<span class="span8" data-bind="text: drawColorSelect"></span>' +
						'</div>';

				if (drawline) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-line" tabindex="-1"</button>' +
								'</div>' +
								'<div class="span11">' +
									'<span data-bind="text: drawLine"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine4"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine5"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLine6"></span>' +
								'</div>' +
							'</div>';
				}

				if (drawtext) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-text" tabindex="-1"</button>' +
								'</div>' +
								'<div class="span11">' +
									'<span data-bind="text: drawText"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText4"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText5"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawText6"></span>' +
								'</div>' +
							'</div>';
				}

				if (measline) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-length" tabindex="-1"</button>' +
								'</div>' +
								'<div class="span11">' +
									'<span data-bind="text: drawLength"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLength1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLength2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLength3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLength4"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLength5"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawLengthEra"></span>' +
								'</div>' +
							'</div>';
				}

				if (measarea) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-area" tabindex="-1"</button>' +
								'</div>' +
								'<div class="span11">' +
									'<span data-bind="text: drawArea"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawArea1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawArea2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawArea3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawArea4"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawArea5"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: drawAreaEra"></span>' +
								'</div>' +
							'</div>';
				}

				node +=	'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-draw-del" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11" data-bind="text: drawEraseAll"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-draw-delsel" tabindex="-1"</button>' +
							'</div>' +
							'<div class="span11">' +
								'<span data-bind="text: drawEraseSel"></span>' +
								'<span class="gcviz-help-textlist" data-bind="text: drawEraseSel1"></span>' +
								'<span class="gcviz-help-textlist" data-bind="text: drawEraseSel2"></span>' +
								'<span class="gcviz-help-textlist" data-bind="text: drawEraseSel3"></span>' +
								'<span class="gcviz-help-textlist" data-bind="text: drawEraseSel4"></span>' +
							'</div>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-draw-undo" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11" data-bind="text: drawUndo"></span>' +
						'</div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<button class="gcviz-draw-redo" tabindex="-1"</button>' +
							'</div>' +
							'<span class="span11" data-bind="text: drawRedo"></span>' +
						'</div>';

				if (impexp) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-imp" tabindex="-1"</button>' +
								'</div>' +
								'<span class="span11" data-bind="text: drawImport"></span>' +
							'</div>' +
							'<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-draw-exp" tabindex="-1"</button>' +
								'</div>' +
								'<span class="span11" data-bind="text: drawExport"></span>' +
							'</div>';
				}

				node += '</section>';
			}

			return node;
		};

		getLegHelp = function(config) {
			var node = '';

			if (config.enable) {
				node = '<section id="gcviz-help-tbleg" class="gcviz-help gcviz-help-tbleg">' +
						'<span class="gcviz-help-tbtitle" data-bind="text: legTitle"></span>' +
						'<div class="row"><span class="span12" data-bind="text: legDesc1"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: legDesc2"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: legDesc3"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: legSlider"></span></div>' +
						'<div class="row"><span class="span12" data-bind="text: legExpand"></span></div>' +
					'</section>';
			}

			return node;
		};

		getNavHelp = function(config) {
			var enable = config.enable,
				zoom = config.geolocation.enable,
				info = config.position.enable,
				ov = config.overview.enable,
				scale = config.scaledisplay.enable,
				node = '';

			if (enable && (zoom || info || ov || scale)) {
				node = '<section id="gcviz-help-tbnav" class="gcviz-help gcviz-help-tbnav">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: navTitle"></span></div>';

				if (zoom) {
					node += '<div class="row"><span class="gcviz-help-textsub" data-bind="text: navZoomtoTitle"></span></div>' +
							'<div class="row">' +
								'<div class="span1"></div>' +
								'<div class="span11">' +
									'<span data-bind="text: navZoomto"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navZoomto1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navZoomto2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navZoomto3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navZoomto4"></span>' +
								'</div>' +
							'</div>';
				}

				if (info) {
					node += '<div class="row"><span class="gcviz-help-textsub" data-bind="text: navMapInfoTitle"></span></div>' +
							'<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-nav-pos" tabindex="-1"</button>' +
								'</div>' +
								'<div class="span11">' +
									'<span data-bind="text: navPos"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navPos1"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navPos2"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navPos3"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navPos4"></span>' +
									'<span class="gcviz-help-textlist" data-bind="text: navPos5"></span>' +
								'</div>' +
							'</div>';
				}

				if (ov) {
					node += '<div class="row"><span class="gcviz-help-textsub" data-bind="text: navAltOV"></span></div>' +
							'<div class="row">' +
								'<div class="span6">' +
									'<img class="gcviz-help-img" data-bind="attr: { src: imgHelpOV, title: navAltOV }"></img>' +
								'</div>' +
								'<span class="span6" data-bind="text: navOV"></span>' +
							'</div>';
				}

				if (scale) {
					node += '<div class="row">' +
								'<span class="span3 gcviz-help-textsub" data-bind="text: navScaleTitle"></span>' +
								'<span class="span9" data-bind="text: navScale"></span>' +
							'</div>';
				}

				node +=	'</section>';
			}

			return node;
		};

		getDataHelp = function(config) {
			var enable = config.enable,
				data = config.data.enable,
				node = '';

			if (enable && (data)) {
				node = '<section id="gcviz-help-tbdata" class="gcviz-help gcviz-help-tbdata">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: dataTitle"></span></div>';

				if (data) {
					node += '<div class="row">' +
								'<div class="span1">' +
									'<button class="gcviz-data-add" tabindex="-1"</button>' +
								'</div>' +
								'<span class="span11" data-bind="text: dataAdd"></span>' +
							'</div>' +
							'<div class="row"><span class="gcviz-help-textsub" data-bind="text: dataSampleTitle"></span></div>' +
							'<div class="row">' +
								'<div class="span1"></div>' +
								'<div class="span11">' +
									'<div class="row">' +
										'<div class="span4">' +
											'<img class="gcviz-help-img" data-bind="attr: { src: imgHelpDataSamp, title: dataSample }"></img>' +
										'</div>' +
										'<span class="span7" data-bind="text: dataSample"></span>' +
									'</div>' +
									'<div class="row">' +
										'<div class="span2">' +
											'<button class="gcviz-data-del" tabindex="-1"</button>' +
										'</div>' +
										'<span class="span9" data-bind="text: dataRemove"></span>' +
								'</div>' +
								'</div>' +
							'</div>';
				}

				node += '</section>';
			}

			return node;
		};

		getDevHelp = function() {
			var node = '';

			node = '<section id="gcviz-help-dev" class="gcviz-help gcviz-help-dev">' +
						'<div class="row"><span class="gcviz-help-tbtitle" data-bind="text: devTitle"></span></div>' +
						'<div class="row">' +
							'<div class="span1">' +
								'<img class="gcviz-foot-logo" data-bind="attr: { src: imgHelpLogo, alt: devLogoAlt }" tabindex="-1"></img>' +
							'</div>' +
							'<span class="span11" data-bind="text: devLogo"></span>' +
						'</div>' +
					'</section>';

			return node;
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
