function Block(x, y, z, blockGeo, blockMaterial) {

  var falling = true;
  
  var pushing = false;
  
  personalColor = [
      new THREE.MeshLambertMaterial( { color: 0xBBBBBB + (0x444444) * Math.random(), shading: THREE.FlatShading, overdraw: false} ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 1, transparent: true, opacity:1} )
    ];
  
  var cube = THREE.SceneUtils.createMultiMaterialObject( blockGeo, personalColor );
  
  cube.position.x = x;
  cube.position.y = y;
  cube.position.z = z;
  
  var time = new Time(actions, cube, false);
  
  function printState(){
    $("#console").html(time.printState());
  }
  
  function push(vector){
    //if(pushing && !time.isInHistory())
    //  return;
    vector.set(closestMult(1, vector.x), closestMult(1, vector.y), closestMult(1, vector.z));
    printVector(vector);
    time.addCommand("push", vector);
    //pushing = true;
  }
  
  function update(delta){
    time.update(delta);
  }
 
  time.setCommandCompleteCallback(function(data)
  {
    if(data.cmd == "push")
    {
      pushing = false;
    }
  });
  
    time.setCommandUncompleteCallback(function(command){
    switch(command.cmd){
      case "forward":
        if(command.active)
        {
          var newPos = new THREE.Vector3();
          var direction = data.data;
          direction.multiplyScalar(-stepSize);
          newPos.copy(cube.position);
          newPos.add(direction);
          
          moveObjInGrid(self, 
                  newPos.x, 
                  newPos.y, 
                  newPos.z, 
                  cube.position.x, 
                  cube.position.y,
                  cube.position.z);
        }
      break;
    }
  });
  
  time.setCommandStartCallback(function(data){
    if(data.cmd == "push"){
      var newPos = new THREE.Vector3();
      var direction = data.data;
      direction.multiplyScalar(stepSize);
      newPos.copy(cube.position);
      newPos.add(direction);
      
      moveObjInGrid(self, 
              cube.position.x, 
              cube.position.y, 
              cube.position.z, 
              newPos.x, 
              newPos.y,
              newPos.z);
    }
    return true;
  });
  
  function actions(command, delta, direction){
    switch(command){
      case "push":
        direction.normalize();
        cube.translateOnAxis(direction, stepSize * delta * (1 / stepLength));
      break;
    }
  }
  
  var self = {
    body: cube,
    update: update,
    push: push,
    falling: falling,
    printState: printState
  };
  
  return self;
};