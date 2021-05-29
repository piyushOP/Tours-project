
export const displayMap = (locations) => {
   mapboxgl.accessToken = 'pk.eyJ1IjoidG9yZXR0bzAxMSIsImEiOiJja3A0MGdqYmMwOW11MzJscmg3N2FsZ2F3In0.QUajXmHo40G30vVmgjcs3Q';
 
   const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/toretto011/ckp42hxdt7y7k17o149bp3dkj',
      scrollZoom: false
      // center: [-118.113491, 34.111745],
      // zoom: 10,
      // interactive: false
   });
   
   const bounds = new mapboxgl.LngLatBounds();
   
   locations.forEach(loc => {
      // Create marker
      const el = document.createElement('div');
      el.className = 'marker';

      // Add marker
      new mapboxgl.Marker({
         element: el,
         anchor: 'bottom'
      })
         .setLngLat(loc.coordinates)
         .addTo(map);

      // Add popup
      new mapboxgl.Popup({
         offset: 30
      })
         .setLngLat(loc.coordinates)
         .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
         .addTo(map);

      // Extend map bounds to include current location
      bounds.extend(loc.coordinates);
   });

   map.fitBounds(bounds, {
      padding: {
         top: 200,
         bottom: 150,
         left: 100,
         right: 100
      }
   });
}


