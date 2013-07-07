function Time(_actionFunction, _body, _preserveFuture){
  var currCommand = [];
  var lastStartedCommand = undefined;
  var finishedCommand = [];
  var timeRemaining = stepLength;
  var preserveFuture = (_preserveFuture != undefined) ? _preserveFuture : true;
  var inHistory = false;
  
  var actionFunction = _actionFunction; 
  if(actionFunction == undefined)
  {
    console.log("ERROR: Made a time object without an actionFunction");
  }
  var onCommandComplete = function(){};
  var onCommandUncomplete = function(){};
  var onCommandStart = function(){};
  var body = _body;
  
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
  
      inHistory = false;
      //Special code for waiting when we reach the end of the command list
      if(forward && currCommand.length == 0){
        inHistory = true;
        if(finishedCommand.length == 0 || finishedCommand[finishedCommand.length-1].cmd != "wait"){
          finishedCommand.push({cmd: "wait", data: null, length: 0});
        }
        finishedCommand[finishedCommand.length-1].length += delta;
        return;
      }
      
      if(!preserveFuture && !forward && currCommand.length >= 1 && currCommand[0].cmd == "wait"){
        currCommand[0].length += delta;
        timeRemaining += delta;
        currCommand[0].length = THREE.Math.clamp(currCommand[0].length, 0, currCommand[0].length);
      }
      
      var len = (currCommand[0] == undefined)? stepLength: currCommand[0].length;
      
      var timeCompleted = len - timeRemaining;
      
      //If we can complete the event with time to spare
      if((forward && delta >= timeRemaining) || (!forward && delta + timeCompleted <= 0 ))
      {
        var timeChange = (forward) ? timeRemaining : -timeCompleted;
        applyTimeToAction(timeChange, forward);
        delta -= timeChange;
                
        if(forward){
          var currCmd = currCommand.shift();
          if(currCmd != undefined)
          {
            onCommandComplete(currCmd);
            finishedCommand.push(currCmd);
          }
          
        }
        else
        {
          if(currCommand[0] != undefined)
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
        
        timeRemaining = (forward) ? ((currCommand[0] == undefined)?stepLength:currCommand[0].length) : 0;
      }else{
        applyTimeToAction(delta, forward);
        timeRemaining -= delta;
        delta = 0;
      }
    }    
  }
  
  function addCommand(command, data, length){
    if(length == undefined) length = stepLength;
    currCommand.push({cmd: command, data: data, length: length});
  }

  function applyTimeToAction(delta, forward){
    if(actionFunction != undefined && currCommand[0] != undefined)
    { 
      if(forward && lastStartedCommand != currCommand[0])
      { 
        lastStartedCommand = currCommand[0];
        var activated = onCommandStart(currCommand[0]);
        currCommand[0].active = activated;
      }
        
      actionFunction((currCommand[0].active) ? currCommand[0].cmd : "wait", delta, currCommand[0].data);
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