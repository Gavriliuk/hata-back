'use strict';
angular.module('nearPlaceApp')
  .factory('City', function ($q) {

    var City = Parse.Object.extend('City', {},{ 

      create: function (city) {
          var defer = $q.defer();
          var objCity = new City();
          city.user = Parse.User.current();
          objCity.save(city, {
            success: function (obj) {
              defer.resolve(obj);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });
          return defer.promise;
      },

      update: function (city) {
        var defer = $q.defer();
          city.save(null, {
            success: function (obj) {
              defer.resolve(obj);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });
          return defer.promise;
      },
      get: function (cityId) {
        var defer = $q.defer();
        var city = new City();
        var query = new Parse.Query(city);
        query.get(cityId, {
            success: function (obj) {
                defer.resolve(obj);
            }, error: function (obj, error) {
                defer.reject(error);
            }
        });
        return defer.promise;
    },
    
    find: function (routes) {
      var defer = $q.defer();
      routes.find({
          success: function (obj) {
              defer.resolve(obj);
          }, error: function (obj, error) {
              defer.reject(error);
          }
      });

      return defer.promise;
    },

    save: function (city) {
      var defer = $q.defer();
      if (city.routes && city.routes.length !== 0) {
        var relation = city.relation('routesRelation');
          for (var i = 0; i < city.routes.length; i++) {
            relation.add(city.routes[i]);
            delete city.routes[i];
          }
      }
      city.save(null, {
          success: function (obj) {
              defer.resolve(obj);
          }, error: function (obj, error) {
              defer.reject(error);
          }
      });
      return defer.promise;
    },

    destroy: function (city) {
      var defer = $q.defer();
      city.destroy({
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
          if (params.filter && params.filter != '') {
            query.contains('canonical', params.filter);
          }
          params.limit && query.limit(params.limit);
          params.page && query.skip((params.page * params.limit) - params.limit);
          query.find({
            success: function (cities) {
              defer.resolve(cities);
            }, error: function (error) {
              defer.reject(error);
            }
          });
          return defer.promise;
      },
      removeRoute: function (dataObj) {
        var defer = $q.defer();
        var city = dataObj.city;
        var route = dataObj.route;
        var relation = city.relation("routesRelation");
        var query = relation.query();
        query.find({
            success: function (follower) {
                for (var i = 0; i < follower.length; i++) {
                    if (follower[i].id === route.id) {
                        relation.remove(follower[i]);
                        city.save();
                    }
                }
                defer.resolve(follower);
            }, error: function (follower, error) {
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

    Object.defineProperty(City.prototype, 'routesRelation', {
        get: function () {
            return this.get('routesRelation');
        },
        set: function (val) {
            this.set('routesRelation', val);
        }
    });

    Object.defineProperty(City.prototype, 'countryId', {
        get: function () {
            return this.get('countryId');
        },
        set: function (val) {
            this.set('countryId', val);
        }
    });

    Object.defineProperty(City.prototype, 'icon', {
      get: function () {
        return this.get('icon');
      },
      set: function (value) {
        this.set('icon', value);
      }
    });

    Object.defineProperty(City.prototype, 'title_ru', {
      get: function () {
        return this.get('title_ru');
      },
      set: function (value) {
        this.set('title_ru', value);
      }
    });

    Object.defineProperty(City.prototype, 'title_ro', {
      get: function () {
        return this.get('title_ro');
      },
      set: function (value) {
        this.set('title_ro', value);
      }
    });

    Object.defineProperty(City.prototype, 'title_en', {
      get: function () {
        return this.get('title_en');
      },
      set: function (value) {
        this.set('title_en', value);
      }
    });

    Object.defineProperty(City.prototype, 'information_ru', {
      get: function () {
        return this.get('information_ru');
      },
      set: function (value) {
        this.set('information_ru', value);
      }
    });

    Object.defineProperty(City.prototype, 'information_ro', {
      get: function () {
        return this.get('information_ro');
      },
      set: function (value) {
        this.set('information_ro', value);
      }
    });

    Object.defineProperty(City.prototype, 'information_en', {
      get: function () {
        return this.get('information_en');
      },
      set: function (value) {
        this.set('information_en', value);
      }
    });

    Object.defineProperty(City.prototype, 'location', {
      get: function () {
        return this.get('location');
      },
      set: function (val) {
        this.set('location', new Parse.GeoPoint({
          latitude: val.latitude,
          longitude: val.longitude
        }));
      }
    });

    Object.defineProperty(City.prototype, 'radius', {
      get: function () {
        return this.get('radius');
      },
      set: function (value) {
        this.set('radius', value);
      }
    });

    return City;
  });
