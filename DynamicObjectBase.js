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

DynamicObjectBase.prototype.push = function(vector){

  vector.set(closestMult(1, vector.x), closestMult(1, vector.y), closestMult(1, vector.z));
  printVector(vector);
  //this.time.addCommand("push", vector);
  //TIME.addCommand({start: 
}

DynamicObjectBase.prototype.update = function(delta){
  
}

DynamicObjectBase.prototype.printState = function(){
  
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
