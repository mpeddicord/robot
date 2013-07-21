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
  
  world.createWallRect(-11, -11, 21, 21);
}

testLevels['collide'] = function(world)
{
  var numRobots = 2;
  for(var i = 0; i < numRobots; i++)
  {
    robot.push(world.addRobotToWorld(new Robot({
      pos : {
        x: -3, 
        y: 0, 
        z: i*2
      },
      blockGeo:robotGeo, 
      blockMaterials:robotMaterials
    })));
  }
  
  TIME.addCommandAtIndex(robot[0].turnRightCommand(), 1);
  TIME.addCommandAtIndex(robot[0].forwardCommand(), 2);
  
  TIME.addCommandAtIndex(robot[1].turnLeftCommand(), 1);
  TIME.addCommandAtIndex(robot[1].forwardCommand(), 2);
};