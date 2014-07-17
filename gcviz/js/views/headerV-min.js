(function(){define(["gcviz-vm-header","gcviz-i18n","dijit/TitlePane"],function(d,c,b){var a;a=function(h){var f,l,g=h.header,j=g.about,e=h.mapframe.id,k=g.title.value,i="";h.find("#"+e).prepend('<div id="head'+e+'" class="gcviz-head"></div>');f=h.find(".gcviz-head");if(typeof k!=="undefined"){i+='<label class="gcviz-head-title unselectable">'+k+"</label>"}i+='<div class="gcviz-head-btn">';i+='<button class="gcviz-head-help" tabindex="0" data-bind="buttonBlur, click: helpClick, tooltip: { content: tpHelp }"></button>';i+='<div data-bind="uiDialog: { title: $root.lblHelpTitle, width: 350, height: 220, ok: $root.dialogHelpOk, close: $root.dialogHelpOk, openDialog: \'isHelpDialogOpen\' }"><span data-bind="text: $root.helpInfo1"></span><a data-bind="attr: { href: $root.helpURL, title: $root.helpURLText }, text: $root.helpURLText" tabindex="0" target="new"></a></br><span data-bind="text: $root.helpInfo2"></span></div>';i+='<button class="gcviz-head-wcag" tabindex="0" data-bind="buttonBlur, click: WCAGClick, tooltip: { content: tpWCAG }, css: { \'gcviz-head-wcag\': isWCAG() === false, \'gcviz-head-wcagon\': isWCAG() === true }"></button>';if(j.enable){i+='<button class="gcviz-head-about" tabindex="0" data-bind="buttonBlur, click: aboutClick, tooltip: { content: tpAbout }"></button>';i+='<div data-bind="uiDialog: { title: $root.lblAboutTitle, width: 400, height: 300, ok: $root.dialogAboutOk, close: $root.dialogAboutOk, openDialog: \'isAboutDialogOpen\' }"><span data-bind="text: $root.aboutInfo1"></span><div data-bind="if: aboutType === 2"><a data-bind="attr: { href: $root.aboutURL, title: $root.aboutURLText }, text: $root.aboutURLText" tabindex="0" target="_blank"></a><span data-bind="text: $root.aboutInfo2"></span></div></div>'}if(g.inset){i+='<button class="gcviz-head-inset" tabindex="0" data-bind="buttonBlur, click: insetClick, tooltip: { content: tpInset }"></button>'}if(g.print.enable){i+='<button class="gcviz-head-print" tabindex="0" data-bind="buttonBlur, click: printClick, tooltip: { content: tpPrint }"></button>'}if(g.fullscreen){i+='<button class="gcviz-head-fs" tabindex="0" data-bind="buttonBlur, click: fullscreenClick, tooltip: { content: tpFullScreen }, css: { \'gcviz-head-fs\': isFullscreen() === false, \'gcviz-head-reg\': isFullscreen() === true }"></button>'}i+="</div>";f.append(i);if(g.tools===true){h.find(".gcviz-head").append('<div id="divToolsOuter'+e+'" class="gcviz-tbcontainer" data-bind="attr: { style: xheightToolsOuter }"><div id="divToolsInner'+e+'" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsInner }"></div></div>');l=new b({id:"tbTools"+e,title:""+c.getDict("%header-tools")+"",content:'<div class="gcviz-tbholder" data-bind="attr: { style: widthheightTBholder }"></div>',open:true});h.find(".gcviz-toolsholder").append(l.domNode);l.startup()}return(d.initialize(f,e,g))};return{initialize:a}})}).call(this);