function UserModel(options){
  this.name = options.name;
}

UserModel.prototype.getName = function(){
 return this.name; 
}