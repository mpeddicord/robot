function loadLevel(world)
{
  world.addBlockToWorld(1,0,-1);
  world.addBlockToWorld(1,0,-2);
  
  world.addBlockToWorld(2,0,-1);
  world.addBlockToWorld(2,0,-2);
  world.addBlockToWorld(2,0,-3);
  
  
  robotGeo = new THREE.CubeGeometry( stepSize, stepSize, stepSize ); 
  robotMaterials = [
    new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: false} ),
    new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 4, transparent: true, opacity:1} )
  ];

  var numRobots = 3;
  for(var i = 0; i < numRobots; i++){
  
    world.addRobotToWorld(new Robot({
      pos : {
        x: -3, 
        y: 0, 
        z: i*2
      },
      blockGeo:robotGeo, 
      blockMaterials:robotMaterials
    }));
  }
  
  world.createWallRect(-11, -11, 21, 21);
  
  /*
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
  */
}