'use strict';
angular.module('nearPlaceApp')
  .factory('Story', function ($q) {

    var Story = Parse.Object.extend('Story', {}, {
      create: function (story) {
        var defer = $q.defer();
        var objStory = new Story();
        objStory.save(story, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },

      update: function (story) {
        var defer = $q.defer();
        story.save(null, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },

      destroy: function (storyId) {
        var defer = $q.defer();
        var story = new Story();
        story.id = storyId;
        story.destroy({
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
        if (params.route && params.route !== null) {
          if (params.route === 'pending') {
            query.doesNotExist('isApproved');
          } else if (params.route === 'rejected') {
            query.equalTo('isApproved', false);
          } else if (params.route === 'approved') {
            query.equalTo('isApproved', true);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.route === 'expired') {
            query.lessThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.route === 'expireInTenDays') {
            var expiresAt = moment().add(10, 'days').toDate();
            query.lessThanOrEqualTo('expiresAt', expiresAt);
            query.greaterThanOrEqualTo('expiresAt', moment().toDate());
          } else if (params.route === 'expireInThirtyDays') {
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
          success: function (stories) {
            defer.resolve(stories);
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
          },
          error: function (error) {
            defer.reject(error);
          }
        });
        return defer.promise;
      },
    });

    Object.defineProperty(Story.prototype, 'route', {
      get: function () {
        return this.get('route');
      },
      set: function (value) {
        this.set('route', value);
      }
    });

    Object.defineProperty(Story.prototype, 'name', {
      get: function () {
        return this.get('name');
      },
      set: function (val) {
        this.set('name', val);
      }
    });

    Object.defineProperty(Story.prototype, 'audio_ru', {
      get: function () {
        return this.get('audio_ru');
      },
      set: function (val) {
        this.set('audio_ru', val);
      }
    });

    Object.defineProperty(Story.prototype, 'audio_ro', {
      get: function () {
        return this.get('audio_ro');
      },
      set: function (val) {
        this.set('audio_ro', val);
      }
    });

    Object.defineProperty(Story.prototype, 'audio_en', {
      get: function () {
        return this.get('audio_en');
      },
      set: function (val) {
        this.set('audio_en', val);
      }
    });

    Object.defineProperty(Story.prototype, 'startPeriod', {
      get: function () {
        return this.get('startPeriod');
      },
      set: function (value) {
        this.set('startPeriod', value);
      }
    });

    Object.defineProperty(Story.prototype, 'endPeriod', {
      get: function () {
        return this.get('endPeriod');
      },
      set: function (value) {
        this.set('endPeriod', value);
      }
    });
    return Story;
  });
