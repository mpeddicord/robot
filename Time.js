function Time(){
  var commandList = [];
  for(var m = 0; m < 1000; m++){
    commandList[m] = [];
  }
  var needle = 0;
  
  function getIndex(){
    return Math.floor(needle / stepLength);
  }
  
  function validIndex(index){
    return commandList[index] != undefined && commandList[index].length;
  }
  
  function onComplete(index){
    if(!validIndex(index)) return;
    for(var i in commandList[index]){
      var command = commandList[index][i];
      command.complete.call(command.object, command);
    }
  }
  
  function onUncomplete(index){
    if(!validIndex(index)) return;
    for(var i in commandList[index]){
      var command = commandList[index][i];
      command.uncomplete.call(command.object, command);
    }
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
    var print = "";
    print += "Needle: " + needle + "<br />";
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
    
    //printState();
  }
  
  function addCommandAtIndex(commandData, index){
    if(!verifyCommand(commandData)){
      return;
    }
    if(commandList[index] == undefined)
      commandList[index] = [];
    
    //This is probably temporary code, but the grid can't handle two commands at once, yet.
    var alreadyHasACommandInSlot = false;
    for(var i in commandList[index]){
      if(commandList[index][i].object == commandData.object){
        alreadyHasACommandInSlot = true;
      }
    }
    if(!alreadyHasACommandInSlot)
      commandList[index].push(commandData);
  }
  
  function addCommand(commandData){
    addCommandAtIndex(commandData, Math.ceil(needle / stepLength));
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
    addCommand: addCommand,
    addCommandAtIndex: addCommandAtIndex
  }
};

TIME = new Time();