/* UI + Cesium rendering. Movement rules live in flight-core.js. */
(() => {
 const $ = id => document.getElementById(id);
 if (typeof Cesium === 'undefined') { $('message').textContent='Cesium did not load. Check your internet connection or CDN access.'; return; }
 const sites = [
   {name:"Alvernia Student Center — approximate viewpoint",lon:-75.938187,lat:40.309705},
   {name:'Pyramids of Giza',lon:31.1342,lat:29.9792},
   {name:'Valley of the Kings',lon:32.6014,lat:25.7402},
   {name:'Egyptian Museum — Tahrir, Cairo',lon:31.2333,lat:30.0478}
 ];
 let selectedSite=0;
 let trip=null;
 const route=[0,1,2,3,0];
 const legSeconds=[35,20,20,35];
 function beginTrip(){
   goToSite(0);
   trip={leg:0,elapsed:0,dwell:0};state.paused=false;
   $('trip-status').textContent='Round trip started';
 }

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
   trip=null;
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
 function follow(){
   const range=trip && !trip.dwell ? 2500+Math.sin(Math.PI*Math.min(trip.elapsed/legSeconds[trip.leg],1))*1500000:2500;
   viewer.camera.lookAt(position(),new Cesium.HeadingPitchRange(Cesium.Math.toRadians(state.heading),Cesium.Math.toRadians(-55),range));
 }
 function advanceTrip(dt){
   if(state.paused)return;
   if(trip.dwell>0){
     trip.dwell=Math.max(0,trip.dwell-dt);
     if(trip.dwell===0){trip.leg++;trip.elapsed=0;}
     return;
   }
   trip.elapsed+=dt;
   const fraction=Math.min(trip.elapsed/legSeconds[trip.leg],1);
   const from=sites[route[trip.leg]],to=sites[route[trip.leg+1]];
   const geodesic=new Cesium.EllipsoidGeodesic(Cesium.Cartographic.fromDegrees(from.lon,from.lat),Cesium.Cartographic.fromDegrees(to.lon,to.lat));
   const point=geodesic.interpolateUsingFraction(fraction);
   state.lon=Cesium.Math.toDegrees(point.longitude);state.lat=Cesium.Math.toDegrees(point.latitude);
   state.height=500+Math.sin(Math.PI*fraction)*10000;
   $('trip-status').textContent=`Leg ${trip.leg+1}/4: ${from.name} → ${to.name} (${Math.round(fraction*100)}%)`;
   if(fraction===1){
     state.lon=to.lon;state.lat=to.lat;state.height=500;selectedSite=route[trip.leg+1];
     $('site-name').textContent=to.name;
     if(trip.leg===3){trip=null;state.paused=true;$('trip-status').textContent='Round trip complete — back at Alvernia Student Center.';}
     else{trip.dwell=6;$('trip-status').textContent=`Arrived at ${to.name} — 6-second stop`;}
   }
 }
 $('start-trip').onclick=beginTrip;
 $('restart-trip').onclick=()=>{goToSite(0);$('trip-status').textContent='Ready at Alvernia. Click Start round trip.';};

 $('fly').onclick=()=>{state.paused=false;paint();};
 $('slow').onclick=()=>{state.speed=20;$('speed').value=20;paint();};
 $('pause').onclick=()=>{state.paused=true;paint();};
 $('left').onclick=()=>{state.heading=Flight.wrap(state.heading-10);paint();follow();};
 $('right').onclick=()=>{state.heading=Flight.wrap(state.heading+10);paint();follow();};
 $('reset').onclick=()=>{goToSite(selectedSite);$('trip-status').textContent='Round trip stopped. Click Start round trip to begin again.';};
 for(const [id,min,max] of [['speed',0,250],['height',50,5000]]){
   $(id).onchange=()=>{const n=Number($(id).value);if(Number.isFinite(n))state[id]=Flight.clamp(n,min,max);$(id).value=state[id];paint();follow();};
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){state.paused=true;paint();}});
 let last=performance.now(),lastPaint=0;
 viewer.scene.preRender.addEventListener(()=>{
   const now=performance.now(), dt=Math.min((now-last)/1000,0.1);last=now;
   if(trip)advanceTrip(dt);else state=Flight.step(state,dt);
   if(!state.paused)follow();
   if(now-lastPaint>150){paint();lastPaint=now;}
 });
 paint();follow();
 }catch(error){$('message').textContent='The globe could not start. Check WebGL support and the browser console.';console.error(error);}
})();
