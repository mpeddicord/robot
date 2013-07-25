DynamicObjectBase = function(data) {
  if (data == undefined)
    return;
    
  if (data.pos == undefined)
    data.pos = {x:0,y:0,z:0};
    
  data.pos.x *= stepSize;
  data.pos.y *= stepSize;
  data.pos.z *= stepSize;
    
  if (data.color == undefined)
    data.color = 0xBBBBBB + (0x444444) * Math.random();
    
  this.personalColor = [
    new THREE.MeshLambertMaterial( { color: data.color, shading: THREE.FlatShading, overdraw: false} ),
    new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 1, transparent: true, opacity:1} )
  ];
   
  this.falling = true;
  this.pushing = false;
  
  if (data.mass == undefined) {
    this.mass = 1;
  }
  else {
    this.mass = data.mass;
  }
  
  this.body = undefined;
  this.data = data;
  this.gridPos = undefined;
  this.vector = new THREE.Vector3();
  this.onSurface = false;
  
  allObjects.push(this);
}

DynamicObjectBase.prototype.snapPosToGrid = function(p){
  return {
    x : closestMult(stepSize, p.x),
    y : closestMult(stepSize, p.y),
    z : closestMult(stepSize, p.z)
  };
}

DynamicObjectBase.prototype.snapToGrid = function(){
  this.body.rotation.x = closestMult(Math.PI/2, this.body.rotation.x);
  this.body.rotation.y = closestMult(Math.PI/2, this.body.rotation.y);
  this.body.rotation.z = closestMult(Math.PI/2, this.body.rotation.z);
  
  var pos = this.snapPosToGrid(this.body.position);
  this.setPosition(pos);
}

DynamicObjectBase.prototype.setPosition = function(pos) {
  var newPos = this.snapPosToGrid(pos);
  
  var result = FAILURE;
  if (this.gridPos == undefined) {
    addObjToGrid(this, newPos);
    result = SUCCESS;
  }
  else {
    result = moveObjInGrid(this, this.gridPos, newPos);
  }

  if (result == SUCCESS) {
    this.body.position.x = pos.x;
    this.body.position.y = pos.y;
    this.body.position.z = pos.z;

    this.gridPos = newPos;
  }
    
  return result;
}

DynamicObjectBase.prototype.pushAction = function(time, commandObj){
  if(commandObj.stopped)
    return FAILURE;

  var dir = new THREE.Vector3();
  dir.copy(commandObj.data);
  
  dir.normalize();
  
  var basePosition = new THREE.Vector3();
  basePosition.copy(commandObj.snapshotData.position);
  dir.multiplyScalar( time * stepSize);
  basePosition.add( dir );
  
  return this.setPosition(basePosition);
}

DynamicObjectBase.prototype.pushUncomplete = function(commandObj){
  if(commandObj.active)
  {
    var newPos = new THREE.Vector3();
    var direction = new THREE.Vector3();
    direction.copy(commandObj.data);
    direction.multiplyScalar(stepSize);
    newPos.copy(this.body.position);
    newPos.add(direction);    
  }
}

DynamicObjectBase.prototype.pushStart = function(commandObj){
  if (commandObj.data.x == 0 && commandObj.data.y == -1 && commandObj.data.z == 0 && this.onSurface)
    commandObj.stopped = true;

  var direction = new THREE.Vector3();
  direction.copy(commandObj.data);
    
  var newPos = new THREE.Vector3();
  direction.multiplyScalar(stepSize);
  newPos.copy(this.body.position);
  newPos.add(direction);
  
  return SUCCESS;
}

DynamicObjectBase.prototype.pushCommand = function(vector) {
  vector.set(closestMult(1, vector.x), closestMult(1, vector.y), closestMult(1, vector.z));
  printVector(vector);
  return { action: this.pushAction, 
            data: vector, 
            object: this, 
            start: this.pushStart, 
            complete: function(){}, 
            uncomplete: this.pushUncomplete, 
            snapshotFunction:this.takeSnapshot,
            passive: true,
            stopped: false };
}

DynamicObjectBase.prototype.push = function(vector){
  return TIME.addCommand(this.pushCommand(vector));
}

DynamicObjectBase.prototype.clearVector = function(){
  this.vector.set(0,0,0);
}

DynamicObjectBase.prototype.applyForce = function(vector){
  this.vector.add(vector);
}

DynamicObjectBase.prototype.convertVectorToPush = function(vector){
  var v = this.vector;
  if (v.length() > 0.5) {
    v.normalize();

    var xp = Math.abs(v.x);
    var yp = Math.abs(v.y);
    var zp = Math.abs(v.z);
    
    if (xp > yp && xp > zp) {
      v.set( (v.x>0)?1:-1, 0, 0 );
    }
    else if (yp > zp) {
      v.set( 0, (v.y>0)?1:-1, 0 );
    }
    else {
      v.set( 0, 0, (v.z>0)?1:-1 );
    }
    
    //Things shouldn't get a fall if they're on something
    if (!(v.y == -1 && this.onSurface))
      this.push(v.clone());
  }
        
  this.vector.set(0,0,0);
}

DynamicObjectBase.prototype.takeSnapshot = function(){
  var positionCopy = new THREE.Vector3();
  positionCopy.copy(this.body.position);
  var rotationCopy = this.body.rotation.clone();
  return {
    position: positionCopy,
    rotation: rotationCopy
  };
}

DynamicObjectBase.prototype.select = function() {
  this.body.children[1].material.color = new THREE.Color(0xFFFFFF);
}

DynamicObjectBase.prototype.deselect = function() {
  this.body.children[1].material.color = new THREE.Color(0x000000);
}
