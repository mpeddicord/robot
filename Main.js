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

  init();
  animate();
  
  function onDocumentMouseDown( event ) {
    var cx = (event.clientX-containerLeft) / containerWidth; 
    var cy = (event.clientY-containerTop) / containerHeight; 
    
    gridWorld.handleClicks( cx, cy, camera, projector ); //This is the new interface in picking.
  }

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
          
    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '50px';
    info.style.width = '100%';
    info.style.textAlign = 'left';
    info.innerHTML = 'Time Mult: <span id="timeMult">1x</span><br />' + 
                    '<span id="console"></span>';
    container.appendChild( info );
    
    /* //This is in HTML now
    var sliderContainer = document.createElement( 'div' );
    sliderContainer.style.position = 'absolute';
    sliderContainer.style.bottom = '20px';
    sliderContainer.style.width = '1000';
    sliderContainer.innerHTML = '<input id="defaultSlider" type="range" min="0" max="500" />';
    //document.body.appendChild( sliderContainer );
    */

    camera = new THREE.OrthographicCamera( 
      window.innerWidth / -zoom, 
      window.innerWidth / zoom, 
      window.innerHeight / zoom, 
      window.innerHeight / -zoom, 
      1, 
      5000 
    );
      
    camera.position.x = 1000;
    camera.position.y = 1000;
    camera.position.z = 1000;
    camera.lookAt(new THREE.Vector3(0,0,0));
    
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
    scene.add( line );

    // Cubes
    gridWorld = new World(scene);
    loadLevel(gridWorld);

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
    renderer = new THREE.WebGLRenderer();
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

    //camera.position.x = Math.cos( timer ) * 200 + middleOfGrid;
    //camera.position.z = Math.sin( timer ) * 200 + middleOfGrid;
    //camera.lookAt( new THREE.Vector3(middleOfGrid, 100, middleOfGrid) );

    renderer.render( scene, camera );
  }
}
