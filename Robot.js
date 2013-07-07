function Robot(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( new THREE.OctahedronGeometry(25), this.personalColor );  
  this.setPosition(data.pos);
  
  this.time = new Time(actions, this.body, true);
  
  function actions(command, delta)
  {  
    switch(command){
      case "forward":
        self.body.translateX(stepSize * delta * (1 / stepLength));
        break
      case "back":
        self.body.translateX(-stepSize * delta * (1 / stepLength));
        break;
      case "left":
        self.body.rotateOnAxis(new THREE.Vector3(0,1,0), (Math.PI / 2) * delta * (1 / stepLength));
        break;
      case "right":
        self.body.rotateOnAxis(new THREE.Vector3(0,1,0), (-Math.PI / 2) * delta * (1 / stepLength));
        break;
      case "wait":
        break;
    }
  }
     
  this.time.setCommandCompleteCallback(function(command){
  });
  
  this.time.setCommandUncompleteCallback(function(command){
    switch(command.cmd){
      case "forward":
        if(command.active)
        {
          var newPos = new THREE.Vector3();
          newPos.copy(self.body.position);
          var v1 = new THREE.Vector3( 1, 0, 0 );
          v1.applyEuler( self.body.rotation, self.body.eulerOrder );
          newPos.add( v1.multiplyScalar( stepSize ) );
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
  
  this.time.setCommandStartCallback(function(command){
    switch(command.cmd){
      case "forward":
        var newPos = new THREE.Vector3();
        newPos.copy(self.body.position);
        var v1 = new THREE.Vector3( 1, 0, 0 );
        v1.applyEuler( self.body.rotation, self.body.eulerOrder );
        newPos.add( v1.multiplyScalar( stepSize ) );
        
        var objArray = getObjArray(newPos.x, newPos.y, newPos.z);
        
        var goTime = true;
        
        if(objArray.length == 0){
          goTime = true;
        }else{
          var objList = new Array();
          
          var direction = new THREE.Vector3();
          direction.subVectors(newPos, self.body.position);
          
          var mass = accumulateMass(objArray[0], direction, objList);
          goTime = mass <= 2;
          if(goTime)
          {
            direction.normalize();
            for(var objIndex in objList){
              objList[objIndex].push(new THREE.Vector3( direction.x, direction.y, direction.z ));
            }  
          }
        }
        if(goTime){
          moveObjInGrid(self, 
              self.body.position.x, 
              self.body.position.y, 
              self.body.position.z, 
              newPos.x, 
              newPos.y,
              newPos.z);
        }
        
        return goTime;
        break;
    }
    
    return true;
  });
};

Robot.prototype = new DynamicObjectBase();
Robot.prototype.constructor = Robot;

Robot.prototype.moveForward = function(){
  console.log("Forward");
  this.time.addCommand("forward");
}
  
Robot.prototype.moveBack = function(){
  console.log("Back");
  this.time.addCommand("back");
}
  
Robot.prototype.turnLeft = function(){
  console.log("Left");
  this.time.addCommand("left");
}

Robot.prototype.turnRight = function(){
  console.log("Right");
  this.time.addCommand("right");
}
  
Robot.prototype.wait = function(){
  console.log("Wait");
  this.time.addCommand("wait");
}