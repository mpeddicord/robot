var SUCCESS = true;
var FAILURE = false;

var markersDirty = true;
var showMarkers = false;
var markers = [];

function marker(__x, __y, __z, color){
  blockGeo = new THREE.CubeGeometry( stepSize/6, stepSize/6, stepSize/6 );
  personalColor = [
      new THREE.MeshLambertMaterial( { color: color, shading: THREE.FlatShading, overdraw: false} ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 1, transparent: true, opacity:1} )
    ];
  
  var cube = THREE.SceneUtils.createMultiMaterialObject( blockGeo, personalColor );
  cube.position.x = __x;
  cube.position.y = __y;
  cube.position.z = __z;
  scene.add(cube);
  markers.push(cube);
};

function clearMarkers(){
  markersDirty = true;
  for(var i in markers){
    scene.remove(markers[i]);
  }
  markers = [];
}

function closestMult(snap, value)
{
  var fraction  = value / snap;
  var whole = Math.floor(fraction);
  var percentage = fraction - whole;
  
  if(percentage < 0.5){
    return whole * snap;
  } else {
    return (whole + 1) * snap;
  }
}

function printVector(vector, name){
  var print = "";
  if(name != undefined)
    print += name + ": ";
  print += "v(" + vector.x + ", " + vector.y + ", " + vector.z + ")";
  console.log(print);
}

function updateMarkers() {
  clearMarkers();
  
  if (!showMarkers || !markersDirty)
    return;
    
  for (var x = 0; x < gridSize; x++) {
    for (var y = 0; y < gridSize; y++) {
      for (var z = 0; z < gridSize; z++) {
        if (collisionGrid[x][y][z].length > 0){
          for (var i in collisionGrid[x][y][z]) {
            var obj = collisionGrid[x][y][z][i];
            var isBot = obj.turnLeft != undefined;
            var color = 0x00ff00;
            if(isBot){
              color = 0xff0000;
              //printVector(collisionGrid[x][y][z][0].body.position, "Bot location");
              //console.log(x+","+y+","+z);
            }
            new marker(x*50, (y*50) + 20 + (i*10), z*50, color);
          }
        }
      }
    }
  }
  
  markersDirty = false;
}
