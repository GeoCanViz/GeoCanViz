(function(){define([],function(){var a;a=function(b){var c=function(f){var d=this,g,h,j,i=f,e=new esri.symbol.Font();d.init=function(){h=new esri.toolbars.Draw(i,{showTooltips:false});dojo.connect(h,"onDrawEnd",g);e.setSize("10pt");e.setWeight(esri.symbol.Font.WEIGHT_BOLD)};d.drawLine=function(){h.activate(esri.toolbars.Draw.FREEHAND_POLYLINE)};d.drawText=function(k){j=k;h.activate(esri.toolbars.Draw.POINT)};d.erase=function(){i.graphics.clear()};g=function(l){var k,m;h.deactivate();if(l.type==="polyline"){k=new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color("#FF0000"),3);$("#"+i.vIdName+"_0_container").removeClass("gcviz-draw-cursor")}else{if(l.type==="point"){k=new esri.symbol.TextSymbol(j);k.setFont(e);k.setOffset(0,0);j="";$("#"+i.vIdName+"_0_container").removeClass("gcviz-text-cursor")}}m=new esri.Graphic(l,k);i.graphics.add(m)};d.init()};return new c(b)};return{initialize:a}})}());