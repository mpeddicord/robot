function Time(){
  var commandList = [];
  for(var m = 0; m < 1000; m++){
    commandList[m] = [];
  }
  var needle = 0;
  
  function getIndex(){
    return Math.floor(needle / stepLength);
  }
  
  function onComplete(index){
    if(commandList[index] != undefined && commandList[index].length){
      for(var i = 0; i < commandList[index].length; i++){
        var command = commandList[index][i];
        command.complete(command);
      }
    }
  }
  
  function onStart(index){
    if(commandList[index] != undefined && commandList[index].length){
      for(var i = 0; i < commandList[index].length; i++){
        var command = commandList[index][i];
        command.snapshotData = command.snapshotFunction(command);
        command.active = command.start(command);
      }
    }
  }
  
  function onAction(){
    var index = getIndex();
    if(commandList[index] != undefined && commandList[index].length){
      for(var i = 0; i < commandList[index].length; i++){
        var command = commandList[index][i];
        if(command.active)
          command.action(needle / stepLength, command);
      }
    }
  }   
  
  function snapToGrid(index){
    if(commandList[index] != undefined && commandList[index].length){
      for(var i = 0; i < commandList[index].length; i++){
        var command = commandList[index][i];
      }
    }
  }
   
  function update(delta)
  {
    var forward = delta > 0;
    
    while(delta > 0 || (delta < 0 && needle >= 0)){
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
        needle = (forward)? ((startIndex + 1) * stepLength) : (startIndex + stepLength) - 0.00000001;
        snapToGrid(startIndex);        
        if(forward){
          onComplete(startIndex);
          onStart(startIndex + 1);
        }else{
          onUncomplete(startIndex);
        }
      }else{
        needle = needleEnd;
        delta = 0;
      }
      
      onAction();
    }
  }
  
  function addCommandAtIndex(commandData, index){
    if(!verifyCommand(commandData)){
      return;
    }
    if(commandList[index] == undefined)
      commandList[index] = [];
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