(function(){define(["jquery-private","gcviz-func","gcviz-gisgeo","esri/layers/GraphicsLayer","esri/toolbars/draw","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol","esri/symbols/TextSymbol","esri/geometry/ScreenPoint","esri/geometry/Point","esri/geometry/Polygon","esri/geometry/Polyline","esri/graphic","dojo/on"],function(p,s,n,k,e,r,h,c,a,d,f,o,g,j,m){var b,q,i,l;b=function(w,y,u,v,x,t){var z=function(S,C,Z,P,N,af){var J=this,H,an,am,ap,ac,ai,I,L,ao,ab,O,T,ad,D,ae,A,U,Q,K,V,R,al,E,W=Z,M=P,aa=S,F=aa.vWkid,Y=N,aq=af,aj=[0,0,0,255],ag=[229,0,51,255],ah=[0,140,0,255],X=[0,77,255,255],G=[255,217,51,255],B=[255,255,255,255],ak=[205,197,197,100];J.init=function(){S.addLayer(new k({id:"gcviz-symbol"}));H=aa.getLayer("gcviz-symbol");Q=new e(aa,{showTooltips:false});m(Q,"DrawEnd",O)};J.deactivate=function(){Q.deactivate()};J.drawLine=function(ar){T(ar);Q.setLineSymbol(ad(V,2));Q.activate(e.FREEHAND_POLYLINE)};J.drawLineWCAG=function(at,ar){T(ar);n.projectCoords(at,aa.spatialReference.wkid,O)};J.drawText=function(at,ar){K=at;T(ar);Q.activate(e.POINT)};J.drawTextWCAG=function(ar,au,at){K=au;T(at);n.projectCoords([[ar[0],ar[1]]],aa.spatialReference.wkid,O)};J.drawExtent=function(){Q.setFillSymbol(U());Q.activate(e.EXTENT)};J.erase=function(){var at=[],au=H.graphics,ar=H.graphics.length;while(ar--){at.push(au[ar])}if(at.length>0){W.push({task:"delete",geom:at})}H.clear();aa.graphics.clear();C(false)};J.eraseSelect=function(ax){var ay,au,aw=[],ar=[],at=H.graphics,av=H.graphics.length;while(av--){ay=at[av];if(ax.intersects(ay.geometry)){aw.push(ay.key)}}au=aw.length;while(au--){av=at.length;while(av--){ay=at[av];if(aw[au]===ay.key){H.remove(ay);ar.push(ay)}}}if(ar.length>0){W.push({task:"delete",geom:ar})}if(H.graphics.length===0){C(false)}else{if(H.graphics.length===1&&H.graphics[0]._extent.xmax===0){C(false)}}};J.eraseUnfinish=function(){var au=H.graphics,ar=au.length,av=au[ar-1].key,at=av;while(ar--&&av===at){H.remove(au[ar]);if(ar>0){at=au[ar-1].key}}I.remove();S.graphics.clear()};J.undo=function(){var at=W.pop(),au=at.geom,ar=au.length;if(at.task==="delete"){while(ar--){H.add(au[ar])}}else{while(ar--){H.remove(au[ar])}}M.push(at);if(H.graphics.length===0){C(false)}else{if(H.graphics.length===1&&H.graphics[0]._extent.xmax===0){C(false)}else{C(true)}}};J.redo=function(){var at=M.pop(),au=at.geom,ar=au.length;if(at.task==="delete"){while(ar--){H.remove(au[ar])}}else{while(ar--){H.add(au[ar])}}W.push(at);if(H.graphics.length===0){C(false)}else{if(H.graphics.length===1&&H.graphics[0]._extent.xmax===0){C(false)}else{C(true)}}};J.addMeasure=function(av,aC,ax,az,ar,aA){var au,at,aw=false,aB=aA.screenPoint,ay=aa.toMap(new d(aB.x,aB.y));R=aC;T(ar);au=av().length;if(au>=1){at=av()[au-1];if(at.x===ay.x&&at.y===ay.y){aw=true}}if(!aw){av().push(ay);if(ax===0){if(au===0){an(av());I=S.on("mouse-move",s.debounce(function(aD){var aE=aD.screenPoint,aF=aa.toMap(new d(aE.x,aE.y));L(aF,az)},50,false))}else{n.measureLength(av(),az,an)}}else{if(ax===1){am(av)}}}};J.addMeasureSumLength=function(ax,aC,az){var aE,aD,av,au,ay=0,aw=ax().length,aB=ax()[aw-1],aA=ax()[aw-2],at=(Math.atan2((aB.y-aA.y),(aB.x-aA.x))*(180/Math.PI)),ar=Math.round(at/90);R=aC;while(aw--){aE=ax()[aw];if(aE.hasOwnProperty("distance")){ay+=aE.distance}}if(ar===0){av=20;au=10}else{if(ar===1){av=0;au=10}else{if(ar===-1){av=0;au=-20}else{av=-20;au=10}}}ay=Math.floor(ay*100)/100;aD=Y+ay+" "+az;aB.text=aD;ai(aB,0,av,au);l(R);I.remove();S.graphics.clear()};J.addMeasureSumArea=function(aw,ay,ax){var aA,at,ar,au=[],av=aw().length,az=av-1;R=ay;while(av--){aA=aw()[av];au.push([aA.x,aA.y])}aA=aw()[az];au.push([aA.x,aA.y]);at={rings:[au],spatialReference:{wkid:F}};ar=new o(at);n.measureArea(ar,ax,ap)};ap=function(au,ar,at){var av={};av.area=Math.floor(ar.areas[0]*100)/100;av.length=Math.floor(ar.lengths[0]*100)/100;av.unit=at;n.labelPoints(au,av,ac)};ac=function(ar,au){var at=ar[0],av={geometry:{x:at.x,y:at.y,spatialReference:{wkid:F}}};av.text=aq+au.area+" "+au.unit+"2";ai(av,0,0,0);l(R)};an=function(ax,az){var aC,aA,ay,aB,at,ar,av=0,au=-15,aw=ax.length;if(aw>1){aA=ax[aw-1];ay=ax[aw-2];aC={geometry:{paths:[[[aA.x,aA.y],[ay.x,ay.y]]],spatialReference:{wkid:F}}};z=new j(aC);z.symbol=ad(V,1);z.key=R;H.add(z);aB={geometry:{x:(aA.x+ay.x)/2,y:(aA.y+ay.y)/2,spatialReference:{wkid:F}}};aB.text=aA.distance+" "+az;at=(Math.atan2((aA.y-ay.y),(aA.x-ay.x))*(180/Math.PI));if(at>90||at<-90){at-=180}ar=Math.round(Math.abs(at)/90);if(ar===1){av=15;au=0}else{if(ar===3){av=-15;au=0}}ai(aB,at,av,au)}z=new j(ax[aw-1]);z.symbol=ae(V,4);z.key=R;H.add(z);S.graphics.clear()};L=function(ay,aw){var av=aa.spatialReference,au=H.graphics,ar=au.length,ax=au[ar-1].geometry,at={geometry:{paths:[[[ax.x,ax.y],[ay.x,ay.y]]],spatialReference:{wkid:F}}};S.graphics.clear();z=new j(at);z.symbol=ad(V,1);S.graphics.add(z);n.measureLength([new f(ax.x,ax.y,av),new f(ay.x,ay.y,av)],aw,ao)};ao=function(ax,ar){var at,aw,au=ax[1],av=au.distance;if(av>0){aw=new j(au,at);aw.symbol=A(V,au.distance+" "+ar,8,0,0,-10,"normal","center");ab(aw,al,"center",12,0,-2,-11,S.graphics);S.graphics.add(aw)}};am=function(ay){var av,ax,au=[],ar=ay().length,at=ar,aw=ar-1;z=new j(ay()[ar-1]);z.symbol=ae(V,4);z.key=R;H.add(z);if(ar>1){while(at--){av=ay()[at];au.push([av.x,av.y])}av=ay()[aw];au.push([av.x,av.y]);ax={geometry:{rings:[au],spatialReference:{wkid:F}}};if(ar>2){H.remove(H.graphics[H.graphics.length-2])}z=new j(ax);z.symbol=D(V,ak,1);z.key=R;H.add(z)}};ai=function(av,aw,at,ar){var ax,au;ax=new j(av,au);ax.symbol=A(V,av.text,8,aw,at,ar,"normal","center");ax.key=R;ab(ax,al,"center",12,aw,at,ar-2,H);H.add(ax);C(true)};ab=function(aF,ay,ax,aG,au,aE,aC,av){var ar,aB,az,aw,aD="",at=aF.symbol,aA=aF.geometry;aB={geometry:{x:aA.x,y:aA.y,spatialReference:{wkid:F}}};az=s.getTextWidth(at.text,at.font);aw=Math.ceil(az/9);if(aw<5){aw+=1}while(aw--){aD+="\u2588"}ar=new j(aB);ar.symbol=A(ay,aD,aG,au,aE,aC,"bold",ax);ar.key=R;av.add(ar)},O=function(at){var aw,av,ar,au=new r();if(at.length===undefined){av=at}else{if(at.length===1){av=at[0]}else{av=new g(at[0].spatialReference);av.addPath(at)}}ar=av.type;R=s.getUUID();if(ar==="extent"){J.eraseSelect(av)}else{if(ar==="polyline"){au=ad(V,2);aw=new j(av,au)}else{if(ar==="point"){au=A(V,K,8,0,0,0,"normal","left");aw=new j(av,au);ab(aw,al,"left",12,0,-4,-1,H);J.deactivate();setTimeout(function(){s.getElemValueVM(aa.vIdName,["draw","isTextDialogOpen"],"js")(true)},1000);setTimeout(function(){Q.activate(e.POINT)},1500)}}aw.key=R;H.add(aw);C(true);l(R)}};l=function(av){var aw,at=[],au=H.graphics,ar=H.graphics.length;while(ar--){aw=au[ar];if(aw.key===av){at.push(aw)}}W.push({task:"add",geom:at})};T=function(ar){if(ar==="red"){V=ag;al=B}else{if(ar==="green"){V=ah;al=B}else{if(ar==="blue"){V=X;al=B}else{if(ar==="yellow"){V=G;al=aj}else{if(ar==="white"){V=B;al=aj}else{V=aj;al=B}}}}}E=ar};ad=function(ar,at){return new r({type:"esriSLS",style:"esriSLSSolid",color:ar,width:at})};D=function(ar,au,at){return new h({type:"esriSFS",style:"esriSFSSolid",color:au,outline:{type:"esriSLS",style:"esriSLSSolid",color:ar,width:at}})};ae=function(ar,at){return new c({type:"esriSMS",style:"esriSMSCircle",color:ar,size:at,angle:0,xoffset:0,yoffset:0})};A=function(ar,ay,at,ax,aw,au,av,az){return new a({type:"esriTS",color:ar,verticalAlignment:"baseline",horizontalAlignment:az,rightToLeft:false,angle:ax,xoffset:aw,yoffset:au,text:ay,font:{family:"Arial",size:at,style:"normal",weight:av,decoration:"none"}})};U=function(){return new h({type:"esriSFS",style:"esriSFSSolid",color:ak,outline:{type:"esriSLS",style:"esriSLSSolid",color:[205,197,197,255],width:2}})};J.init()};return new z(w,y,u,v,x,t)};q=function(y,u,z){var x,A,w=s.getUUID(),v=y.getLayer("gcviz-symbol"),t=u.length;if(t>0){z(true)}while(t--){x=u[t];A=new j(x);A.key=w;v.add(A)}l(w)};i=function(x){var w,y,v=[],u=x.getLayer("gcviz-symbol").graphics,t=u.length;while(t--){y=u[t];w=y.toJson();w.key=y.key;v.push(w)}return JSON.stringify(v)};return{initialize:b,importGraphics:q,exportGraphics:i}})}());