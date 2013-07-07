var stepLength = 0.5;
var stepSize = 50;
var gridSize = 20;
var EPSILON = 0.00000001;
var offset = (stepSize * gridSize) / 2;

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

function findObjs() {
  for (var x = 0; x < gridSize; x++) {
    for (var y = 0; y < gridSize; y++) {
      for (var z = 0; z < gridSize; z++) {
        if (collisionGrid[x][y][z].length){
          var isBot = collisionGrid[x][y][z][0].turnLeft != undefined;
          if(isBot){
            console.log(x+","+y+","+z+":"+collisionGrid[x][y][z].length);
            //console.log(?" is bot" : " is block");
            printVector(collisionGrid[x][y][z][0].body.position);
          }
        }
      }
    }
  }
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

function moveObjInGrid(obj, x1, y1, z1, x2, y2, z2){
  var oldArray = getObjArray(x1, y1, z1);
  var newArray = getObjArray(x2, y2, z2);
  
  var index = oldArray.indexOf(obj);
  if(index == -1){
    console.log("OH SHIT! WE DONT HAVE AN INDEX!");
  }
  
  newArray.push(oldArray[index]);
  oldArray.splice(index, 1);
}

function addObjToGrid(obj){
  var pos = obj.body.position;
  getObjArray(pos.x, pos.y, pos.z).push(obj);
}

function accumulateMass(obj, direction, objList) {
  var v = new THREE.Vector3();
  v.addVectors(obj.body.position, direction);
  
  objList.push(obj);
  
  var oa = getObjArray(v.x, v.y, v.z);
  
  if (oa.length == 0)
    return 1;

  return 1 + accumulateMass(oa[0], direction, objList);
}
