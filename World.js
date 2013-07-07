function World(scene) {
  var blockList = [];
  var blockGeo;
  var blockMaterials;
  var size;
  var step;
 
  var rotMod;
  
  var timeMult;
  
  var numRobots = 3;
  var robots;
  var selectedRobotNum = 0;
  var selectedRobot;
  
  function init()
  {
    blockGeo = new THREE.CubeGeometry( stepSize, stepSize, stepSize ); 
    blockMaterials = [
      new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: false} ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 4, transparent: true, opacity:1} )
    ];
    //generateBlocks();  
    
    addBlockToWorld(1,0,-1);
    addBlockToWorld(1,0,-2);
    
    addBlockToWorld(2,0,-1);
    addBlockToWorld(2,0,-2);
    addBlockToWorld(2,0,-3);
    
    robots = new Array();
    for(var i = 0; i < numRobots; i++){
      robots[i] = new Robot(-3 * stepSize, 0, stepSize * i * 2);
      addObjToGrid(robots[i]);
      scene.add( robots[i].body );
    }
    
    selectedRobot = robots[0];

    for(var i = 0; i < 100; i++)
    {
      //robot.moveForward()
      //robot.turnLeft();
      //robot.moveForward()
      //robot.turnLeft();
      //robot.moveForward()
      //robot.turnLeft();
      //robot.moveForward()
      //robot.turnLeft();
      //robot.moveForward()
      //robot.turnRight();
      //robot.moveForward()
      //robot.turnRight();
      //robot.moveForward()
      //robot.turnRight();
      //robot.moveForward()
      //robot.turnRight();
    }
    
    timeMult = 1;
    rotMod = 0;
    
    document.body.onkeydown = function(event){
      event = event || window.event;
      var keycode = event.charCode || event.keyCode;
      console.log(keycode);
      if(keycode == 187)
      {
        timeMult += 1;
      }
      if(keycode == 189)
      {
        timeMult -= 1;
      }
      if(keycode == 39) //Right
      {
        selectedRobot.turnRight();
      }
      if(keycode == 37) //Left
      {
        selectedRobot.turnLeft();
      }
      if(keycode == 38) //Up
      {
        selectedRobot.moveForward();
      }
      if(keycode == 40) //Down
      {
        //selectedRobot.moveBack();
        //block.push(new THREE.Vector3(1,0,0));
      }
      if(keycode == 219) //[
      {
        selectedRobotNum = (selectedRobotNum+1) % robots.length;
        selectedRobot = robots[selectedRobotNum];
      }
      if(keycode == 221) //]
      {
        selectedRobotNum = (selectedRobotNum-1) % robots.length;
        selectedRobot = robots[selectedRobotNum];
      }
      if(keycode == 32)// Space
      {
        findObjs();
      }
      if(keycode == 90)// z
      {
        clearMarkers();
      }
    }
  }
  
  function generateBlocks()
  {
    size = 7;
    step = stepSize;
    for (var x = 0; x < size; x++) {
      for (var y = 0; y < size; y++) {
        for (var z = 0; z < size; z++) {              
          if(Math.random() > 0.75)
          {
            addBlockToWorld(x,y,z);
          }
        }
      }
    }
  }
  
  function addBlockToWorld(x, y, z)
  {
    var newBlock = new Block(x * stepSize, y * stepSize, z * stepSize, blockGeo, blockMaterials);
    scene.add( newBlock.body );
    blockList.push(newBlock);
    addObjToGrid(newBlock);
    return newBlock;
  }
  
  function blocksIntersect(pos1, pos2)
  {
    if(Math.abs(pos1.x - pos2.x) < stepSize &&
       Math.abs(pos1.y - pos2.y) < stepSize &&
       Math.abs(pos1.z - pos2.z) < stepSize )
       {
          return true;1
       }
    return false;
  }
  
  
  function update(delta)
  {
    $("#timeMult").html(timeMult + "x");
    $("#console").html("");
    var timeControl = delta * timeMult;
    
    for (var i in robots)
      robots[i].update(timeControl);
    
    for (var i in blockList)
      blockList[i].update(timeControl);
     
    updateMarkers();
  }
  
  function handleClicks(event, camera, projector){
    event.preventDefault();
    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    for(var i in robots){
      var intersects = raycaster.intersectObject( robots[i].body, false );

      if ( intersects.length > 0 ) {
        console.log("Found anything?");
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //
        //var particle = new THREE.Particle( particleMaterial );
        //particle.position = intersects[ 0 ].point;
        //particle.scale.x = particle.scale.y = 8;
        //scene.add( particle );
      }
    }
  }
  
  init();
  
  return {
    addBlockToWorld : addBlockToWorld,
    update : update,
    worldSize : size,
    worldStep : step,
    rotMod : rotMod,
    handleClicks: handleClicks
  }
};
