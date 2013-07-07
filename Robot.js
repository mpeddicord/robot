function Robot(){  
  function moveForward(){
    console.log("Forward");
    time.addCommand("forward");
  }
  function moveBack(){
    console.log("Back");
    time.addCommand("back");
  }
  function turnLeft(){
    console.log("Left");
    time.addCommand("left");
  }
  function turnRight(){
    console.log("Right");
    time.addCommand("right");
  }
  function wait(){
    console.log("Wait");
    time.addCommand("wait");
  }
  
  function printState(){
    $("#console").html(time.printState());
  }
  
  function update(delta)
  {
    time.update(delta);
  }
  
  function actions(command, delta)
  {  
    switch(command){
      case "forward":
        body.translateX(stepSize * delta * (1 / stepLength));
        break
      case "back":
        body.translateX(-stepSize * delta * (1 / stepLength));
        break;
      case "left":
        body.rotateOnAxis(new THREE.Vector3(0,1,0), (Math.PI / 2) * delta * (1 / stepLength));
        break;
      case "right":
        body.rotateOnAxis(new THREE.Vector3(0,1,0), (-Math.PI / 2) * delta * (1 / stepLength));
        break;
      case "wait":
        break;
    }
  }
 
  personalColor = [
      new THREE.MeshLambertMaterial( { color: 0xBBBBBB + (0x444444) * Math.random(), shading: THREE.FlatShading, overdraw: false} ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 1, transparent: true, opacity:1} )
    ];
  
  var body = THREE.SceneUtils.createMultiMaterialObject( new THREE.OctahedronGeometry(25), personalColor );
  
  var time = new Time(actions, body, true);
  
  time.setCommandCompleteCallback(function(command){
  });
  
  time.setCommandUncompleteCallback(function(command){
    switch(command.cmd){
      case "forward":
        if(command.active)
        {
          var newPos = new THREE.Vector3();
          newPos.copy(body.position);
          var v1 = new THREE.Vector3( -1, 0, 0 );
          v1.applyEuler( body.rotation, body.eulerOrder );
          newPos.add( v1.multiplyScalar( stepSize ) );
          moveObjInGrid(self, 
              newPos.x, 
              newPos.y, 
              newPos.z, 
              body.position.x, 
              body.position.y,
              body.position.z);
        }
      break;
    }
  });
  
  time.setCommandStartCallback(function(command){
    switch(command.cmd){
      case "forward":
        var newPos = new THREE.Vector3();
        newPos.copy(body.position);
        var v1 = new THREE.Vector3( 1, 0, 0 );
        v1.applyEuler( body.rotation, body.eulerOrder );
        newPos.add( v1.multiplyScalar( stepSize ) );
        
        var objArray = getObjArray(newPos.x, newPos.y, newPos.z);
        
        var goTime = true;
        
        if(objArray.length == 0){
          goTime = true;
        }else{
          var objList = new Array();
          
          var direction = new THREE.Vector3();
          direction.subVectors(newPos, body.position);
          
          var mass = accumulateMass(objArray[0], direction, objList);
          goTime = mass <= 2;
          if(goTime)
          {
            direction.normalize();
            for(var objIndex in objList){
              objList[objIndex].push(direction);
            }  
          }
        }
        if(goTime){
          moveObjInGrid(self, 
              body.position.x, 
              body.position.y, 
              body.position.z, 
              newPos.x, 
              newPos.y,
              newPos.z);
        }
        
        return goTime;
        break;
    }
    
    return true;
  });
  
  var self = {
    moveForward: moveForward,
    moveBack: moveBack,
    turnLeft: turnLeft,
    turnRight: turnRight,
    wait: wait,
    update: update,
    body: body,
    printState: printState
  };
  
  return self;
};