function Floor(dataParams) {
  data = dataParams;
  self = this;
  
  data.x = closestMult(1, data.x) * stepSize;
  data.z = closestMult(1, data.z) * stepSize;
  data.level = closestMult(1, data.level) * stepSize;
  data.width = closestMult(1, data.width) * stepSize;
  data.length = closestMult(1, data.length) * stepSize;
  
  data.color = data.color || 0x00ffaa;
  data.opacity = data.opacity || 0.25;
  
  body = new THREE.PlaneGeometry(data.width, data.length, Math.round(data.width / stepSize), Math.round(data.length / stepSize));
  
  materials = [
    new THREE.MeshLambertMaterial( { color: data.color, transparent: true, opacity: data.opacity } ),
    new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 1, transparent: true, opacity:1} )
  ];
  
  this.plane = THREE.SceneUtils.createMultiMaterialObject( body, materials );
  
  this.plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
 
  this.plane.children[0].userData.gameObject = this;
  
  this.plane.position.x = data.x + (data.width / 2) - (stepSize /2);
  this.plane.position.y = data.level - (stepSize / 2);
  this.plane.position.z = data.z + (data.length / 2) - (stepSize /2);
  
  this.minPos = new THREE.Vector3(data.x,
                                  this.plane.position.y,
                                  data.z);
                                  
  this.maxPos = new THREE.Vector3(data.x + data.width,
                                  this.plane.position.y,
                                  data.z + data.length);
                                  
  globalFloorArray.push(this);
};

Floor.prototype.constructor = Floor;

Floor.prototype.addToScene = function(){
  scene.add( this.plane );
  globalFloorArray.push(this);
};

Floor.prototype.removeFromScene = function(){
  scene.remove( this.plane );
  var floorIndex = globalFloorArray.indexOf(this);
  if(floorIndex != -1) {
    globalFloorArray.splice(floorIndex, 1);
  }
};

Floor.prototype.getBox = function(){
  return new THREE.Box3(this.minPos, this.maxPos);
};
