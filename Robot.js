function Robot(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( new THREE.OctahedronGeometry(25), this.personalColor );  
  this.body.children[0].userData.gameObject = this;
  
  var front = new THREE.Mesh(new THREE.OctahedronGeometry(10), this.personalColor[0]);
  front.position.x = 18;
  this.body.add(front);
  
  this.setPosition(data.pos);
};

Robot.prototype = new DynamicObjectBase();
Robot.prototype.constructor = Robot;

Robot.prototype.forwardCommand = function(){
  return { 
    action: function(time, commandObj) {
      var v1 = new THREE.Vector3( 1, 0, 0 );
      if(commandObj.data == "back") v1.x *= -1;
      var basePosition = new THREE.Vector3();
      basePosition.copy(commandObj.snapshotData.position);
      v1.applyEuler( this.body.rotation );
      basePosition.add( v1.multiplyScalar( time * stepSize ) );
      if (this.setPosition(basePosition) == FAILURE) {
        if (false && commandObj["pushCmds"] != undefined) {
          for(var i=0; i < commandObj["pushCmds"].length; ++i) {
            commandObj.pushCmds[i].stopped = true;
          }
        }
      }
    },
      
    data: "", 
    object: this, 
    start: this.startForward, 
    complete: function(){}, 
    uncomplete: this.uncompleteForward, 
    snapshotFunction:this.takeSnapshot
  }
};

Robot.prototype.turnLeftCommand = function() {
  return { 
    action: this.actionLeftRight, 
    data: "left", 
    object: this, 
    start: function(){ return SUCCESS; }, 
    complete: function(){}, 
    uncomplete: function(){}, 
    snapshotFunction:this.takeSnapshot
  };
};

Robot.prototype.turnRightCommand = function() {
  return { 
    action: this.actionLeftRight, 
    data: "right", 
    object: this, 
    start: function(){ return SUCCESS; }, 
    complete: function(){}, 
    uncomplete: function(){}, 
    snapshotFunction:this.takeSnapshot
  };
}

Robot.prototype.moveForward = function(){
  console.log("Forward");
  TIME.addCommand(this.forwardCommand());
}

Robot.prototype.moveForwardHistory = function(){
  console.log("Forward");
  TIME.addCommandAtIndex({ action: this.actions, 
                    data: "forward", 
                    object: this, 
                    start: this.startForward, 
                    complete: function(){}, 
                    uncomplete: this.uncompleteForward, 
                    snapshotFunction:this.takeSnapshot}, 2);
}
  
Robot.prototype.moveBack = function(){
  console.log("Back");
}
  
Robot.prototype.turnLeft = function(){
  console.log("Left");
  TIME.addCommand(this.turnLeftCommand());
}

Robot.prototype.turnRight = function(){
  console.log("Right");
  TIME.addCommand(this.turnRightCommand());
}
  
Robot.prototype.wait = function(){
  console.log("Wait");
}

Robot.prototype.actionLeftRight = function(time, commandObj) {
    var mult = (commandObj.data == "right")? -1 : 1;
    var baseRotation = commandObj.snapshotData.rotation.clone();
    var q1 = new THREE.Quaternion();
    var q2 = new THREE.Quaternion();
    var axis = new THREE.Vector3(0,1,0);
    var angle = mult * (Math.PI / 2) * time;
    q1.setFromAxisAngle( axis, angle );
    q2.setFromEuler( baseRotation );
    q2.multiply( q1 );
    this.body.rotation.setFromQuaternion( q2 );
}

Robot.prototype.uncompleteForward = function(commandObj){
  if(commandObj.active)
  {
    var newPos = new THREE.Vector3();
    newPos.copy(this.body.position);
    var v1 = new THREE.Vector3( 1, 0, 0 );
    v1.applyEuler( this.body.rotation );
    newPos.add( v1.multiplyScalar( stepSize ) );
  }
}

Robot.prototype.startForward = function(commandObj){
  var newPos = new THREE.Vector3();
  newPos.copy(this.body.position);
  var v1 = new THREE.Vector3( 1, 0, 0 );
  v1.applyEuler( this.body.rotation );
  newPos.add( v1.multiplyScalar( stepSize ) );
  
  var objArray = getObjArray(newPos.x, newPos.y, newPos.z);
  
  var goTime = true;
  
  if(objArray.length == 0){
    goTime = true;
  }else{
    var objList = new Array();
    
    var direction = new THREE.Vector3();
    direction.subVectors(newPos, this.body.position);
    
    var mass = accumulateMass(objArray[0], direction, objList);
    goTime = mass <= 2;
    if(goTime)
    {
      commandObj["pushCmds"] = [];
        
      direction.normalize();
      for(var objIndex in objList){
        commandObj["pushCmds"].push( objList[objIndex].push(new THREE.Vector3( direction.x, direction.y, direction.z )) );
      }  
    }
  }
  
  return goTime;
}