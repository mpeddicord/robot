DynamicObjectBase = function(data) {
  //this.dataUnusedProperties = [];
  
  if (data == undefined)
    data = { pos:{x:0,y:0,z:0} };
    
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
}

DynamicObjectBase.prototype.snapToGrid = function(){
  this.body.rotation.x = closestMult(Math.PI/2, this.body.rotation.x);
  this.body.rotation.y = closestMult(Math.PI/2, this.body.rotation.y);
  this.body.rotation.z = closestMult(Math.PI/2, this.body.rotation.z);
  this.body.position.x = closestMult(stepSize, this.body.position.x);
  this.body.position.y = closestMult(stepSize, this.body.position.y);
  this.body.position.z = closestMult(stepSize, this.body.position.z);
}

DynamicObjectBase.prototype.setPosition = function(pos) {
  this.body.position.x = pos.x;
  this.body.position.y = pos.y;
  this.body.position.z = pos.z;
}

DynamicObjectBase.prototype.pushAction = function(time, commandObj){
  var dir = new THREE.Vector3();
  dir.copy(commandObj.data);
  
  dir.normalize();
  
  var basePosition = new THREE.Vector3();
  basePosition.copy(commandObj.snapshotData.position);
  dir.multiplyScalar( time * stepSize);
  basePosition.add( dir );
  this.body.position.copy(basePosition);
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
    
    moveObjInGrid(this, 
            newPos.x, 
            newPos.y, 
            newPos.z, 
            this.body.position.x, 
            this.body.position.y,
            this.body.position.z);
  }
}

DynamicObjectBase.prototype.pushStart = function(commandObj){
  var newPos = new THREE.Vector3();
  var direction = new THREE.Vector3();
  direction.copy(commandObj.data);
  direction.multiplyScalar(stepSize);
  newPos.copy(this.body.position);
  newPos.add(direction);
  
  moveObjInGrid(this, 
          this.body.position.x, 
          this.body.position.y, 
          this.body.position.z, 
          newPos.x, 
          newPos.y,
          newPos.z);
          
  return SUCCESS;
}

DynamicObjectBase.prototype.push = function(vector){
  vector.set(closestMult(1, vector.x), closestMult(1, vector.y), closestMult(1, vector.z));
  printVector(vector);
  TIME.addCommand({ action: this.pushAction, 
                    data: vector, 
                    object: this, 
                    start: this.pushStart, 
                    complete: function(){}, 
                    uncomplete: this.pushUncomplete, 
                    snapshotFunction:this.takeSnapshot});
}

DynamicObjectBase.prototype.takeSnapshot = function(){
  var positionCopy = new THREE.Vector3();
  positionCopy.copy(this.body.position);
  var rotationCopy = new THREE.Vector3();
  rotationCopy.copy(this.body.rotation);
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
