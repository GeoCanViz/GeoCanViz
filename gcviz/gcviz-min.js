/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: v0.0.1-development Build: 2013-10-30- 03:30 PM
 *
 */
var mapArray={},locationPath;(function(){var b,a;define(["gcviz-v-map","gcviz-v-inset","gcviz-v-tbmain","gcviz-v-tbfoot","gcviz-v-tbanno","gcviz-v-tbnav"],function(c,l,d,j,g,h){var i,k,f,e;i=function(){var o=$(".gcviz"),n,m=o.length;b=m;a=0;e();while(m--){n=o[m];k(n)}};k=function(m){$.ajax({url:m.getAttribute("data-gcviz"),crossDomain:true,dataType:"json",async:false,success:function(n){n.gcviz.mapframe.id=m.getAttribute("id");f(m,n.gcviz);console.log("config file read")},error:function(){console.log("error loading config file")}})};f=function(r,n){var q,p=$(r),m=n.mapframe.id,o=n.mapframe.size;p.wrap("<section id=section"+m+' class="gcviz-section" role="map" style="width:'+o.width+"px; height:"+o.height+'px;">');q=$(document).find("#section"+m);$.extend(q,n);mapArray[m]=c.initialize(q);mapArray[m].reverse();d.initialize(q);j.initialize(q);if(n.toolbaranno.enable){g.initialize(q)}if(n.toolbarnav.enable){h.initialize(q)}if(n.insetframe.enable){l.initialize(q)}a+=1;if(a===b){$.event.trigger("gcviz-ready")}};e=function(){var p=document.getElementsByTagName("meta"),n=p.length;while(n--){if(p[n].getAttribute("property")==="location"){locationPath=p[n].getAttribute("content")}}if(typeof locationPath==="undefined"){var m=window.location.toString(),o=m.search("GeoCanViz");if(o!==-1){locationPath=m.substring(0,m.search("GeoCanViz"))+"GeoCanViz/"}}};return{initialize:i}})}).call(this);