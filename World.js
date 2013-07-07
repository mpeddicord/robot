function World(scene) {
  var blockList = [];
  var blockGeo;
  var blockMaterials;
  var size;
  var step;
 
  var rotMod;
  
  var timeMult;
  
  var robot;
  
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
    
    robot = new Robot();
    addObjToGrid(robot);
    scene.add( robot.body );
    
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
      //console.log(keycode);
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
        robot.turnRight();
      }
      if(keycode == 37) //Left
      {
        robot.turnLeft();
      }
      if(keycode == 38) //Up
      {
        robot.moveForward();
      }
      if(keycode == 40) //Down
      {
        //robot.moveBack();
        //block.push(new THREE.Vector3(1,0,0));
      }
      if(keycode == 32)
      {
        findObjs();
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
    robot.update(timeControl);
    
    for (var i in blockList)
      blockList[i].update(timeControl);
     
    //Don't run collision when we are moving through history
    //if(block.body.position.distanceTo(robot.body.position) < stepSize)
    //{
    //  var direction = new THREE.Vector3();
    //  direction.copy(block.body.position);
    //  direction.sub(robot.body.position);
    //  direction.normalize();
    //  block.push(direction);
    //}
    
    //blockList.sort(function(block1, block2)
    //  { 
    //    var result = block1.data.position.y - block2.data.position.y;
    //    return  result;
    //  }
    //);
    //
    //for(var i = 0; i < blockList.length; i++)
    //{
    //  var canMove = blockList[i].data.position.y > 0;
    //  
    //  xpos = blockList[i].data.position.x;
    //  ypos = blockList[i].data.position.y;
    //  zpos = blockList[i].data.position.z;
    //       
    //  if(canMove)
    //  {
    //    for(var h = 0; h < i; h++)
    //    {
    //      var calculatedBlockA = new THREE.Vector3(xpos, ypos - 4, zpos);
    //      if(blocksIntersect(calculatedBlockA, blockList[h].data.position))
    //      {
    //        canMove = false;
    //        break;
    //      }
    //    }
    //  }
    //  
    //  if(canMove)
    //  {
    //    ypos -= 4;
    //    blockList[i].falling = true;
    //  }
    //  else
    //  {
    //    if(blockList[i].falling)
    //    {
    //      blockList[i].falling = false;
    //      xpos = closestMult(stepSize, xpos);
    //      ypos = closestMult(stepSize, ypos);
    //      zpos = closestMult(stepSize, zpos);
    //    }
    //  }
    //  
    //  if(blockList[i].data.position.x != xpos){
    //      blockList[i].data.position.x = xpos;
    //  }
    //  if(blockList[i].data.position.y != ypos){
    //      blockList[i].data.position.y = ypos;
    //  }
    //  if(blockList[i].data.position.z != zpos){
    //      blockList[i].data.position.z = zpos;
    //  }
    //}
  }
  
  init();
  
  return {
    addBlockToWorld : addBlockToWorld,
    update : update,
    worldSize : size,
    worldStep : step,
    rotMod : rotMod
  }
};
