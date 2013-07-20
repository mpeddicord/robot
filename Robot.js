function Robot(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( new THREE.OctahedronGeometry(25), this.personalColor );  
  this.body.children[0].userData.gameObject = this;
  
  this.setPosition(data.pos);
};

Robot.prototype = new DynamicObjectBase();
Robot.prototype.constructor = Robot;

Robot.prototype.moveForward = function(){
  console.log("Forward");
  TIME.addCommand({ action: this.actions, 
                    data: "forward", 
                    object: this, 
                    start: this.startForward, 
                    complete: function(){}, 
                    uncomplete: this.uncompleteForward, 
                    snapshotFunction:this.takeSnapshot});
}
  
Robot.prototype.moveBack = function(){
  console.log("Back");
}
  
Robot.prototype.turnLeft = function(){
  console.log("Left");
  TIME.addCommand({ action: this.actions, 
                    data: "left", 
                    object: this, 
                    start: function(){ return SUCCESS; }, 
                    complete: function(){}, 
                    uncomplete: function(){}, 
                    snapshotFunction:this.takeSnapshot});
}

Robot.prototype.turnRight = function(){
  console.log("Right");
  TIME.addCommand({ action: this.actions, 
                    data: "right", 
                    object: this, 
                    start: function(){ return SUCCESS; }, 
                    complete: function(){}, 
                    uncomplete: function(){}, 
                    snapshotFunction:this.takeSnapshot});
}
  
Robot.prototype.wait = function(){
  console.log("Wait");
}

Robot.prototype.actions = function(time, commandObj)
{  
  switch(commandObj.data){
    case "forward":
    case "back":
      var v1 = new THREE.Vector3( 1, 0, 0 );
      if(commandObj.data == "back") v1.x *= -1;
      var basePosition = new THREE.Vector3();
      basePosition.copy(commandObj.snapshotData.position);
      v1.applyEuler( this.body.rotation, this.body.eulerOrder );
      basePosition.add( v1.multiplyScalar( time * stepSize ) );
      this.setPosition(basePosition);
      break;
    case "left":
    case "right":
      var mult = (commandObj.data == "right")? -1 : 1;
      var baseRotation = new THREE.Vector3();
      baseRotation.copy(commandObj.snapshotData.rotation);
      var q1 = new THREE.Quaternion();
      var q2 = new THREE.Quaternion();
      var axis = new THREE.Vector3(0,1,0);
      var angle = mult * (Math.PI / 2) * time;
      q1.setFromAxisAngle( axis, angle );
      q2.setFromEuler( baseRotation, this.body.eulerOrder );
      q2.multiply( q1 );
      this.body.rotation.setEulerFromQuaternion( q2, this.body.eulerOrder );
      break;
    case "wait":
      break;
  }
}

Robot.prototype.uncompleteForward = function(commandObj){
  if(commandObj.active)
  {
    var newPos = new THREE.Vector3();
    newPos.copy(this.body.position);
    var v1 = new THREE.Vector3( 1, 0, 0 );
    v1.applyEuler( this.body.rotation, this.body.eulerOrder );
    newPos.add( v1.multiplyScalar( stepSize ) );
  }
}

Robot.prototype.startForward = function(commandObj){
  var newPos = new THREE.Vector3();
  newPos.copy(this.body.position);
  var v1 = new THREE.Vector3( 1, 0, 0 );
  v1.applyEuler( this.body.rotation, this.body.eulerOrder );
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
      direction.normalize();
      for(var objIndex in objList){
        objList[objIndex].push(new THREE.Vector3( direction.x, direction.y, direction.z ));
      }  
    }
  }
  
  return goTime;
}