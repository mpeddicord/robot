function Block(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( data.blockGeo, this.personalColor ); 
  this.setPosition(data.pos);
  
  this.time = new Time(actions, this.body, false);
  
  function actions(command, delta, direction){
    switch(command){
      case "push":
        direction.normalize();
        self.body.translateOnAxis(direction, stepSize * delta * (1 / stepLength));
      break;
    }
  }
 
  this.time.setCommandCompleteCallback(
    function(data) {
      if(data.cmd == "push")
      {
        self.pushing = false;
      }
    }
  );
  
  this.time.setCommandUncompleteCallback(function(command){
    switch(command.cmd){
      case "push":
        if(command.active)
        {
          var newPos = new THREE.Vector3();
          var direction = command.data;
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
      break;
    }
  });
  
  this.time.setCommandStartCallback(
    function(data){
      if(data.cmd == "push"){
        var newPos = new THREE.Vector3();
        var direction = data.data;
        direction.multiplyScalar(stepSize);
        newPos.copy(self.body.position);
        newPos.add(direction);
        
        moveObjInGrid(self, 
                self.body.position.x, 
                self.body.position.y, 
                self.body.position.z, 
                newPos.x, 
                newPos.y,
                newPos.z);
      }
      return true;
    }
  );
};

Block.prototype = new DynamicObjectBase();
Block.prototype.constructor = Block;