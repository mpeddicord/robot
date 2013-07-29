function Time(){
  var commandList = [];
  for(var m = 0; m < 1000; m++){
    commandList[m] = [];
  }
  var needle = 0;
  
  var greatestNeedle = 0;
  
  function getNeedle(){ return needle; }
  
  function getIndex(){
    return Math.floor(needle / stepLength);
  }
  
  function biggestIndex(){
    return Math.floor(greatestNeedle / stepLength);
  }
  
  function validIndex(index){
    return commandList[index] != undefined && commandList[index].length;
  }
  
  function onComplete(index){
    if(!validIndex(index)) 
      return;
      
    for(var i in commandList[index]){
      var command = commandList[index][i];
      command.complete.call(command.object, command);
    }
  }
  
  function onUncomplete(index){
    if(!validIndex(index)) 
      return;
      
    var keepers = [];
    for(var i in commandList[index]){
      var command = commandList[index][i];
      command.uncomplete.call(command.object, command);
      if(command.passive == undefined || !command.passive){
      	keepers.push(command);
      }
    }
    
    commandList[index] = keepers;
  }
  
  function onApplyForces(index) {
    if(!validIndex(index)) 
      return;

      
  }

  function onStart(index){
    if(!validIndex(index)) return;
    
    //We do it this way, because start calls may add new commands for other objects immediately.
    var currentObjIndex = 0;
    while(currentObjIndex < commandList[index].length){
      var command = commandList[index][currentObjIndex];
      command.snapshotData = command.snapshotFunction.call(command.object);
      command.active = command.start.call(command.object, command);
      currentObjIndex++;
    }
  }
  
  function onAction(index, percent){
    if(!validIndex(index)) return;
    
    for(var i in commandList[index]){
      var command = commandList[index][i];
      if(command.active)
        command.action.call(command.object, percent, command);
    }
  }   
  
  function snapToGrid(index){
    if(!validIndex(index)) return;
    for(var i in commandList[index]){
      var command = commandList[index][i];
      command.object.snapToGrid();
    }
  }
  
  function printState(){
    return;
    
    var print = "";
    for(var index in commandList){
      if(validIndex(index)){
        for(var i in commandList[index]){
          var command = commandList[index][i];
          print += "Slot: " + index + ", cmd: " + i + ":" + command.data + "<br />";
        }
      }
    }
    $("#console").html(print);
  }
   
  function update(delta)
  {
    var forward = delta > 0;
    
    while(delta > 0 || (delta < 0 && needle > 0)){
      needle = Math.max(0, needle);
      var needleStart = needle;
      var needleEnd = needleStart + delta;
      
      var startTime = needleStart / stepLength;
      var startIndex = getIndex();
      var percentComplete = startTime - startIndex;
      var endIndex = Math.floor(needleEnd / stepLength);
      
      if(startIndex != endIndex){ //We need to do some catch up
        var timeComplete = percentComplete * stepLength;
        delta -= (forward)? stepLength - timeComplete : -timeComplete;
        needle = (forward)? ((startIndex + 1) * stepLength) : (startIndex * stepLength) - 0.00000001;
        
        onAction(startIndex, (forward)?1:0 );

        snapToGrid(startIndex);        
        if(forward){
          onComplete(startIndex);
          PHYSICS.updateBegin();
          onApplyForces(startIndex + 1);
          PHYSICS.updateEnd();
          onStart(startIndex + 1);
        }else{
          onUncomplete(startIndex);
        }
        continue;
      }else{
        needle = needleEnd;
        delta = 0;
      }
      
      var percent = needle / stepLength - Math.floor(needle / stepLength);
      onAction(startIndex, percent);
    }
    if(needle > greatestNeedle)
      greatestNeedle = needle;
    
    printState();
  }
  
  var objectsInTime = {};
  
  function addCommandAtIndex(commandData, index, insert){
    if(!verifyCommand(commandData)){
      return;
    }
    
    if(insert != undefined && insert){
      commandList.splice(index, 0, []);
      index += 1;
    }
    
    if(commandList[index] == undefined)
      commandList[index] = [];
      
    var previousAction = index <= getIndex();
    var time = needle - (index * stepLength);
    
    if(previousAction) 
      update(-time);
	
    commandList[index].push(commandData);
    
    if(previousAction) 
      update(time);
      
    commandData.object   
    
    //updateAllLines();
      
    return commandData;
  }
  
  
  var lineColor = [
    new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3, linejoin: "round" } ),
    new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1, linejoin: "round" } )
  ];
  
  
  function goToTime(newNeedle){
    update(newNeedle - needle);
  }
  
  function updateAllLines(){      
    var bigIndex = biggestIndex();
    var startNeedle = needle;
    
    for(var key in objectsInTime) {
      scene.remove(objectsInTime[key].line);
      delete objectsInTime[key];
    }
    
    update(-needle);
    for(var index = 0; index <= bigIndex; index++){
      update(stepLength);
      if(!validIndex(index)) continue;
      for(var i in commandList[index]){
        var command = commandList[index][i];
        var id = command.object.uid();
        
        if(objectsInTime[id] == undefined){
          objectsInTime[id] = { verts:[] };
        }
        
        var posCopy = new THREE.Vector3();
        posCopy.copy(command.object.getPosition.call(command.object));
        posCopy.setY(posCopy.y - 20);
        objectsInTime[id].verts.push(posCopy);
      }
    }
    
    update(-((bigIndex + 1) * stepLength) + startNeedle);
    
    for(var key in objectsInTime) {
      var linemat = new THREE.LineBasicMaterial( { color: 0x666666 } );  
      var newGeo = new THREE.Geometry();
      newGeo.vertices = objectsInTime[key].verts;
      newGeo.dynamic = true;
      objectsInTime[key] = { obj: command.object, geo: newGeo, material: linemat, line: new THREE.Line(newGeo, linemat) };
      
      scene.add(objectsInTime[key].line);
    }
  }
  
  function addCommand(commandData){
    addCommandAtIndex(commandData, Math.ceil(needle / stepLength));
    return commandData;
  }
  
  function verifyCommand(commandData){
    var verified = true;
    var requiredFunctions = ["start", "action", "snapshotFunction", "complete", "uncomplete"];
    for(var i in requiredFunctions){
      if(typeof commandData[requiredFunctions[i]] != 'function'){
        console.log("Error: command missing " + requiredFunctions[i] + " function.");
        verified = false;
      }
    }
    if(typeof commandData.object == "undefined"){
      console.log("Error: command missing object data.");
      verified = false;
    }
    
    return verified;
  }
  
  return {
    update: update,
    getNeedle: getNeedle,
    addCommand: addCommand,
    addCommandAtIndex: addCommandAtIndex
  }
};

TIME = new Time();