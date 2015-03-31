/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Help view model widget
 */
/* global locationPath: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-i18n'
	], function($viz, ko, i18n) {
		var initialize,
			toggleHelp,
			toggleHelpBubble,
			gblDialogOpen,
			gblDialog,
			gblDialogBubbleOpen,
			gblDialogBubble,
			vm;

		initialize = function($mapElem, mapid) {

			// data model				
			var helpViewModel = function($mapElem, mapid) {
				var _self = this,
					pathHelpBubble = locationPath + 'gcviz/images/helpBubble.png',
					pathOV = locationPath + 'gcviz/images/helpOV.png',
					pathDataSample = locationPath + 'gcviz/images/helpDataSample.png',
					pathGCVizPNG = locationPath + 'gcviz/images/GCVizLogo.png',
					pathZoombar = locationPath + 'gcviz/images/helpZoombar.png',
					$btnHelp = $mapElem.find('.gcviz-head-help'),
					$dialog = $mapElem.find('#help-' + mapid),
					$dialogBubble = $mapElem.find('#helpbubble-' + mapid),
					$helpSect = $mapElem.find('.gcviz-help-sect'),
					$helpKey = $helpSect.find('.gcviz-help-key'),
					$helpMap = $helpSect.find('.gcviz-help-map'),
					$helpHead = $helpSect.find('.gcviz-help-head'),
					$helpFoot = $helpSect.find('.gcviz-help-foot'),
					$helpDraw = $helpSect.find('.gcviz-help-tbdraw'),
					$helpNav = $helpSect.find('.gcviz-help-tbnav'),
					$helpLeg = $helpSect.find('.gcviz-help-tbleg'),
					$helpData = $helpSect.find('.gcviz-help-tbdata'),
					$helpExtract = $helpSect.find('.gcviz-help-tbextract'),
					$helpDatagrid = $helpSect.find('.gcviz-help-datagrid'),
					$helpDev = $helpSect.find('.gcviz-help-dev');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// images path
				_self.imgHelpBubble = pathHelpBubble;
				_self.imgHelpOV = pathOV;
				_self.imgHelpDataSamp = pathDataSample;
				_self.imgHelpLogo = pathGCVizPNG;
				_self.imgHelpZoombar = pathZoombar;

				// text
				_self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');

				// overview
				_self.overTitle = i18n.getDict('%help-overview-title');
				_self.overDesc1 = i18n.getDict('%help-overview-desc1');
				_self.overDesc2 = i18n.getDict('%help-overview-desc2');

				// keyboard navigation
				_self.keyTitle = i18n.getDict('%help-key-title');
				_self.keyFocusNextTitle = i18n.getDict('%help-key-fntitle');
				_self.keyFocusNext = i18n.getDict('%help-key-fn');
				_self.keyFocusPrevTitle = i18n.getDict('%help-key-fptitle');
				_self.keyFocusPrev = i18n.getDict('%help-key-fp');
				_self.keyZoomTitle = i18n.getDict('%help-key-zoomtitle');
				_self.keyZoom = i18n.getDict('%help-key-zoom');
				_self.keyPanTitle = i18n.getDict('%help-key-pantitle');
				_self.keyPan = i18n.getDict('%help-key-pan');
				_self.keyEnterTitle = i18n.getDict('%help-key-entertitle');
				_self.keyEnter = i18n.getDict('%help-key-enter');
				_self.keySpaceTitle = i18n.getDict('%help-key-spacetitle');
				_self.keySpace = i18n.getDict('%help-key-space');
				_self.keyWCAGTitle = i18n.getDict('%help-key-wcagtitle');
				_self.keyWCAG = i18n.getDict('%help-key-wcag');
				_self.keyPref = i18n.getDict('%help-key-pref');

				// map tools
				_self.mapTitle = i18n.getDict('%help-map-title');
				_self.mapZoomFull = i18n.getDict('%help-map-zoomfull');
				_self.mapZoom = i18n.getDict('%help-map-zoom');
				_self.mapZoombar = i18n.getDict('%help-map-zoombar');

				// header
				_self.headTitle = i18n.getDict('%help-head-title');
				_self.headHelp = i18n.getDict('%help-head-help');
				_self.headAbout = i18n.getDict('%help-head-about');
				_self.headPrint = i18n.getDict('%help-head-print');
				_self.headGoFS = i18n.getDict('%help-head-gofs');
				_self.headExitFS = i18n.getDict('%help-head-exfs');
				_self.headMenuTitle = i18n.getDict('%help-head-menutitle');
				_self.headMenu = i18n.getDict('%help-head-menu');

				// footer
				_self.footTitle = i18n.getDict('%help-foot-title');
				_self.footScalebarTitle = i18n.getDict('%help-foot-scalebartitle');
				_self.footScalebar = i18n.getDict('%help-foot-scalebar');
				_self.footArrow = i18n.getDict('%help-foot-arrow');
				_self.footCoordTitle = i18n.getDict('%help-foot-coordtitle');
				_self.footCoord = i18n.getDict('%help-foot-coord');

				// draw text
				_self.drawTitle = i18n.getDict('%help-draw-title');
				_self.drawColorSelect = i18n.getDict('%help-draw-colorselect');
				_self.drawLine = i18n.getDict('%help-draw-line');
				_self.drawLine1 = i18n.getDict('%help-draw-line1');
				_self.drawLine2 = i18n.getDict('%help-draw-line2');
				_self.drawLine3 = i18n.getDict('%help-draw-line3');
				_self.drawLine4 = i18n.getDict('%help-draw-line4');
				_self.drawLine5 = i18n.getDict('%help-draw-line5');
				_self.drawLine6 = i18n.getDict('%help-draw-line6');
				_self.drawText = i18n.getDict('%help-draw-text');
				_self.drawText1 = i18n.getDict('%help-draw-text1');
				_self.drawText2 = i18n.getDict('%help-draw-text2');
				_self.drawText3 = i18n.getDict('%help-draw-text3');
				_self.drawText4 = i18n.getDict('%help-draw-text4');
				_self.drawText5 = i18n.getDict('%help-draw-text5');
				_self.drawText6 = i18n.getDict('%help-draw-text6');
				_self.drawLength = i18n.getDict('%help-draw-length');
				_self.drawLength1 = i18n.getDict('%help-draw-length1');
				_self.drawLength2 = i18n.getDict('%help-draw-length2');
				_self.drawLength3 = i18n.getDict('%help-draw-length3');
				_self.drawLength4 = i18n.getDict('%help-draw-length4');
				_self.drawLength5 = i18n.getDict('%help-draw-length5');
				_self.drawLengthEra = i18n.getDict('%help-draw-lengtherase');
				_self.drawArea = i18n.getDict('%help-draw-area');
				_self.drawArea1 = i18n.getDict('%help-draw-area1');
				_self.drawArea2 = i18n.getDict('%help-draw-area2');
				_self.drawArea3 = i18n.getDict('%help-draw-area3');
				_self.drawArea4 = i18n.getDict('%help-draw-area4');
				_self.drawArea5 = i18n.getDict('%help-draw-area5');
				_self.drawAreaEra = i18n.getDict('%help-draw-areaerase');
				_self.drawEraseAll = i18n.getDict('%help-draw-eraseall');
				_self.drawEraseSel = i18n.getDict('%help-draw-eraseselect');
				_self.drawEraseSel1 = i18n.getDict('%help-draw-eraseselect1');
				_self.drawEraseSel2 = i18n.getDict('%help-draw-eraseselect2');
				_self.drawEraseSel3 = i18n.getDict('%help-draw-eraseselect3');
				_self.drawEraseSel4 = i18n.getDict('%help-draw-eraseselect4');
				_self.drawUndo = i18n.getDict('%help-draw-undo');
				_self.drawRedo = i18n.getDict('%help-draw-redo');
				_self.drawImport = i18n.getDict('%help-draw-import');
				_self.drawExport = i18n.getDict('%help-draw-export');

				// navigation text
				_self.navTitle = i18n.getDict('%help-nav-title');
				_self.navZoomtoTitle = i18n.getDict('%help-nav-zoomtotitle');
				_self.navZoomto = i18n.getDict('%help-nav-zoomto');
				_self.navZoomto1 = i18n.getDict('%help-nav-zoomto1');
				_self.navZoomto1b = i18n.getDict('%help-nav-zoomto1b');
				_self.navZoomto1b1 = i18n.getDict('%help-nav-zoomto1b1');
				_self.navZoomto1b2 = i18n.getDict('%help-nav-zoomto1b2');
				_self.navZoomto1b3 = i18n.getDict('%help-nav-zoomto1b3');
				_self.navZoomto1b4 = i18n.getDict('%help-nav-zoomto1b4');
				_self.navZoomto1b5 = i18n.getDict('%help-nav-zoomto1b5');
				_self.navZoomto2 = i18n.getDict('%help-nav-zoomto2');
				_self.navZoomto3 = i18n.getDict('%help-nav-zoomto3');
				_self.navZoomto4 = i18n.getDict('%help-nav-zoomto4');
				_self.navMapInfoTitle = i18n.getDict('%help-nav-mapinfotitle');
				_self.navPos = i18n.getDict('%help-nav-pos');
				_self.navPos1 = i18n.getDict('%help-nav-pos1');
				_self.navPos2 = i18n.getDict('%help-nav-pos2');
				_self.navPos3 = i18n.getDict('%help-nav-pos3');
				_self.navPos4 = i18n.getDict('%help-nav-pos4');
				_self.navPos5 = i18n.getDict('%help-nav-pos5');
				_self.navAltOV = i18n.getDict('%help-nav-ovalt');
				_self.navOV = i18n.getDict('%help-nav-ov');
				_self.navScaleTitle = i18n.getDict('%help-nav-scaletitle');
				_self.navScale = i18n.getDict('%help-nav-scale');

				// legend text
				_self.legTitle = i18n.getDict('%help-leg-title');
				_self.legAbout = i18n.getDict('%help-leg-about');
				_self.legDesc1 = i18n.getDict('%help-leg-desc1');
				_self.legDesc2 = i18n.getDict('%help-leg-desc2');
				_self.legDesc3 = i18n.getDict('%help-leg-desc3');
				_self.legSlider = i18n.getDict('%help-leg-slider');
				_self.legExpand = i18n.getDict('%help-leg-exp');

				// data text
				_self.dataTitle = i18n.getDict('%help-data-title');
				_self.dataAddFile = i18n.getDict('%help-data-addfile');
				_self.dataAddURL = i18n.getDict('%help-data-addurl');
				_self.dataSampleTitle = i18n.getDict('%help-data-sampletitle');
				_self.dataSample = i18n.getDict('%help-data-sample');
				_self.dataRemove = i18n.getDict('%help-data-remove');

				// extract text
				_self.extractTitle = i18n.getDict('%help-extract-title');
				_self.extDesc1 = i18n.getDict('%help-extract-desc1');
				_self.extClick = i18n.getDict('%help-extract-click');
				_self.extLink = i18n.getDict('%help-extract-link');
				_self.extDesc2 = i18n.getDict('%help-extract-desc2');

				// datagrid text
				_self.datagridTitle = i18n.getDict('%help-datagrid-title');
				_self.dgDesc1 = i18n.getDict('%help-datagrid-desc1');
				_self.dgDesc2 = i18n.getDict('%help-datagrid-desc2');
				_self.dgDesc3 = i18n.getDict('%help-datagrid-desc3');
				_self.dgDesc4 = i18n.getDict('%help-datagrid-desc4');
				_self.dgDesc5 = i18n.getDict('%help-datagrid-desc5');
				_self.dgZoomTitle = i18n.getDict('%help-datagrid-zoomtitle');
				_self.dgZoomDesc = i18n.getDict('%help-datagrid-zoomdesc');
				_self.dgSelectDesc = i18n.getDict('%help-datagrid-selectdesc');
				_self.dgFilterTitle = i18n.getDict('%help-datagrid-filtertitle');
				_self.dgFilterDesc = i18n.getDict('%help-datagrid-filterdesc');
				_self.dgFilterClear = i18n.getDict('%help-datagrid-filterclear');
				_self.dgFilterTypeDesc = i18n.getDict('%help-datagrid-filtertypedesc');
				_self.dgFilterString = i18n.getDict('%help-datagrid-filtertypestring');
				_self.dgFilterNum = i18n.getDict('%help-datagrid-filtertypenum');
				_self.dgFilterSelect = i18n.getDict('%help-datagrid-filtertypeselect');
				_self.dgFilterDate = i18n.getDict('%help-datagrid-filtertypedate');
				_self.dgFilterApply = i18n.getDict('%help-datagrid-filterapply');
				_self.dgFilterSelect = i18n.getDict('%help-datagrid-filterspatial');
				_self.dgLinkTitle = i18n.getDict('%help-datagrid-linktitle');
				_self.dgLinkDesc = i18n.getDict('%help-datagrid-linkdesc');
				_self.dgLinkOpen = i18n.getDict('%help-datagrid-linkopen');
				_self.dgLinkClose = i18n.getDict('%help-datagrid-linkclose');
				_self.dgExportTitle = i18n.getDict('%help-datagrid-exporttitle');
				_self.dgExportDesc = i18n.getDict('%help-datagrid-exportdesc');
				_self.dgPopTitle = i18n.getDict('%help-datagrid-poptitle');
				_self.dgPopDesc1 = i18n.getDict('%help-datagrid-popdesc1');
				_self.dgPopDesc2 = i18n.getDict('%help-datagrid-popdesc2');
				_self.dgPopDesc3 = i18n.getDict('%help-datagrid-popdesc3');
				_self.dgPopDesc4 = i18n.getDict('%help-datagrid-popdesc4');
				_self.dgPopDesc5 = i18n.getDict('%help-datagrid-popdesc5');
				_self.dgPopZoom = i18n.getDict('%help-datagrid-popzoom');
				_self.dgPopPrevious = i18n.getDict('%help-datagrid-popprevious');
				_self.dgPopNext = i18n.getDict('%help-datagrid-popnext');
				_self.dgPopDesc6 = i18n.getDict('%help-datagrid-popdesc6');

				// developer's corner text
				_self.devTitle = i18n.getDict('%help-dev-title');
				_self.devLogoAlt = i18n.getDict('%help-dev-logoalt');
				_self.devLogo = i18n.getDict('%help-dev-logo');
				_self.devDesc = i18n.getDict('%help-dev-desc');

				// help dialog box
				_self.lblHelpTitle = i18n.getDict('%help-dialogtitle');
				_self.isHelpDialogOpen = ko.observable(false);

				// help bubble dialog box
				_self.isHelpBubbleDialogOpen = ko.observable(false);

				_self.init = function() {
					// disable link if section is not part of GCViz implementation
					_self.noMap = ($helpMap.length > 0) ? false : true;
					_self.noFoot = ($helpFoot.length > 0) ? false : true;
					_self.noDraw = ($helpDraw.length > 0) ? false : true;
					_self.noNav = ($helpNav.length > 0) ? false : true;
					_self.noLeg = ($helpLeg.length > 0) ? false : true;
					_self.noData = ($helpData.length > 0) ? false : true;
					_self.noExtract = ($helpExtract.length > 0) ? false : true;
					_self.noDatagrid = ($helpDatagrid.length > 0) ? false : true;

					// set global dialog to be able to open help from
					// outisede the view model. This way, it is easy
					// for header VM to open help dialog
					gblDialogOpen = _self.isHelpDialogOpen;
					gblDialogBubbleOpen = _self.isHelpBubbleDialogOpen;

					// keep both dialog box in global so we can extract and add item
					gblDialog = $dialog;
					gblDialogBubble = $dialogBubble.find('#gcviz-bubble');
					return { controlsDescendantBindings: true };
				};

				_self.dialogHelpOk = function() {
					_self.isHelpDialogOpen(false);
					setTimeout(function() {
						$btnHelp.focus();
					}, 500);
				};

				_self.dialogHelpBubbleOk = function() {
					_self.isHelpBubbleDialogOpen(false);
					gblDialogBubble.empty();
				};

				_self.scrollTo = function(section) {
					if (section === 'key') {
						$helpSect.scrollTo($helpKey);
					} else if (section === 'map') {
						$helpSect.scrollTo($helpMap);
					} else if (section === 'head') {
						$helpSect.scrollTo($helpHead);
					} else if (section === 'foot') {
						$helpSect.scrollTo($helpFoot);
					} else if (section === 'draw') {
						$helpSect.scrollTo($helpDraw);
					} else if (section === 'nav') {
						$helpSect.scrollTo($helpNav);
					} else if (section === 'leg') {
						$helpSect.scrollTo($helpLeg);
					} else if (section === 'data') {
						$helpSect.scrollTo($helpData);
					} else if (section === 'extract') {
						$helpSect.scrollTo($helpExtract);
					} else if (section === 'datagrid') {
						$helpSect.scrollTo($helpDatagrid);
					} else if (section === 'dev') {
						$helpSect.scrollTo($helpDev);
					}
				};

				_self.aboutClick = function() {
					console.log('dd');//_self.isAboutDialogOpen(true);
				};

				_self.init();
			};

			vm = new helpViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		toggleHelp = function() {
			// open main help and close bubble help if open
			gblDialogOpen(true);
			gblDialogBubbleOpen(false);
		};

		toggleHelpBubble = function(key, section) {
			var prevent = false;

			// empty bubble
			gblDialogBubble.empty();

			// get part of the help to put inside the bubble
			gblDialogBubble.append(gblDialog.find('#' + section).clone());

			if (key === 32) {
				// open bubble help and close main help if open
				gblDialogBubbleOpen(true);
				gblDialogOpen(false);
				prevent = true;
			}

			return prevent;
		};

		return {
			initialize: initialize,
			toggleHelp: toggleHelp,
			toggleHelpBubble: toggleHelpBubble
		};
	});
}).call(this);
