/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * hold custom Knockout binding
 */
/* global dojo: false */
(function() {
	'use strict';
	define(['jquery-private',
			'knockout',
			'gcviz-func',
			'dijit/form/HorizontalSlider',
			'dijit/form/RadioButton',
			'jqueryui'
	], function($viz, ko, gcvizFunc, slider, radio) {

    ko.bindingHandlers.tooltip = {
		init: function(element, valueAccessor) {
			var local = ko.utils.unwrapObservable(valueAccessor()),
				options = {},
				$element = $viz(element);

			ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
			ko.utils.extend(options, local);

			$element.attr('title', options.content);
			$element.tooltip(options);

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$element.tooltip('destroy');
				});
			},
			options: {
				show: {
					effect: 'slideDown',
					delay: 1000
				},
				hide: {
					effect: 'slideUp',
					delay: 100
				},
				position: {
					my: 'right+30 top+5'
				},
				tooltipClass: 'gcviz-tooltip',
				trigger: 'hover, focus'
			}
	};

	ko.bindingHandlers.fullscreen = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var manageFullscreen,
				mapid = viewModel.mapid,
				vm = gcvizFunc.getElemValueVM(mapid, ['header'], 'js');
			vm.isFullscreen.subscribe(manageFullscreen);

			manageFullscreen = function(fullscreen) {
				if (fullscreen) {
					viewModel.enterFullscreen(vm.widthSection, vm.heightSection);
				} else {
					viewModel.exitFullscreen();
				}
			};
		}
	};

	ko.bindingHandlers.insetVisibility = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var manageInsetVisibility,
				mapid = viewModel.mapid,
				vm = gcvizFunc.getElemValueVM(mapid, ['header'], 'js');
			vm.isInsetVisible.subscribe(manageInsetVisibility);

			manageInsetVisibility = function(visible) {
				viewModel.setVisibility(visible);
			};
		}
	};

	ko.bindingHandlers.enterkey = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			// get function name to call from the binding
			var func = valueAccessor().func,
				keyType = valueAccessor().keyType;

			ko.utils.registerEventHandler(element, keyType, function(event) {
				if (viewModel[func](event.which, event.shiftKey, event.type)) {
					event.preventDefault();
					return false;
				}
				return true;
			});
		}
	};

	ko.bindingHandlers.HorizontalSliderDijit = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				id = viewModel.id,
				widget;

			function loopChildren(VM, e) {
				if (VM.items.length > 0) {
					Object.keys(VM.items).forEach(function(key) {
						loopChildren(VM.items[key], e, loopChildren);
					});
				}
				else {
					bindingContext.$root.changeServiceOpacity(VM.id, e);
				}
			}

			if (options.enable) {
				$viz(element).attr('Visible', options.visible);
				widget = new slider({
					name: 'slider',
					minimum: options.extent[0],
					maximum: options.extent[1],
					intermediateChanges: true,
					value: options.value,
					showButtons: false
				}).placeAt(element);

				// set initstate opacity
				if(viewModel.items.length === 0) {
					bindingContext.$root.changeServiceOpacity(id, options.value);
				} else {
					loopChildren(viewModel, options.value, loopChildren);
				}

				dojo.addClass(widget.domNode, 'gcviz-legendSlider');

				widget.on('Change', function(e) {

					if(viewModel.items.length === 0) {
						bindingContext.$root.changeServiceOpacity(id, e);
					} else {
						loopChildren(viewModel, e, loopChildren);
					}
				});
			}
		}
	};

	ko.bindingHandlers.legendItemList = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var options = valueAccessor(),
				$element = $viz(element);

			if (viewModel.items.length > 0) {
				$element.children('div#childItems.gcviz-legendHolderDiv').toggle(options.expanded, function(event) {
					event.stopPropagation();
				});
			} else {
				$element.children('.gcviz-legendSymbolDiv').toggle(options.expanded);
				$element.children('div#customImage.gcviz-legendHolderImgDiv').toggle(options.expanded);
			}

			if (viewModel.displaychild.enable === false && viewModel.customimage.enable === false) { //remove bullet symbol
				$element.css('background-image', 'none');
			}

			return false;
		}
	};

	ko.bindingHandlers.LegendRadioButtons = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var options = valueAccessor(),
				widget;

			widget = new radio({
				name: options.group,
                value: options.value,
                checked: options.value
            }).placeAt(element);

			widget.on('Change', function(e) {
				bindingContext.$root.switchRadioButtonVisibility(bindingContext.$root.mymap, bindingContext.$data, e);
			});
		}
	};

	// http://stackoverflow.com/questions/9877301/knockoutjs-observablearray-data-grouping
	ko.observableArray.fn.uniqueArray = function() {
		var target = this;

		ko.computed(function() {
			// http://jsfiddle.net/gabrieleromanato/BrLfv/
			var found, x, y,
				origArr = target(),
				newArr = [],
				origLen = origArr.length;

			for (x = 0; x < origLen; x++) {
				found = undefined;
				for (y = 0; y < newArr.length; y++) {
					if (origArr[x] === newArr[y]) {
						found = true;
						break;
					}
				}
				if (!found) {
					newArr.push(origArr[x]);
				}
			}

			return target(newArr);
		}).extend({ notify: 'always' });

		return target;
	};

	ko.bindingHandlers.uiDialog = {
		init: function(element, valueAccessor, allBindings, viewModel) {
			var customFunc,
				local = ko.utils.unwrapObservable(valueAccessor()),
				options = {},
				$element = $viz(element);

			ko.utils.extend(options, ko.bindingHandlers.uiDialog.options);
			ko.utils.extend(options, local);

			// if function are provided for ok and/or cancel, update
			if (typeof options.ok !== 'undefined') {
				options.buttons[0].click = options.ok;
			}
			if (typeof options.cancel !== 'undefined') {
				options.buttons[1].click = options.cancel;
			}
			if (typeof options.close !== 'undefined') {
				options.close = options.close;
			}

			$element.dialog(options);

			customFunc = function(value) {
				$element.dialog(value ? 'open' : 'close');
			};

			viewModel[local.openDialog].subscribe(customFunc);

			//handle disposal (if KO removes by the template binding)
			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				$element.dialog('destroy');
			});
		},
		options: {
			autoOpen: false,
			modal: true,
			resizable: false,
			draggable: false,
			show: 'fade',
			hide: 'fade',
			closeOnEscape: true,
			close: function() { },
			buttons: [{
				text: 'Ok',
				click: function() {
					$viz(this).dialog('close');
				}
				}, {
				text: 'Cancel',
				click: function() {
					$viz(this).dialog('close');
				}
			}]
		}
	};

	// http://lassieadventurestudio.wordpress.com/2012/06/14/return-key-binding-knockout/
	ko.bindingHandlers.returnKey = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			ko.utils.registerEventHandler(element, 'keydown', function(evt) {
				if (evt.keyCode === 13) {
					// to solve page refresh bug on enter on input field
					// http://www.w3.org/MarkUp/html-spec/html-spec_8.html#SEC8.2
					evt.preventDefault();
					valueAccessor().call(viewModel, bindingContext.$data);
				}
			});
		}
	};

	});
}).call(this);
