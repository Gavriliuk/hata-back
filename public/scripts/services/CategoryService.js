'use strict';

angular.module('nearPlaceApp')
  .factory('Category', function ($q) {

    var Category = Parse.Object.extend('Category', {},

     {

        create: function (category) {

          
          var defer = $q.defer();
          var objCategory = new Category();

          category.user = Parse.User.current();


          objCategory.save(category, {
            success: function (obj) {
              defer.resolve(obj);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;
        }
      ,

        update: function (category) {

          var defer = $q.defer();

          category.save(null, {
            success: function (obj) {
              defer.resolve(obj);
            }, error: function (obj, error) {
              defer.reject(error);
            }
          });

          return defer.promise;
        
        },

        destroy: function (category) {

          var defer = $q.defer();

          category.destroy({
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

     
   
          query.limit(params.limit);
          query.skip((params.page * params.limit) - params.limit);
          query.find({
            success: function (categories) {
              defer.resolve(categories);
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


    Object.defineProperty(Category.prototype, 'icon', {
      get: function () {
        return this.get('icon');
      },
      set: function (value) {
        this.set('icon', value);
      }
    });

    Object.defineProperty(Category.prototype, 'title_ru', {
      get: function () {
        return this.get('title_ru');
      },
      set: function (value) {
        this.set('title_ru', value);
      }
    });
    Object.defineProperty(Category.prototype, 'title_ro', {
      get: function () {
        return this.get('title_ro');
      },
      set: function (value) {
        this.set('title_ro', value);
      }
    });

    Object.defineProperty(Category.prototype, 'title_en', {
      get: function () {
        return this.get('title_en');
      },
      set: function (value) {
        this.set('title_en', value);
      }
    });


    Object.defineProperty(Category.prototype, 'description_ru', {
      get: function () {
        return this.get('description_ru');
      },
      set: function (value) {
        this.set('description_ru', value);
      }
    });
    Object.defineProperty(Category.prototype, 'description_ro', {
      get: function () {
        return this.get('description_ro');
      },
      set: function (value) {
        this.set('description_ro', value);
      }
    });
    Object.defineProperty(Category.prototype, 'description_en', {
      get: function () {
        return this.get('description_en');
      },
      set: function (value) {
        this.set('description_en', value);
      }
    });

   

    return Category;

  });
