(function(){define(["jquery-private","knockout","gcviz-func","gcviz-i18n","gcviz-gisdata","gcviz-gislegend"],function(b,d,h,f,c,g){var a,e;a=function(k,j){var i=function(o,n){var l=this,m=h.getElemValueVM(n,["map","map"],"js");l.tpAdd=f.getDict("%toolbardata-tpadd");l.tpDelete=f.getDict("%toolbardata-tpdelete");l.tpVisible=f.getDict("%toolbarlegend-tgvis");l.lblErrTitle=f.getDict("%toolbardata-errtitle");l.errMsg1=f.getDict("%toolbardata-err1");l.errMsg2=f.getDict("%toolbardata-err2");l.errMsg3=f.getDict("%toolbardata-err3");l.msgIE9=f.getDict("%toolbardata-ie9");l.errMsg=d.observable();l.isErrDataOpen=d.observable();l.userArray=d.observableArray([]);l.init=function(){return{controlsDescendantBindings:true}};l.launchDialog=function(){b(document.getElementById("fileDialogData"))[0].click()};l.dialogDataClose=function(){l.isErrDataOpen(false)};l.addClick=function(p,q){if(window.browser==="Explorer"&&window.browserversion===9){l.errMsg(l.msgIE9);l.isErrDataOpen(true)}else{l.add(p,q)}};l.add=function(s,u){var r,q,t=u.target.files,p=t.length;while(p--){r=t[p];q=new FileReader();q.fileName=r.name;q.onload=function(){var v=h.getUUID();c.addCSV(m,q.result,v).done(function(w){if(w===0){l.userArray.push({label:q.fileName,id:v})}else{l.isErrDataOpen(true);if(w===1){l.errMsg(l.errMsg1)}else{if(w===2){l.errMsg(l.errMsg2)}else{l.errMsg(l.errMsg3+w)}}}})};q.readAsText(r)}document.getElementById("fileDialogData").value=""};l.removeClick=function(p){m.removeLayer(m.getLayer(p.id));l.userArray.remove(p)};l.changeItemsVisibility=function(q,p){g.setLayerVisibility(m,q.id,p.target.checked);return true};l.init()};e=new i(k,j);d.applyBindings(e,k[0]);return e};return{initialize:a}})}).call(this);