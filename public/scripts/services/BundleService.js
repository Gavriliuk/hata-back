'use strict';

angular.module('nearPlaceApp').factory('Bundle', function ($q, moment) {

  var Bundle = Parse.Object.extend('Bundle', {
    getStatus: function () {
      if (moment().toDate() >= this.expiresAt) {
        return 'Expired';
      }
      else if (this.isApproved && !this.isUsed) {
        return 'Active';
      } else if (this.isApproved === false) {
        return 'Rejected';
      } else if (this.isUsed) {
        return 'Used';
      } else {
        return 'Pending';
      }
    }
  }, {
      getAllAttributes: function () {
        var except = ["constructor", "getStatus", "user"];
        return Object.getOwnPropertyNames(this.prototype).filter(function (property) {
          return except.indexOf(property) == -1;    
        });
      },
      create: function (bundle) {
        var defer = $q.defer();
        var objBundle = new Bundle();
        bundle.user = Parse.User.current();
        bundle.isApproved = true;
        bundle.isUsed = false;
        bundle.productId = "com.innapp.dromos."
        console.log('BUNDLE:',bundle);
        bundle.code = voucher_codes.generate({
          prefix: promocode.prefix || "com.innapp.dromos."
        })[0];
        objBundle.save(bundle, {
          success: function (success) {
            defer.resolve(success);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      update: function (bundle) {
        var defer = $q.defer();
        bundle.save(null, {
          success: function (success) {
            defer.resolve(success);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      destroy: function (Bundle) {
        var defer = $q.defer();
        Bundle.destroy({
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },
      all: function (params) {
        var defer = $q.defer();
        var query = new Parse.Query(this);
        if (params.filter != '') {
          query.contains('canonical', params.filter);
        }
        if (params.filterprefix != '') {
          query.contains('prefix', params.filterprefix);
        }


        if (params.status && params.status !== null) {

          if (params.status === 'pending') {
            query.doesNotExist('isApproved');
          } else if (params.status === 'rejected') {
            query.equalTo('isApproved', false);
          } else if (params.status === 'approved') {
            query.equalTo('isApproved', true);
          } else if (params.status === 'used') {
            query.equalTo('isUsed', true);
          } else if (params.status === 'expired') {
            query.lessThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.status === 'expireInTenDays') {
            var expiresAt = moment().add(10, 'days').toDate();
            query.lessThanOrEqualTo('expiresAt', expiresAt);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.status === 'expireInThirtyDays') {
            var expiresAt = moment().add(30, 'days').toDate();
            query.lessThanOrEqualTo('expiresAt', expiresAt);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          }
        }

        if (params.sortColumn) {
          if (params.reverseSort) {
            query.ascending(params.sortColumn);
          }
          else {
            query.descending(params.sortColumn);
          }
        }
        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
        query.find({
          success: function (bundles) {
            defer.resolve(bundles);
          }, error: function (error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },

      count: function (params) {
        var defer = $q.defer();
        var query = new Parse.Query(this);
        
        if (params.filter != '') {
          query.contains('canonical', params.filter);
        }
        
        if (params.filterprefix != '') {
          query.contains('prefix', params.filterprefix);
        }

        if (params.date && params.date !== null) {
          var start = moment(params.date).startOf('day');
          var end = moment(params.date).endOf('day');
          query.greaterThanOrEqualTo('createdAt', start.toDate());
          query.lessThanOrEqualTo('createdAt', end.toDate());
        }

        if (params.status && params.status !== null) {

          if (params.status === 'pending') {
            query.doesNotExist('isApproved');
          } else if (params.status === 'rejected') {
            query.equalTo('isApproved', false);
          } else if (params.status === 'approved') {
            query.equalTo('isApproved', true);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.status === 'used') {
            query.equalTo('isUsed', true);
          } else if (params.status === 'expired') {
            query.lessThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.status === 'expireInTenDays') {
            var expiresAt = moment().add(10, 'days').toDate();
            query.lessThanOrEqualTo('expiresAt', expiresAt);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.status === 'expireInThirtyDays') {
            var expiresAt = moment().add(30, 'days').toDate();
            query.lessThanOrEqualTo('expiresAt', expiresAt);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          }
        }
        query.count({
          success: function (count) {
            defer.resolve(count);
          }, error: function (error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      }
    });

  Object.defineProperty(Bundle.prototype, 'user', {
    get: function () {
      return this.get('user');
    },
    set: function (value) {
      this.set('user', value);
    }
  });

  Object.defineProperty(Bundle.prototype, 'title_ru', {
    get: function () {
      return this.get('title_ru');
    },
    set: function (value) {
      this.set('title_ru', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'title_ro', {
    get: function () {
      return this.get('title_ro');
    },
    set: function (value) {
      this.set('title_ro', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'title_en', {
    get: function () {
      return this.get('title_en');
    },
    set: function (value) {
      this.set('title_en', value);
    }
  });

  Object.defineProperty(Bundle.prototype, 'route', {
    get: function () {
      return this.get('route');
    },
    set: function (val) {
      this.set('route', val);
    }
  });

  Object.defineProperty(Bundle.prototype, 'description_ru', {
    get: function () {
      return this.get('description_ru');
    },
    set: function (value) {
      this.set('description_ru', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'description_ro', {
    get: function () {
      return this.get('description_ro');
    },
    set: function (value) {
      this.set('description_ro', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'description_en', {
    get: function () {
      return this.get('description_en');
    },
    set: function (value) {
      this.set('description_en', value);
    }
  });

  Object.defineProperty(Bundle.prototype, 'sum', {
    get: function () {
      return this.get('sum');
    },
    set: function (value) {
      this.set('sum', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'prefix', {
    get: function () {
      return this.get('prefix');
    },
    set: function (value) {
      this.set('prefix', value);
    }
  });

  Object.defineProperty(Bundle.prototype, 'currency', {
    get: function () {
      return this.get('currency');
    },
    set: function (value) {
      this.set('currency', value);
    }
  });

  Object.defineProperty(Bundle.prototype, 'isApproved', {
    get: function () {
      return this.get('isApproved');
    },
    set: function (value) {
      this.set('isApproved', value);
    }
  });
  Object.defineProperty(Bundle.prototype, 'isUsed', {
    get: function () {
      return this.get('isUsed');
    },
    set: function (value) {
      this.set('isUsed', value);
    }
  });

  return Bundle;
});
