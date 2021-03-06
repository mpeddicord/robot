function World(scene) {
  var blockList = [];
  var blockGeo;
  var blockMaterials;
  var size;
  var step;
 
  var rotMod;
  
  var timeMult;
  
  var robots = new Array();
  var selectedRobotNum = 0;
  var selectedRobot;
  
  function init()
  {
    blockGeo = new THREE.CubeGeometry( stepSize, stepSize, stepSize ); 
    blockMaterials = [
      new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: false} ),
      new THREE.MeshBasicMaterial( { color: 0x000000, wireframe : true, wireframeLinewidth: 4, transparent: true, opacity:1} )
    ];
    timeMult = 1;
    rotMod = 0;
    
    document.body.onkeydown = function(event){
      event = event || window.event;
      var keycode = event.charCode || event.keyCode;
      console.log(keycode);

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
      	selectedRobot.moveForwardHistory();
      }
      if(keycode == 219) //[
      {
        selectedRobotNum = (selectedRobotNum+1) % robots.length;
        selectRobot(robots[selectedRobotNum]);
      }
      if(keycode == 221) //]
      {
        selectedRobotNum = (selectedRobotNum-1) % robots.length;
        selectRobot(robots[selectedRobotNum]);
      }
      if(keycode == 32)// Space
      {
        showMarkers = !showMarkers;
      }
      if(keycode == 90)// z
      {
        clearMarkers();
      }
    }
  }
  
  //This code is out of control. :)
  function createWallRect(x, z, width, length){
    var mass = 99999;
    var colors = [0xffffff, 0x000000];
    for(var i = x; i <= x + width; i++){
      if(i == x || i == x + width){
        for(var h = z+1; h < z + length; h++){
          var col = MATH.lerp(0.1, 0.75, Math.sin((h-z) / length * Math.PI));
          var color = new THREE.Color();
          color.r = col; color.g = col; color.b = col + 0.25;
          addBlockToWorld(i, 0, h, mass, color.getHex());
        }
      }
      var col = MATH.lerp(0.1, 0.75, Math.sin((i-x) / width * Math.PI));
      var color = new THREE.Color();
      color.r = col; color.g = col + 0.25; color.b = col;
      addBlockToWorld(i, 0, z, mass, color.getHex());
      color.r = col + 0.25; color.g = col; color.b = col;
      addBlockToWorld(i, 0, z + length, mass, color.getHex()) 
    }
  }
  
  function createFloorRect(x, z, width, length, level, color, hollow){
    if(!hollow){
      addFloorToWorld({x: x, z: z, width: width, length: length, level: level, color: color});
    }else{
      addFloorToWorld({x: x, z: z, width: width, length: 1, level: level, color: color});
      addFloorToWorld({x: x, z: z+length-1, width: width, length: 1, level: level, color: color});
      
      addFloorToWorld({x: x, z: z+1, width: 1, length: length-2, level: level, color: color});
      addFloorToWorld({x: x+width-1, z: z+1, width: 1, length: length-2, level: level, color: color});
    }
  }
  
  function addBlockToWorld(x, y, z, mass, color)
  {    
    var newBlock = new Block({
      pos : { x:x, y:y, z:z },
      color: color,
      mass: mass,
      blockGeo:blockGeo, 
      blockMaterials:blockMaterials
    });
    scene.add( newBlock.body );
    blockList.push(newBlock);
    return newBlock;
  }
  
  function addFloorToWorld(data){
    var floorTest = new Floor(data);
    floorTest.addToScene();
  }
    
  function addRobotToWorld(r) {
    robots.push(r);
    scene.add( r.body );
    selectRobot(robots[0]);
    return r;
  };
  
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
  
  function getTimeMult(){
    var slider = $("#timeScaler")[0];
  	var timeValue = (slider.valueAsNumber / 500.0) - 1;
  	
  	if($('#pause').is(':checked')) return 0;
  	
  	return THREE.Math.mapLinear(timeValue, -1, 1, -10, 12);
  }
  function update(delta)
  {
  	timeMult = getTimeMult();
    $("#timeMult").html(timeMult + "x");
    $("#needle").html(TIME.getNeedle().toFixed(3));
    $("#console").html("");
    var timeControl = delta * timeMult;

    TIME.update(timeControl);
     
    updateMarkers();
  }

  function handleClicks(cx, cy, camera, projector){
    var x = cx * 2 - 1;
    var y = -cy * 2 + 1;

    var vector = new THREE.Vector3(x, y, 0);
    printVector(vector, "click");
    
    var ray = projector.pickingRay( vector, camera );
    var intersects = ray.intersectObjects( scene.children, true );
    
    var firstObject = undefined;
    for(var i in intersects) {
      if ("gameObject" in intersects[i].object.userData) {
        firstObject = intersects[i].object.userData.gameObject;
        break;
      }
    }
    
    if (firstObject instanceof Robot) {
      selectRobot(firstObject);
    }
    
    console.log(firstObject);
  }
  
  function selectRobot(robot) {
    if (selectedRobot != undefined) {
      selectedRobot.deselect();
    }
    
    robot.select();
    selectedRobot = robot;
  }
  
  init();
  
  return {
    addBlockToWorld : addBlockToWorld,
    addFloorToWorld : addFloorToWorld,
    addRobotToWorld : addRobotToWorld,
    createWallRect: createWallRect,
    createFloorRect: createFloorRect,
    selectRobot : selectRobot,
    update : update,
    worldSize : size,
    worldStep : step,
    rotMod : rotMod,
    handleClicks: handleClicks
  }
};

