'use strict';

var q = require('q');

var LoginManager = {
  prototype: {
    _driverLogin: function() {
      var dfd = q.defer();
      var module = this;

      this.corbelDriver.iam.token().create()
        .then(function(response) {
          if (response.data && response.data.accessToken) {
            dfd.resolve(response.data);
          } else {
            //This point can be reached if the urlBase of the driver points to another service that returns something.
            module.events.emit('error', 'login:invalid:response');
            dfd.reject('login:invalid:response');
          }
        })
        .catch(function(err) {
          //Invalid credentials, 401, 404
          var error = err.data && err.data.body ? err.data.body : '';
          module.events.emit('error', 'login:invalid:credentials', err.status, error);
          dfd.reject(error);
        });

      return dfd.promise;
    },
    logClient: function() {
      /*jshint validthis:true */
      var dfd = q.defer();
      var module = this;

      this._driverLogin()
        .then(function() {
          module.events.emit('info', 'login:successful', Date.now());
          dfd.resolve();
        })
        .catch(function(error) {
          module.events.emit('error', 'login:invalid', error);
          dfd.reject(error);
        });

      return dfd.promise;
    }
  },
  create: function(options) {
    return Object.create(LoginManager.prototype, options);
  }
};

module.exports = LoginManager.create();