'use strict';

angular.module('nearPlaceApp')
  .factory('Promocode', function ($q, moment) {

    var Promocode = Parse.Object.extend('Promocode', {

      getStatus: function () {
        if (moment().toDate() >= this.expiresAt) {
          return 'Expired';
        }
        else if (this.isApproved && !this.isUsed) {
          return 'Approved';
        } else if (this.isApproved === false) {
          return 'Rejected';
        } else if (this.isUsed) {
          return 'Used';
        } else {
          return 'Pending';
        }
      }
    }, {

        create: function (promocode) {

          var defer = $q.defer();

          var objPromocode = new Promocode();
          promocode.user = Parse.User.current();
          ;
          promocode.code = voucher_codes.generate({
            prefix: promocode.prefix || "DMS-",
            length: promocode.length || 5,
            charset: promocode.charset || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          })[0];

          objPromocode.save(promocode, {
            success: function (success) {
              defer.resolve(success);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;
        },

        update: function (promocode) {

          var defer = $q.defer();

          promocode.save(null, {
            success: function (success) {
              defer.resolve(success);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;

        },

        destroy: function (Promocode) {

          var defer = $q.defer();

          Promocode.destroy({
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

          if (params.startDate && params.startDate !== null) {
            var start = moment(params.startDate).startOf('day');
            query.greaterThanOrEqualTo('startPeriod', start.toDate());
          }
          if (params.endDate && params.endDate !== null) {
            var end = moment(params.endDate).endOf('day');
            query.lessThanOrEqualTo('endPeriod', end.toDate());
          }

          if (params.period && params.period !== null) {
            var start = moment(params.period.start).startOf('day');
            var end = moment(params.period.end).endOf('day');
            query.greaterThanOrEqualTo('startPeriod', start.toDate());
            query.lessThanOrEqualTo('endPeriod', end.toDate());
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

          query.descending('createdAt');
          query.limit(params.limit);
          query.skip((params.page * params.limit) - params.limit);
          query.find({
            success: function (promocodes) {
              defer.resolve(promocodes);
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

    Object.defineProperty(Promocode.prototype, 'user', {
      get: function () {
        return this.get('user');
      },
      set: function (value) {
        this.set('user', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'title', {
      get: function () {
        return this.get('title');
      },
      set: function (value) {
        this.set('title', value);
      }
    });


    Object.defineProperty(Promocode.prototype, 'route', {
      get: function () {
        return this.get('route');
      },
      set: function (val) {
        this.set('route', val);
      }
    });



    Object.defineProperty(Promocode.prototype, 'description', {
      get: function () {
        return this.get('description');
      },
      set: function (value) {
        this.set('description', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'sum', {
      get: function () {
        return this.get('sum');
      },
      set: function (value) {
        this.set('sum', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'currency', {
      get: function () {
        return this.get('currency');
      },
      set: function (value) {
        this.set('currency', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'isApproved', {
      get: function () {
        return this.get('isApproved');
      },
      set: function (value) {
        this.set('isApproved', value);
      }
    });
    Object.defineProperty(Promocode.prototype, 'isUsed', {
      get: function () {
        return this.get('isUsed');
      },
      set: function (value) {
        this.set('isUsed', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'expiresAt', {
      get: function () {
        return this.get('expiresAt');
      },
      set: function (value) {
        this.set('expiresAt', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'startPeriod', {
      get: function () {
        return this.get('startPeriod');
      },
      set: function (value) {
        this.set('startPeriod', value);
      }
    });

    Object.defineProperty(Promocode.prototype, 'endPeriod', {
      get: function () {
        return this.get('endPeriod');
      },
      set: function (value) {
        this.set('endPeriod', value);
      }
    });
    Object.defineProperty(Promocode.prototype, 'code', {
      get: function () {
        return this.get('code');
      },
      set: function (value) {
        this.set('code', value);
      }
    });

    return Promocode;

  });
