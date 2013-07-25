var stepLength = 0.25;
var stepSize = 50;
var gridSize = 22;
var EPSILON = 0.00000001;
var offset = (stepSize * gridSize) / 2;

var collisionGrid = new Array(gridSize);
for (var x = 0; x < gridSize; x++) {
  collisionGrid[x] = new Array(gridSize);
  for (var y = 0; y < gridSize; y++) {
    collisionGrid[x][y] = new Array(gridSize);
    for (var z = 0; z < gridSize; z++) {      
      collisionGrid[x][y][z] = [];
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

function moveObjInGrid(obj, oldPos, newPos){
  var newArray = getObjArray(newPos.x, newPos.y, newPos.z);
  
  //var spaceOccupied = (newArray.length) > 1 || (newArray.length == 1 && newArray[0] != obj);
  //if (spaceOccupied)
  //  return FAILURE;
    
  markersDirty = true;
  
  var oldArray = getObjArray(oldPos.x, oldPos.y, oldPos.z);
  var index = oldArray.indexOf(obj);
  if(index == -1){
    console.log("OH SHIT! WE DONT HAVE AN INDEX!");
  }
  
  newArray.push(oldArray[index]);
  oldArray.splice(index, 1);
  return SUCCESS;
}

function addObjToGrid(obj, pos){
  getObjArray(pos.x, pos.y, pos.z).push(obj);
}

function accumulateMass(obj, direction, objList) 
{
  var v = new THREE.Vector3();
  v.addVectors(obj.body.position, direction);
  
  objList.push(obj);
  
  var oa = getObjArray(v.x, v.y, v.z);
  
  if (oa.length == 0)
    return obj.mass;

  return obj.mass + accumulateMass(oa[0], direction, objList);
}

function Physics() 
{  
  function updateBegin() 
  {
    for (var i=0; i<allObjects.length; ++i) {
      var o = allObjects[i];
      var p = o.gridPos;

      var below = {x:p.x, y:p.y-stepSize, z:p.z};
      
      var objsBelow = [];
      var somethingBeneath = true;
      if (p.y > 0) {
        var objsBelow = getObjArray(below.x, below.y, below.z);
        somethingBeneath = (objsBelow.length) > 0;
        
        if (somethingBeneath) {
          for(var j=0;j<objsBelow.length;++j) {
            objsBelow[j].applyForce({x:0,y:-1,z:0});
          }
        }
      }
        
      o.onSurface = somethingBeneath;
      o.applyForce({x:0,y:-1,z:0});
    }
  }
  
  function updateEnd()
  {
    for (var i=0; i<allObjects.length; ++i) {    
      var o = allObjects[i];
      o.convertVectorToPush();
    }
  }

  return {
    updateBegin:updateBegin,
    updateEnd:updateEnd
  };
}

PHYSICS = new Physics();
