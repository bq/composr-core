'use strict';

var BaseModel = function(){};

BaseModel.prototype._generateId = function(domain) {
  return domain + '!' + this.getName() + '-' + this.getVersion();
};

BaseModel.prototype.getId = function() {
  return this.id;
};

BaseModel.prototype.getVirtualDomainId = function() {
  //return this.id;
};

BaseModel.prototype.getName = function(){
  return this.json[this.nameField];
};

BaseModel.prototype.getRawModel = function(){
  return this.json;
};

BaseModel.prototype.getMD5 = function() {
  return this.json.md5;
};

BaseModel.prototype.getVersion = function() {
  return this.json.version;
};

BaseModel.prototype.compile = function(){
  console.log('Not implemented');
};

module.exports = BaseModel;