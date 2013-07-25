var testLevels = {};
var robot = new Array();

var robotGeo = new THREE.CubeGeometry( stepSize, stepSize, stepSize ); 
var robotMaterials = [
  new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: false} ),
  new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 4, transparent: true, opacity:1} )
];

testLevels['default'] = function(world)
{
  world.addBlockToWorld(1,0,-1);
  world.addBlockToWorld(1,0,-2);
  
  world.addBlockToWorld(2,0,-1);
  world.addBlockToWorld(2,0,-2);
  world.addBlockToWorld(2,0,-3);
    
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
  
  world.createWallRect(-13, -13, 24, 24);
}

testLevels['empty'] = function(world) {}

testLevels['collide'] = function(world)
{
  var robots = [];
  
  robot.push(
    world.addRobotToWorld(
      new Robot({
        pos : {
          x: -3, 
          y: 0, 
          z: 0
        },
        blockGeo:robotGeo, 
        blockMaterials:robotMaterials
      })
    )
  );
  
  robot.push(
    world.addRobotToWorld(
      new Robot({
        pos : {
          x: -3, 
          y: 0, 
          z: 2
        },
        blockGeo:robotGeo, 
        blockMaterials:robotMaterials
      })
    )
  );
    
  TIME.addCommandAtIndex(robot[0].turnRightCommand(), 1);
  TIME.addCommandAtIndex(robot[0].forwardCommand(), 2);
  //TIME.addCommandAtIndex(robot[0].forwardCommand(), 3);
  
  TIME.addCommandAtIndex(robot[1].turnLeftCommand(), 1);
  TIME.addCommandAtIndex(robot[1].forwardCommand(), 2);
  //TIME.addCommandAtIndex(robot[1].forwardCommand(), 3);
  
  robot.push(
    world.addRobotToWorld(
      new Robot({
        pos : {
          x: 0, 
          y: 0, 
          z: 0
        },
        blockGeo:robotGeo, 
        blockMaterials:robotMaterials
      })
    )
  );
  
  robot.push(
    world.addRobotToWorld(
      new Robot({
        pos : {
          x: 0, 
          y: 0, 
          z: 1
        },
        blockGeo:robotGeo, 
        blockMaterials:robotMaterials
      })
    )
  );
    
  TIME.addCommandAtIndex(robot[2].turnRightCommand(), 1);
  TIME.addCommandAtIndex(robot[2].forwardCommand(), 2);
  //TIME.addCommandAtIndex(robot[0].forwardCommand(), 3);
  
  TIME.addCommandAtIndex(robot[3].turnLeftCommand(), 1);
  TIME.addCommandAtIndex(robot[3].forwardCommand(), 2);
  //TIME.addCommandAtIndex(robot[1].forwardCommand(), 3);
};

testLevels['stack'] = function(world)
{
  robot.push(world.addRobotToWorld(new Robot({
      pos : {
        x: 0, 
        y: 0, 
        z: 0
      },
      blockGeo:robotGeo, 
      blockMaterials:robotMaterials
    })));
    
    world.addBlockToWorld(0,1,0);
    world.addBlockToWorld(0,2,0);
    world.addBlockToWorld(0,3,0);
};

testLevels['dance'] = function(world)
{
  world.createWallRect(-11, -11, 21, 21);
  
  var numRobots = 4;
  for(var i = 0; i < numRobots; i++)
  {
    robot.push(world.addRobotToWorld(new Robot({
      pos : {
        x: Math.floor(i%2), 
        y: 0, 
        z: Math.floor(i/2)
      },
      blockGeo:robotGeo, 
      blockMaterials:robotMaterials
    })));
  }
  
  TIME.addCommandAtIndex(robot[0].turnLeftCommand(), 1);
  TIME.addCommandAtIndex(robot[3].turnRightCommand(), 1);
  
  TIME.addCommandAtIndex(robot[2].turnRightCommand(), 1);
  TIME.addCommandAtIndex(robot[2].turnRightCommand(), 2);
  
  for(var h = 0; h < 4; h++){
      TIME.addCommandAtIndex(robot[h]["forwardCommand"](), 3);
    }
  
  for(var i = 4; i < 30; i++){
  
  	var cmd = "forwardCommand";
  	var rand = Math.random();
  	if(rand < 0.25){
  		cmd = "turnLeftCommand";
  	}else if(rand < 0.5){
  		cmd = "turnRightCommand";
  	}
  	
    for(var h = 0; h < 4; h++){
      TIME.addCommandAtIndex(robot[h][cmd](), i);
    }
  }
};