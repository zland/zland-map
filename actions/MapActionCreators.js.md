

<!-- Start actions/MapActionCreators.js -->

# [MapActionCreators.js](MapActionCreators.js)

action creators mostly forward google map events

## mapProjection(projection, map)

when goole map is rendered the stores need to get the projection
to convert positions from pixels to latlng and vice versa

### Params:

* **Object** *projection* google map projection
* **Object** *map* google map object

## overlayProjection()

**Deprecated**

## mapCenter(center)

whenever the center changes we need to know

### Params:

* **Object** *center* coordinates

<!-- End actions/MapActionCreators.js -->

