'use strict';

angular.module('nearPlaceApp')
  .factory('Place', function ($q, moment) {

    var Place = Parse.Object.extend('Place', {

      getStatus: function () {

        if (moment().toDate() >= this.expiresAt) {
          return 'Expired';
        }
        else if (this.isApproved) {
          return 'Approved';
        } else if (this.isApproved === false) {
          return 'Rejected';
        } else {
          return 'Pending';
        }
      }

    }, {

        create: function (place) {

          
          var defer = $q.defer();

          var objPlace = new Place();
          place.user = Parse.User.current();


          objPlace.save(place, {
            success: function (success) {
              defer.resolve(success);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;
        },

        update: function (place) {

          var defer = $q.defer();

          place.save(null, {
            success: function (success) {
              defer.resolve(success);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;

        },

        destroy: function (place) {

          var defer = $q.defer();

          place.destroy({
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

          if (params.route && params.route !== null) {
            query.equalTo('route', params.route);
          }
//schimbari//
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

          query.include('route');
          query.descending('createdAt');
          query.limit(params.limit);
          query.skip((params.page * params.limit) - params.limit);
          query.find({
            success: function (places) {
              var placesR = places.map(place => {
                var placeR = place;
                var placeRimages = place.images.map(img => {
                  var imgR = img;
                  imgR._url = Parse.serverURL + "/files/" + Parse.applicationId + "/" + img._name;
                  return imgR;
                })
                return placeR
              })
              defer.resolve(placesR);
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

          if (params.route && params.route !== null) {
            query.equalTo('route', params.route);
          }

          if (params.date && params.date !== null) {
            var start = moment(params.date).startOf('day');
            var end = moment(params.date).endOf('day');
            query.greaterThanOrEqualTo('createdAt', start.toDate());
            query.lessThanOrEqualTo('createdAt', end.toDate());
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


    Object.defineProperty(Place.prototype, 'user', {
      get: function () {
        return this.get('user');
      },
      set: function (value) {
        this.set('user', value);
      }
    });

    Object.defineProperty(Place.prototype, 'title_ru', {
      get: function () {
        return this.get('title_ru');
      },
      set: function (value) {
        this.set('title_ru', value);
      }
    });
    Object.defineProperty(Place.prototype, 'title_ro', {
      get: function () {
        return this.get('title_ro');
      },
      set: function (value) {
        this.set('title_ro', value);
      }
    });

    Object.defineProperty(Place.prototype, 'title_en', {
      get: function () {
        return this.get('title_en');
      },
      set: function (value) {
        this.set('title_en', value);
      }
    });


    Object.defineProperty(Place.prototype, 'description_ru', {
      get: function () {
        return this.get('description_ru');
      },
      set: function (value) {
        this.set('description_ru', value);
      }
    });
    Object.defineProperty(Place.prototype, 'description_ro', {
      get: function () {
        return this.get('description_ro');
      },
      set: function (value) {
        this.set('description_ro', value);
      }
    });
    Object.defineProperty(Place.prototype, 'description_en', {
      get: function () {
        return this.get('description_en');
      },
      set: function (value) {
        this.set('description_en', value);
      }
    });

    Object.defineProperty(Place.prototype, 'address_ru', {
      get: function () {
        return this.get('address_ru');
      },
      set: function (value) {
        this.set('address_ru', value);
      }
    });
    Object.defineProperty(Place.prototype, 'address_ro', {
      get: function () {
        return this.get('address_ro');
      },
      set: function (value) {
        this.set('address_ro', value);
      }
    });
    Object.defineProperty(Place.prototype, 'address_en', {
      get: function () {
        return this.get('address_en');
      },
      set: function (value) {
        this.set('address_en', value);
      }
    });

    Object.defineProperty(Place.prototype, 'radius', {
      get: function () {
        return this.get('radius');
      },
      set: function (value) {
        this.set('radius', value);
      }
    });

    Object.defineProperty(Place.prototype, 'images',
      {
        get: function () {
          return this.get('images');
        },
        set: function (val) {
          this.set('images', val);
        }
      });

    Object.defineProperty(Place.prototype, 'original_images',
      {
        get: function () {
          return this.get('original_images');
        },
        set: function (val) {
          this.set('original_images', val);
        }
      });
    Object.defineProperty(Place.prototype, 'deletedImages',
      {
        get: function () {
          return this.get('deletedImages');
        },
        set: function (value) {
          this.set('deletedImages', value);
        }
      });

    Object.defineProperty(Place.prototype, 'audio_en', {
      get: function () {
        return this.get('audio_en');
      },
      set: function (value) {
        this.set('audio_en', value);
      }
    });

    Object.defineProperty(Place.prototype, 'audio_ru', {
      get: function () {
        return this.get('audio_ru');
      },
      set: function (value) {
        this.set('audio_ru', value);
      }
    });
    Object.defineProperty(Place.prototype, 'audio_ro', {
      get: function () {
        return this.get('audio_ro');
      },
      set: function (value) {
        this.set('audio_ro', value);
      }
    });

    Object.defineProperty(Place.prototype, 'imageThumb', {
      get: function () {
        return this.get('imageThumb');
      }
    });

    Object.defineProperty(Place.prototype, 'location', {
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

    Object.defineProperty(Place.prototype, 'isApproved', {
      get: function () {
        return this.get('isApproved');
      },
      set: function (value) {
        this.set('isApproved', value);
      }
    });

    Object.defineProperty(Place.prototype, 'expiresAt', {
      get: function () {
        return this.get('expiresAt');
      },
      set: function (value) {
        this.set('expiresAt', value);
      }
    });

    Object.defineProperty(Place.prototype, 'startPeriod', {
      get: function () {
        return this.get('startPeriod');
      },
      set: function (value) {
        this.set('startPeriod', value);
      }
    });

    Object.defineProperty(Place.prototype, 'endPeriod', {
      get: function () {
        return this.get('endPeriod');
      },
      set: function (value) {
        this.set('endPeriod', value);
      }
    });

    return Place;

  });
