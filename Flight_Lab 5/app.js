/* UI + Cesium rendering. Movement rules live in flight-core.js. */
(() => {
 const $ = id => document.getElementById(id);
 if (typeof Cesium === 'undefined') { $('message').textContent='Cesium did not load. Check your internet connection or CDN access.'; return; }
 const sites = [
   {name:'Pyramids of Giza',lon:31.1342,lat:29.9792},
   {name:'Valley of the Kings',lon:32.6014,lat:25.7402},
   {name:'Egyptian Museum — Tahrir, Cairo',lon:31.2333,lat:30.0478}
 ];
 let selectedSite=0;
 let state = Flight.initial();
 try {
 const viewer = new Cesium.Viewer('globe', {
   baseLayer:false, baseLayerPicker:false, geocoder:false, animation:false,
   timeline:false, homeButton:false, sceneModePicker:false, navigationHelpButton:false,
   fullscreenButton:false, infoBox:false, selectionIndicator:false,
   terrainProvider:new Cesium.EllipsoidTerrainProvider()
 });
 viewer.imageryLayers.addImageryProvider(new Cesium.GridImageryProvider());
 const satellite = new Cesium.UrlTemplateImageryProvider({
   url:'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
   maximumLevel:19,
   credit:'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
 });
 const satelliteLayer=viewer.imageryLayers.addImageryProvider(satellite);
 satellite.errorEvent.addEventListener(()=>{$('imagery-status').textContent='Some satellite tiles could not load. Try Grid view or check your internet connection.';});
 $('map-view').onchange=()=>{satelliteLayer.show=$('map-view').value==='satellite';$('imagery-status').textContent=satelliteLayer.show?'Satellite imagery requires internet access.':'Grid view selected.';};
 const position = () => Cesium.Cartesian3.fromDegrees(state.lon, state.lat, state.height);
 const plane = viewer.entities.add({
   position: new Cesium.CallbackProperty(position, false),
   point:{pixelSize:16,color:Cesium.Color.GOLD,outlineColor:Cesium.Color.BLACK,outlineWidth:2},
   label:{text:'SIMULATED FLIGHT',font:'14px sans-serif',pixelOffset:new Cesium.Cartesian2(0,-28),showBackground:true}
 });
 sites.forEach(site=>viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(site.lon,site.lat,0),
   point:{pixelSize:10,color:Cesium.Color.WHITE},
   label:{text:site.name,font:'14px sans-serif',pixelOffset:new Cesium.Cartesian2(0,22),showBackground:true}}));
 function goToSite(index){
   selectedSite=index;
   state={...Flight.initial(),lon:sites[index].lon,lat:sites[index].lat};
   $('speed').value=state.speed;$('height').value=state.height;
   $('site-name').textContent=sites[index].name;
   paint();follow();
 }
 document.querySelectorAll('[data-site]').forEach(button=>button.onclick=()=>goToSite(Number(button.dataset.site)));
 function paint(){
   $('message').textContent=state.paused?'Paused — ready to inspect':'Flying — simulated movement';
   $('readout').textContent=`Heading ${state.heading.toFixed(0)}° · Longitude ${state.lon.toFixed(5)} · Latitude ${state.lat.toFixed(5)} · Height ${state.height.toFixed(0)} m · Speed ${state.speed.toFixed(0)} m/s`;
 }
 function follow(){viewer.camera.lookAt(position(),new Cesium.HeadingPitchRange(Cesium.Math.toRadians(state.heading),Cesium.Math.toRadians(-30),2500));}
 $('fly').onclick=()=>{state.paused=false;paint();};
 $('slow').onclick=()=>{state.speed=20;$('speed').value=20;paint();};
 $('pause').onclick=()=>{state.paused=true;paint();};
 $('left').onclick=()=>{state.heading=Flight.wrap(state.heading-10);paint();follow();};
 $('right').onclick=()=>{state.heading=Flight.wrap(state.heading+10);paint();follow();};
 $('reset').onclick=()=>goToSite(selectedSite);
 for(const [id,min,max] of [['speed',0,250],['height',50,5000]]){
   $(id).onchange=()=>{const n=Number($(id).value);if(Number.isFinite(n))state[id]=Flight.clamp(n,min,max);$(id).value=state[id];paint();follow();};
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){state.paused=true;paint();}});
 let last=performance.now(),lastPaint=0;
 viewer.scene.preRender.addEventListener(()=>{
   const now=performance.now(), dt=Math.min((now-last)/1000,0.1);last=now;
   state=Flight.step(state,dt);
   if(!state.paused)follow();
   if(now-lastPaint>150){paint();lastPaint=now;}
 });
 paint();follow();
 }catch(error){$('message').textContent='The globe could not start. Check WebGL support and the browser console.';console.error(error);}
})();
