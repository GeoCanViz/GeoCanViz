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
					$btnHelp = $mapElem.find('.gcviz-head-help'),
					$dialog = $mapElem.find('#help-' + mapid),
					$dialogBubble = $mapElem.find('#helpbubble-' + mapid),
					$helpSect = $mapElem.find('.gcviz-help-sect'),
					$helpOver = $helpSect.find('.gcviz-help-over'),
					$helpKey = $helpSect.find('.gcviz-help-key'),
					$helpHead = $helpSect.find('.gcviz-help-head'),
					$helpFoot = $helpSect.find('.gcviz-help-foot'),
					$helpDraw = $helpSect.find('.gcviz-help-tbdraw'),
					$helpNav = $helpSect.find('.gcviz-help-tbnav'),
					$helpData = $helpSect.find('.gcviz-help-tbdata'),
					$helpDev = $helpSect.find('.gcviz-help-dev');

				// viewmodel mapid to be access in tooltip custom binding
				_self.mapid = mapid;

				// images path
                _self.imgHelpBubble = pathHelpBubble;
                _self.imgHelpOV = pathOV;
                _self.imgHelpDataSamp = pathDataSample;

                // text
                _self.urlLogo = i18n.getDict('%footer-urlgcvizrepo');

				// overview
				_self.overTitle = i18n.getDict('%help-overview-title');
				_self.overDesc1 = i18n.getDict('%help-overview-desc1');
				_self.overDesc2 = i18n.getDict('%help-overview-desc2');
				_self.overDesc3 = i18n.getDict('%help-overview-desc2');

				// keyboard navigation
				_self.keyTitle = i18n.getDict('%help-key-title');
				_self.keyFocusNextTitle = i18n.getDict('%help-key-fntitle');
				_self.keyFocusNext = i18n.getDict('%help-key-fn');
				_self.keyFocusPrevTitle = i18n.getDict('%help-key-fntitle');
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

				// header
				_self.headTitle = i18n.getDict('%help-head-title');
				_self.headHelp = i18n.getDict('%help-head-help');
				_self.headAbout = i18n.getDict('%help-head-about');
				_self.headPrint = i18n.getDict('%help-head-print');
				_self.headFS = i18n.getDict('%help-head-fs');
				_self.headMenuTitle = i18n.getDict('%help-head-menutitle');
				_self.headMenu = i18n.getDict('%help-head-menu');

				// footer
				_self.footTitle = i18n.getDict('%help-foot-title');
				_self.footArrow = i18n.getDict('%help-foot-arrow');
				_self.footCoordTitle = i18n.getDict('%help-foot-coordtitle');
				_self.footCoord = i18n.getDict('%help-foot-coord');

				// draw text
				_self.drawTitle = i18n.getDict('%help-draw-title');
				_self.drawColorSelect = i18n.getDict('%help-draw-colorselect');
				_self.drawLine = i18n.getDict('%help-draw-line');
				_self.drawText = i18n.getDict('%help-draw-text');
				_self.drawLength = i18n.getDict('%help-draw-length');
				_self.drawArea = i18n.getDict('%help-draw-area');
				_self.drawEraseAll = i18n.getDict('%help-draw-eraseall');
				_self.drawEraseSel = i18n.getDict('%help-draw-eraseselect');
				_self.drawUndo = i18n.getDict('%help-draw-undo');
				_self.drawRedo = i18n.getDict('%help-draw-redo');
				_self.drawImport = i18n.getDict('%help-draw-import');
				_self.drawExport = i18n.getDict('%help-draw-export');

				// navigation text
				_self.navTitle = i18n.getDict('%help-nav-title');
				_self.navZoomtoTitle = i18n.getDict('%help-nav-zoomtotitle');
				_self.navZoomto = i18n.getDict('%help-nav-zoomto');
				_self.navPos = i18n.getDict('%help-nav-pos');
				_self.navAltOV = i18n.getDict('%help-nav-ovalt');
				_self.navOV = i18n.getDict('%help-nav-ov');
				_self.navScalebarTitle = i18n.getDict('%help-nav-scalebartitle');
				_self.navScalebar = i18n.getDict('%help-nav-scalebar');
				_self.navScaleTitle = i18n.getDict('%help-nav-scaletitle');
				_self.navScale = i18n.getDict('%help-nav-scale');

				// data text
				_self.dataTitle = i18n.getDict('%help-data-title');
				_self.dataAdd = i18n.getDict('%help-data-add');
				_self.dataSampleTitle = i18n.getDict('%help-data-sampletitle');
				_self.dataSample = i18n.getDict('%help-data-sample');
				_self.dataRemove = i18n.getDict('%help-data-remove');

				// developer's corner text
				_self.devTitle = i18n.getDict('%help-dev-title');

				// help dialog box
				_self.lblHelpTitle = i18n.getDict('%help-dialogtitle');
				_self.isHelpDialogOpen = ko.observable(false);

				// help bubble dialog box
				_self.lblHelpBubbleTitle = i18n.getDict('%help-dialogbubbletitle');
				_self.isHelpBubbleDialogOpen = ko.observable(false);

				_self.init = function() {
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
					$btnHelp.focus();
				};

				_self.dialogHelpBubbleOk = function() {
					_self.isHelpBubbleDialogOpen(false);
					gblDialogBubble.empty();
				};

				_self.scrollTo = function(section) {
					if (section === 'over') {
						$helpSect.scrollTo($helpOver);
					} else if (section === 'key') {
						$helpSect.scrollTo($helpKey);
					} else if (section === 'head') {
						$helpSect.scrollTo($helpHead);
					} else if (section === 'foot') {
						$helpSect.scrollTo($helpFoot);
					} else if (section === 'draw') {
						$helpSect.scrollTo($helpDraw);
					} else if (section === 'nav') {
						$helpSect.scrollTo($helpNav);
					} else if (section === 'data') {
						$helpSect.scrollTo($helpData);
					} else if (section === 'dev') {
						$helpSect.scrollTo($helpDev);
					}
				};

				_self.init();
			};

			vm = new helpViewModel($mapElem, mapid);
			ko.applyBindings(vm, $mapElem[0]); // This makes Knockout get to work
			return vm;
		};

		toggleHelp = function() {
			gblDialogOpen(true);
		};

		toggleHelpBubble = function(key, section) {
			var prevent = false;

			// get part of the help to put inside the bubble
			gblDialogBubble.append(gblDialog.find('#' + section).clone());

			if (key === 32) {
				gblDialogBubbleOpen(true);
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
