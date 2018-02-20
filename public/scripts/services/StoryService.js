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

    count: function (params) {

      var defer = $q.defer();

      var query = new Parse.Query(this);

      if (params.filter != '') {
        query.contains('canonical', params.filter);
      }

      if (params.category && params.category !== null) {
        query.equalTo('category', params.category);
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

    all: function (params) {

      var defer = $q.defer();

      var query = new Parse.Query(this);

      if (params.filter != '') {
        query.contains('canonical', params.filter);
      }

      if (params.category && params.category !== null) {
        query.equalTo('category', params.category);
      }

      if (params.order === 'name') {
        query.ascending('name');
      } else if (params.order === '-name') {
        query.descending('name');
      } else {
        query.ascending('name');
      }
      query.include('category');
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

  });

  Object.defineProperty(Story.prototype, 'category', {
    get: function () {
      return this.get('category');
    },
    set: function (value) {
      this.set('category', value);
    }
  });

  Object.defineProperty(Story.prototype, 'name',
    {
      get: function () {
        return this.get('name');
      },
      set: function (val) {
        this.set('name', val);
      }
    });


  Object.defineProperty(Story.prototype, 'audio_ru',
    {
      get: function () {
        return this.get('audio_ru');
      },
      set: function (val) {
        this.set('audio_ru', val);
      }
    });

  Object.defineProperty(Story.prototype, 'audio_ro',
    {
      get: function () {
        return this.get('audio_ro');
      },
      set: function (val) {
        this.set('audio_ro', val);
      }
    });

  Object.defineProperty(Story.prototype, 'audio_en',
    {
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
