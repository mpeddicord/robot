function Block(data) {
  DynamicObjectBase.call(this,data);
  data = this.data;
  var self = this;
  
  this.body = THREE.SceneUtils.createMultiMaterialObject( data.blockGeo, this.personalColor ); 
  this.body.children[0].userData.gameObject = this;
  this.setPosition(data.pos);
};

Block.prototype = new DynamicObjectBase();
Block.prototype.constructor = Block;