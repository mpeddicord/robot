function Time(_actionFunction, _body, _preserveFuture, _snapshotFunction){
  var currCommand = [];
  var lastStartedCommand = undefined;
  var finishedCommand = [];
  var timeRemaining = stepLength;
  var preserveFuture = (_preserveFuture != undefined) ? _preserveFuture : true;
  
  var actionFunction = _actionFunction; 
  if(actionFunction == undefined)
  {
    console.log("ERROR: Made a time object without an actionFunction");
  }
  var onCommandComplete = function(){};
  var onCommandUncomplete = function(){};
  var onCommandStart = function(){};
  var body = _body;
  
  if(_snapshotFunction == undefined) _snapshotFunction = function(){};
  
  function setCommandCompleteCallback(callback){
    onCommandComplete = callback;
  }
  
  function setCommandUncompleteCallback(callback){
    onCommandUncomplete = callback;
  }
  
  function setCommandStartCallback(callback){
    onCommandStart = callback;
  }
  
  function printState(){
    var print = "";
    for(var i = 0; i < finishedCommand.length; i++)
    {
      var fc = finishedCommand[i];
      if(finishedCommand[i] != undefined)
        print += "(len: " + fc.length.toFixed(3) + ", cmd: " + fc.cmd + ")<br />";
      else
        print += finishedCommand[i];
    }
    print += timeRemaining.toFixed(3) + "/" + ((currCommand[0] == undefined)? "undefined" : currCommand[0].length) + " &#60;-- Progress<br />";
    for(var i = 0; i < currCommand.length; i++){
      var cc = currCommand[i];
      if(currCommand[i] != undefined)
        print += "(len: " + cc.length.toFixed(3) + ", cmd: " + cc.cmd + ")<br />";
      else
        print += currCommand[i];
      
    }
    return print;
  }

  function update(delta)
  {
    //While there is time to process
    while(delta != 0 && !isNaN(delta))
    {
      var forward = delta > 0;
      if(!forward) {
        lastStartedCommand = undefined;
      }
      
      if(currCommand.length == 0)
        return;
      
      var timeCompleted = currCommand[0].length - timeRemaining;
      
      //If we can complete the event with time to spare
      if((forward && delta >= timeRemaining) || (!forward && delta + timeCompleted <= 0 ))
      {
        
        var timeChange = (forward) ? timeRemaining : -timeCompleted;
        applyTimeToAction( (forward)? 1 : 0, forward);
        delta -= timeChange;
                
        if(forward){
          var currCmd = currCommand.shift();
          if(currCmd != undefined)
          {
            onCommandComplete(currCmd);
            finishedCommand.push(currCmd);
          }
          if(currCommand.length == 0)
            addCommand("wait", undefined, stepLength);
        }
        else
        {
          onCommandUncomplete(currCommand[0]);
          if(finishedCommand.length == 0)
          {
            //We have rewound all the way to the very beginning
            break;
          }
          
          var cmd = finishedCommand.pop();
          if(!preserveFuture)
          {
            currCommand = [];
          }
          currCommand.splice(0, 0, cmd);
        }
        
        //snap up the orientation and position. It gets off due to bad precision at really high mults.
        body.rotation.x = closestMult(Math.PI/2, body.rotation.x);
        body.rotation.y = closestMult(Math.PI/2, body.rotation.y);
        body.rotation.z = closestMult(Math.PI/2, body.rotation.z);
        body.position.x = closestMult(stepSize, body.position.x);
        body.position.y = closestMult(stepSize, body.position.y);
        body.position.z = closestMult(stepSize, body.position.z);
        
        if(!forward)
          timeRemaining = 0;
        else {
          timeRemaining = currCommand[0].length;
        }
      }else if(currCommand.length > 0 && !(!forward && finishedCommand.length != 0)){
        timeRemaining -= delta;
        applyTimeToAction(timeCompleted / currCommand[0].length, forward);
        //$("#console").html("time: " + timeCompleted / currCommand[0].length);
        delta = 0;
      }else{
        delta = 0;
      }
    }    
  }
  
  function addCommand(command, data, length){
    if(length == undefined) length = stepLength;
    currCommand.push({cmd: command, data: data, length: length});
    if(currCommand.length == 1)
      timeRemaining = length;
  }

  function applyTimeToAction(t, forward){
    if(actionFunction != undefined && currCommand[0] != undefined)
    { 
      if(forward && lastStartedCommand != currCommand[0])
      { 
        currCommand[0].snapShotData = _snapshotFunction();
        lastStartedCommand = currCommand[0];
        var activated = onCommandStart(currCommand[0]);
        currCommand[0].active = activated;
      }
        
      var cmd = (currCommand[0].active) ? currCommand[0].cmd : "wait";
      
      actionFunction(cmd, t, currCommand[0].data, currCommand[0].snapShotData);
    }
  }
  
  function isInHistory()
  {
    return inHistory;
  }
  
  return {
    update: update,
    addCommand: addCommand,
    onCommandComplete: onCommandComplete,
    setCommandCompleteCallback: setCommandCompleteCallback,
    setCommandUncompleteCallback: setCommandUncompleteCallback,
    setCommandStartCallback: setCommandStartCallback,
    printState: printState,
    isInHistory: isInHistory
  }
};