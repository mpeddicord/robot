var scene = new THREE.Scene();
var allObjects = [];

$.urlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null)
    return undefined;
  return results[1];
}

function main(){
  var container, stats;
  var camera, projector, renderer;
  var gridWorld;
  var screenSafeArea = 0.99;
  var zoom = 1.3;
  
  var containerLeft, containerTop;
  var containerWidth, containerHeight;
  
  window.onZoom = function(slider) {
    zoom = slider.value / 10.0;
    onWindowResize();
  }
  
  window.resetSlider = function(slider){
    slider.value = 500;
  }

  init();
  animate();
  
  function onDocumentMouseDown( event ) {
    var cx = (event.clientX-containerLeft) / containerWidth; 
    var cy = (event.clientY-containerTop) / containerHeight; 
    
    gridWorld.handleClicks( cx, cy, camera, projector ); //This is the new interface in picking.
  }

  function init() {
    container = $( "#container" )[0];

    camera = new THREE.OrthographicCamera( 
      window.innerWidth / -zoom, 
      window.innerWidth / zoom, 
      window.innerHeight / zoom, 
      window.innerHeight / -zoom, 
      1, 
      5000 
    );
    
    projector = new THREE.Projector(); 
    
    container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    
    // Grid        
    var size = 550, step = 50;
    var gridgeometry = new THREE.Geometry();
    var gridOffset = -25;
    for ( var i = - size; i <= size; i += step ) {
      gridgeometry.vertices.push( new THREE.Vector3( -size-gridOffset, gridOffset, i-gridOffset ) );
      gridgeometry.vertices.push( new THREE.Vector3(   size-gridOffset, gridOffset, i-gridOffset ) );

      gridgeometry.vertices.push( new THREE.Vector3( i-gridOffset, gridOffset, -size-gridOffset ) );
      gridgeometry.vertices.push( new THREE.Vector3( i-gridOffset, gridOffset,   size-gridOffset ) );
    }

    var gridmaterial = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

    var line = new THREE.Line( gridgeometry, gridmaterial );
    line.type = THREE.LinePieces;
    //scene.add( line );

    // Cubes
    gridWorld = new World(scene);

    // Lights
    var ambientLight = new THREE.AmbientLight( 0.75 * 0x10 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = 0.25;
    directionalLight.position.y = 0.5;
    directionalLight.position.z = 0.25;

    directionalLight.position.normalize();
    scene.add( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );

    directionalLight.position.x = -1;
    directionalLight.position.y = -0.5;
    directionalLight.position.z = -0.25;

    directionalLight.position.normalize();
    scene.add( directionalLight );

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    //renderer = new THREE.CanvasRenderer();

    calculateContainerSize();

    renderer.setSize( containerWidth, containerHeight );
    renderer.domElement.style.borderStyle = 'solid';
    renderer.domElement.style.borderWidth = '1px';
    renderer.domElement.style.borderColor = '#000000';
              
    positionRenderer();
    
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );
    
    $( "#programs" ).tabs();
    var z= $( "#zoom" )[0];
    window.onZoom(z);

    window.addEventListener( 'resize', onWindowResize, false );    
    
    var level = $.urlParam('level');
    if (level != undefined) {
      level = 'test';
      
      $.ajax({
        url: 'levels/'+level+'.js',
        dataType: "script",
        success: function() { 
          loadLevel(gridWorld); }
      });     
    }
    
    //Load Level
    var level = $.urlParam('level');
    if (level != undefined) {      
      $.ajax({
        url: 'levels/'+level+'.js',
        dataType: "script",
        success: function() { 
          loadLevel(gridWorld); }
      });     
    }
    else {
      var testLevelId = $.urlParam('test');
      if (testLevelId == undefined)
        testLevelId = 'default';

      testLevels[testLevelId](gridWorld);
    }
  }
            
  function positionRenderer() {
    renderer.domElement.style.position = 'absolute';
    containerLeft = Math.floor((window.innerWidth - containerWidth) * 0.5);
    containerTop = containerLeft;
    renderer.domElement.style.left = containerLeft.toString() + 'px';
    renderer.domElement.style.top = containerTop.toString() + 'px';
  }

  function onWindowResize() {
    calculateContainerSize();
    
    camera.left = containerWidth / -zoom;
    camera.right = -camera.left;
    camera.top = containerHeight / zoom;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    
    renderer.setSize( containerWidth, containerHeight );
    positionRenderer();
  }
  
  function calculateContainerSize() {
    var bottomUiTop = $( "#programs" );
    bottomUiTop = bottomUiTop.position().top;
    containerWidth = screenSafeArea * window.innerWidth;
    containerHeight = screenSafeArea * bottomUiTop;
  }

  //
  var lastTime = Date.now();
  function animate() {
    var thisTime = Date.now();
    var delta = (thisTime - lastTime) / 1000.0;
    lastTime = thisTime;

    requestAnimationFrame( animate );

    render();
    stats.update();
    gridWorld.update(delta);
  }

  function render() {
    var timer = Date.now() * 0.0001 + gridWorld.rotMod;

    var middleOfGrid = (gridWorld.worldSize * gridWorld.worldStep) / 2;

    camera.position.x = 810;
    camera.position.y = 1000;
    camera.position.z = 550;
    camera.lookAt( new THREE.Vector3(middleOfGrid, 100, middleOfGrid) );

    renderer.render( scene, camera );
  }
}
