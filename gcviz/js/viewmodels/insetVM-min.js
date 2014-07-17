(function(){define(["jquery-private","knockout","gcviz-i18n","gcviz-ko","gcviz-func","gcviz-gismap","jqueryslide","magnificpopup"],function(c,k,m,i,e,g){var d,a,j,f,l,b,h;d=function(q,o,n){var p=function(r,v,z){var u,w=this,y=[locationPath+"gcviz/images/insetPrevious.png",locationPath+"gcviz/images/insetNext.png",locationPath+"gcviz/images/insetPlay.png",locationPath+"gcviz/images/insetStop.png"],s=locationPath+"gcviz/images/insetLightbox.png",x=locationPath+"gcviz/images/insetPlayVideo.png",t=e.getElemValueVM(v,u.headerHeight);w.imgLightbox=s;w.imgPlayVideo=x;w.tpLight=m.getDict("%inset-tplight");w.tpPlayVideo=m.getDict("%inset-tpPlayVideo");w.bottom=parseInt(r.css("bottom"),10);w.left=parseInt(r.css("left"),10);w.height=parseInt(r.css("height"),10);w.width=parseInt(r.css("width"),10);w.size=z.size;w.type=z.type;w.fullscreen=z.fullscreen;w.VisibleState=true;w.fullscreenState=false;w.mapid=v;w.init=function(){var A=w.type;if(A==="image"){j(r,w,y)}else{if(A==="video"){f(r,w)}else{if(A==="map"){w.map=b(r,z,w)}else{if(A==="html"){l(r,z)}}}}return{controlsDescendantBindings:true}};w.insetClick=function(){r.find("a")[0].click()};w.videoClick=function(){var A=r[0].getElementsByTagName("Video")[0],B=r.find(".gcviz-play-background");if(A.paused){B.addClass("gcviz-hidden");A.play();A.tabIndex=0;A.focus()}else{A.pause();A.tabIndex="";B.removeClass("gcviz-hidden")}};w.stopVideo=function(C,A,D){var E,F,B;if(C===32){if(D==="keyup"){E=r[0].getElementsByTagName("Video")[0],F=r.find(".gcviz-play-background"),B=r.find(".gcviz-play-button")[0];E.pause();E.tabIndex=-1;E.blur();F.removeClass("gcviz-hidden");setTimeout(function(){B.focus()},100);return true}else{return true}}return false};w.setVisibility=function(B){var A;if(B){r.removeClass("gcviz-hidden");w.VisibleState=true;if(w.type==="map"){if(w.fullscreenState){A=w.fullscreenHeight}else{A=w.height}r.find("#"+r[0].id+"m").css({height:A-20});g.manageScreenState(w.map,1000)}}else{r.addClass("gcviz-hidden");w.VisibleState=false}};w.enterFullscreen=function(F,I){w.fullscreenState=true;if(w.fullscreen){var E=e.getFullscreenParam(F,I),K=E.width,G=E.height,J=E.ratio,H={},A=w.bottom,D=w.left,L=w.height,C=w.width,B=w.map;if(w.size==="%"){if(A!==t){H.bottom=((A*J)+((t*J)-t))+"px"}if(D!==0){H.left=(D*J)+"px"}}else{if(A!==t){J=(G/I);H.bottom=((A+L+t)/I)*(G-t-L)+"px"}if(D!==0){J=(K/F);H.left=((D+C)/F)*(K-C)+"px"}}w.fullscreenHeight=L*J;e.setStyle(r[0],H);if(w.type==="map"&&w.VisibleState){r.find("#"+r[0].id+"m").css({height:(L*J)-20});if(B.vType!=="static"){g.resizeMap(B)}else{g.manageScreenState(B,1000)}}}else{r.addClass("gcviz-inset-hidden")}};w.exitFullscreen=function(){w.fullscreenState=false;if(w.fullscreen){var A=w.map;e.setStyle(r[0],{bottom:w.bottom+"px",left:w.left+"px"});if(w.type==="map"&&w.VisibleState){r.find("#"+r[0].id+"m").css({height:w.height-20});if(A.vType!=="static"){g.resizeMap(A)}else{g.manageScreenState(A,1000)}}}else{r.removeClass("gcviz-inset-hidden")}};w.applyKey=function(B){var C=w.map,A=false;if(B===37){g.panLeft(C);A=true}else{if(B===38){g.panUp(C);A=true}else{if(B===39){g.panRight(C);A=true}else{if(B===40){g.panDown(C);A=true}}}}return A};w.init()};a=new p(q,o,n);k.applyBindings(a,q[0]);return a};j=function(p,t,v){var n=p.vSource,q=n.length,s,o,r,u;t.img=[];while(q--){if(n[q].location==="internet"){t.img[q]=n[q].url}else{t.img[q]=locationPath+n[q].url}}if(n.length>1){s=".slidesjs-container";c("#"+p.attr("id").replace("inset","slides")).slidesjs({height:t.height-50,width:t.width,navigation:{effect:"fade"},pagination:{effect:"fade"},effect:{fade:{speed:400}},play:{active:true,effect:"slide",interval:5000,auto:true,swap:true,pauseOnHover:false,restartDelay:2500}})}else{s="."+p.attr("id")}h("image",p,null,s,null);o=p.find("a");q=o.length;while(q--){r=o[q];u=c(r);if(!u.hasClass("slidesjs-navigation")){r.tabIndex=-1}else{r.tabIndex=0;r.innerText="";r.innerHTML="";u.addClass("gcviz-inset-button");if(u.hasClass("slidesjs-previous")){u.append('<img class="gcviz-imginset-button" src="'+v[0]+'" />')}else{if(u.hasClass("slidesjs-next")){u.append('<img class="gcviz-imginset-button" src="'+v[1]+'" />')}else{if(u.hasClass("slidesjs-play")){u.append('<img class="gcviz-imginset-button" src="'+v[2]+'" />')}else{if(u.hasClass("slidesjs-stop")){u.append('<img class="gcviz-imginset-button" src="'+v[3]+'" />')}}}}}}};f=function(o,n){var s=o.vSource,r=s.length,u="#"+o[0].id+"v",q=c(u),t=o.find(".gcviz-play-background"),p={beforeOpen:function(){q.find("video").height((window.innerHeight*0.8));t.addClass("gcviz-hidden")},close:function(){q.find("video")[0].pause();t.removeClass("gcviz-hidden")}};n.vid=[];while(r--){if(s[r].location==="internet"){n.vid[r]=s[r].url}else{n.vid[r]=locationPath+s[r].url}}h("inline",o,q,u,p)};l=function(n){var q="#"+n[0].id+"h",p=c(q),o={beforeOpen:null,close:null};h("inline",n,p,q,o)};b=function(p,C,t){var A=C.inset,x=A.layers.length,q=A.layers,z=p[0].id,n,v=c("#"+z.replace("inset","load")),s=z+"m",y=window.innerHeight*0.8,w,o="#"+s,B=c(o),u;n=g.createInset(s,A,t.mapid);q=q.reverse();while(x--){var r=q[x];g.addLayer(n,r.type,r.url)}if(C.inset.type!=="static"){if(C.inset.typeinfo.pan){B[0].tabIndex=0}}p.find(".mp-link").magnificPopup({items:{src:o,type:"inline"},callbacks:{beforeOpen:function(){u=p.find(o).css("height");w=g.getMapCenter(n);B.addClass("mp-inset");B.height(y);v.addClass("gcviz-load-open");v.removeClass("gcviz-hidden")},open:function(){g.resizeMap(n);var D={point:w,interval:700};g.resizeCenterMap(n,D)},change:function(){setTimeout(function(){v.addClass("gcviz-hidden")},2000)},beforeClose:function(){v.removeClass("gcviz-load-open");v.removeClass("gcviz-hidden")},close:function(){p.find(o).css({height:u});var D={interval:700};g.resizeCenterMap(n,D)},afterClose:function(){B.removeClass("mfp-hide");B.removeClass("mp-inset");setTimeout(function(){v.addClass("gcviz-hidden")},2000)}},key:"map-key",mainClass:"mfp-with-fade"});return n};h=function(o,n,q,r,p){if(o==="inline"){n.find(".mp-link").magnificPopup({items:{src:r,type:"inline"},callbacks:{beforeOpen:p.beforeOpen,open:function(){q.addClass("mp-inset");var s=q.find("video")[0];if(s){s.play()}},close:p.close,afterClose:function(){q.removeClass("mfp-hide");q.removeClass("mp-inset")}},key:"inline-key",mainClass:"mfp-with-fade"})}else{n.find(r).magnificPopup({delegate:"a",type:"image",key:"image-key",mainClass:"mfp-with-fade",closeOnContentClick:true,gallery:{enabled:true}})}};return{initialize:d}})}).call(this);