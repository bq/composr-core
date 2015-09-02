'use strict';


function snippetWrapper(snippetCode){
  var pre = 'return (function(){\n';
  var post = '\n})();';

  return pre + snippetCode + post;  
}

module.exports = snippetWrapper;