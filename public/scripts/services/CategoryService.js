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

          if (params.filter && params.filter != '') {
            query.contains('canonical', params.filter);
          }

     
   
          params.limit && query.limit(params.limit);
          params.page && query.skip((params.page * params.limit) - params.limit);
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
