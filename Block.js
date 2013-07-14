function Block(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( data.blockGeo, this.personalColor ); 
  this.body.children[0].userData.gameObject = this;
  
  this.setPosition(data.pos);
  
  function takeSnapshot(){
    var positionCopy = new THREE.Vector3();
    positionCopy.copy(self.body.position);
    var rotationCopy = new THREE.Vector3();
    rotationCopy.copy(self.body.rotation);
    return {
      position: positionCopy,
      rotation: rotationCopy
    };
  }
  
  function actions(time, commandObj){
    switch(commandObj.data.name){
      case "push":
        var dir = new THREE.Vector3();
        dir.copy(commandObj.data.direction);
        
        dir.normalize();
        
        var basePosition = new THREE.Vector3();
        basePosition.copy(commandObj.snapshotData.position);
        dir.multiplyScalar( time * stepSize);
        basePosition.add( dir );
        self.body.position.copy(basePosition);
      break;
    }
  }
 
  function uncompletePush(commandObj){
    if(command.active)
    {
      var newPos = new THREE.Vector3();
      var direction = new THREE.Vector3();
      direction.copy(command.data);
      direction.multiplyScalar(stepSize);
      newPos.copy(self.body.position);
      newPos.add(direction);
      
      moveObjInGrid(self, 
              newPos.x, 
              newPos.y, 
              newPos.z, 
              self.body.position.x, 
              self.body.position.y,
              self.body.position.z);
    }
  }
};

Block.prototype = new DynamicObjectBase();
Block.prototype.constructor = Block;