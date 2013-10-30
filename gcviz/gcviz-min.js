/*!
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Version: v0.0.1-development Build: 2013-10-30- 08:32 AM
 *
 */
var mapArray={},locationPath;(function(){var b,a;define(["jquery","gcviz-v-map","gcviz-v-inset","gcviz-v-tbmain","gcviz-v-tbfoot","gcviz-v-tbanno","gcviz-v-tbnav"],function(i,c,m,d,k,g,h){var j,l,f,e;j=function(){var p=i(".gcviz"),o,n=p.length;b=n;a=0;e();while(n--){o=p[n];l(o)}};l=function(n){i.ajax({url:n.getAttribute("data-gcviz"),crossDomain:true,dataType:"json",async:false,success:function(o){o.gcviz.mapframe.id=n.getAttribute("id");f(n,o.gcviz);console.log("config file read")},error:function(){console.log("error loading config file")}})};f=function(s,o){var r,q=i(s),n=o.mapframe.id,p=o.mapframe.size;q.wrap("<section id=section"+n+' class="gcviz-section" style="width:'+p.width+"px; height:"+p.height+'px;">');r=i(document).find("#section"+n);i.extend(r,o);mapArray[n]=c.initialize(r);mapArray[n].reverse();d.initialize(r);k.initialize(r);if(o.toolbaranno.enable){g.initialize(r)}if(o.toolbarnav.enable){h.initialize(r)}if(o.insetframe.enable){m.initialize(r)}a+=1;if(a===b){i.event.trigger("gcviz-ready")}};e=function(){var q=document.getElementsByTagName("meta"),o=q.length;while(o--){if(q[o].getAttribute("property")==="location"){locationPath=q[o].getAttribute("content")}}if(typeof locationPath==="undefined"){var n=window.location.toString(),p=n.search("GeoCanViz");if(p!==-1){locationPath=n.substring(0,n.search("GeoCanViz"))+"GeoCanViz/"}}};return{initialize:j}})}).call(this);