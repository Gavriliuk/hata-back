'use strict';
 angular.module('nearPlaceApp')
 .factory('Category', function ($q) {

    var Category = Parse.Object.extend('Category', {}, {

      create: function (category) {

        var defer = $q.defer();
        var objCategory = new Category();

        objCategory.save(category, {
          success: function (obj) {
            defer.resolve(obj);
          }, error: function (obj, error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

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

      destroy: function (categoryId) {

        var defer = $q.defer();

        var category = new Category();
        category.id = categoryId;

        category.destroy({
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

        if (params.order === 'order') {
          query.ascending('order');
        } else if (params.order === '-order') {
          query.descending('order');
        } else {
          query.ascending('order');
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

    });

    Object.defineProperty(Category.prototype, 'title_ru',
        {
          get: function () {
            return this.get('title_ru');
          },
          set: function (val) {
            this.set('title_ru', val);
          }
        });
    Object.defineProperty(Category.prototype, 'title_ro',
         {
             get: function () {
                 return this.get('title_ro');
             },
             set: function (val) {
                 this.set('title_ro', val);
             }
         });
    Object.defineProperty(Category.prototype, 'title_en',
      {
        get: function () {
            return this.get('title_en');
        },
        set: function (val) {
            this.set('title_en', val);
        }
    });

     Object.defineProperty(Category.prototype, 'information_ru',
         {
             get: function () {
                 return this.get('information_ru');
             },
             set: function (val) {
                 this.set('information_ru', val);
             }
         });
     Object.defineProperty(Category.prototype, 'information_ro',
         {
             get: function () {
                 return this.get('information_ro');
             },
             set: function (val) {
                 this.set('information_ro', val);
             }
         });
     Object.defineProperty(Category.prototype, 'information_en',
         {
             get: function () {
                 return this.get('information_en');
             },
             set: function (val) {
                 this.set('information_en', val);
             }
         });

         Object.defineProperty(Category.prototype, 'start_route',
         {
             get: function () {
                 return this.get('start_route');
             },
             set: function (val) {
                 this.set('start_route', val);
             }
         });

    Object.defineProperty(Category.prototype, 'waypoints',
         {
             get: function () {
                 return this.get('waypoints');
             },
             set: function (val) {
                 this.set('waypoints', val);
             }
    });
         
    Object.defineProperty(Category.prototype, 'end_route',
         {
             get: function () {
                 return this.get('end_route');
             },
             set: function (val) {
                 this.set('end_route', val);
             }
    });
    
    Object.defineProperty(Category.prototype, 'center_map',
    {
        get: function () {
            return this.get('center_map');
        },
        set: function (val) {
            this.set('center_map', val);
        }
});

    Object.defineProperty(Category.prototype, 'image',
      {
      get: function () {
        return this.get('image');
      },
      set: function (val) {
        this.set('image', val);
      }
    });

    Object.defineProperty(Category.prototype, 'imageThumb',
    {
      get: function () {
        return this.get('imageThumb');
      }
    });

    Object.defineProperty(Category.prototype, 'icon',
    {
      get: function () {
        return this.get('icon');
      },
      set: function (val) {
        this.set('icon', val);
      }
    });

    Object.defineProperty(Category.prototype, 'order',
    {
      get: function () {
        return this.get('order');
      },
      set: function (val) {
        this.set('order', val);
      }
    });

return Category;

});
