(function(){define(["jquery-private","gcviz-gismap","esri/geometry/Point","esri/dijit/OverviewMap","esri/dijit/Scalebar","dojo/dom"],function(e,h,g,k,c,f){var b,a,i,j,d;b=function(l,t){var p,n,o=null,s=l.vIdName,q=f.byId("divOverviewMap"+s),r=t.type,m=t.url,u={map:l,expandFactor:2,height:100,width:230};o=h.getOverviewLayer(r,m);if(o!==null){u.baseLayer=o}p=new k(u,q);p.startup();n=e("#divOverviewMap"+s+"-map");n.width(230).height(100);p.resize()};a=function(m,o){var l,p=f.byId("divScalebar"+m.vIdName),n={map:m,scalebarStyle:"line",scalebarUnit:"metric",height:25,width:200};if(o.unit===2){n.units="english"}l=new c(n,p)};i=function(o,n,l){var m=e.Deferred();l+=n+","+o+","+n+","+o;e.getJSON(l).done(function(p){m.resolve({nts:p.features[0].properties.identifier+" - "+p.features[0].properties.name})});return m};j=function(o,n,l){var m=e.Deferred();l+=n+","+o+","+n+","+o;e.getJSON(l).done(function(p){m.resolve({zone:p.features[0].properties.identifier})});return m};d=function(l){l.setExtent(l.vFullExtent,l.spatialReference.wkid)};return{setOverview:b,setScaleBar:a,getNTS:i,getUTMzone:j,zoomFullExtent:d}})}());