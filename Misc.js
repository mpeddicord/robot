var stepLength = 0.5;
var stepSize = 50;
var gridSize = 22;
var EPSILON = 0.00000001;
var offset = (stepSize * gridSize) / 2;
var SUCCESS = true;

var markersDirty = true;
var showMarkers = false;
var markers = [];

var scene = new THREE.Scene();

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


var collisionGrid = new Array(gridSize);
for (var x = 0; x < gridSize; x++) {
  collisionGrid[x] = new Array(gridSize);
  for (var y = 0; y < gridSize; y++) {
    collisionGrid[x][y] = new Array(gridSize);
    for (var z = 0; z < gridSize; z++) {      
      collisionGrid[x][y][z] = new Array();        
    }
  }
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

function getObjArray(x, y, z){
  x = Math.round(closestMult(stepSize, x + offset) / stepSize);
  y = Math.round(closestMult(stepSize, y + offset) / stepSize);
  z = Math.round(closestMult(stepSize, z + offset) / stepSize);
  
  if(x >= gridSize || y >= gridSize || z >= gridSize || x < 0 || y < 0 || z < 0){
    console.log("ERROR: YOU ARE OUTSIDE THE SCOPE OF COLLISONGRID!");
    return [];
  }else{
    return collisionGrid[x][y][z];
  }
}

function moveObjInGrid(obj, oldPos, newPos){
  markersDirty = true;

  var oldArray = getObjArray(oldPos.x, oldPos.y, oldPos.z);
  var newArray = getObjArray(newPos.x, newPos.y, newPos.z);
  
  var index = oldArray.indexOf(obj);
  if(index == -1){
    console.log("OH SHIT! WE DONT HAVE AN INDEX!");
  }
  
  newArray.push(oldArray[index]);
  oldArray.splice(index, 1);
}

function addObjToGrid(obj, pos){
  getObjArray(pos.x, pos.y, pos.z).push(obj);
}

function accumulateMass(obj, direction, objList) {
  var v = new THREE.Vector3();
  v.addVectors(obj.body.position, direction);
  
  objList.push(obj);
  
  var oa = getObjArray(v.x, v.y, v.z);
  
  if (oa.length == 0)
    return obj.mass;

  return obj.mass + accumulateMass(oa[0], direction, objList);
}
