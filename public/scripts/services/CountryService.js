'use strict';
angular.module('nearPlaceApp')
    .factory('Country', function ($q) {

        var Country = Parse.Object.extend('Country', {}, {
            create: function (country) {
                var defer = $q.defer();
                var objCountry = new Country();
                country.user = Parse.User.current();
                objCountry.save(country, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            update: function (country) {
                var defer = $q.defer();
                country.save(null, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            save: function (dataObj) {
                var defer = $q.defer();
                var country = dataObj.country;
                var city = dataObj.city;
                if (country) {
                    var relation = country.relation('citiesRelation');
                    relation.add(city);
                }
                country.save(null, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            get: function (countryId) {
                var defer = $q.defer();
                var country = new Country();
                var query = new Parse.Query(country);
                query.get(countryId, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            find: function (cities) {
                var defer = $q.defer();
                cities.find({
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            destroy: function (countryId) {
                var defer = $q.defer();
                var country = new Country();
                country.id = countryId;
                country.destroy({
                    success: function (obj) {
                       defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
           
            destroyAllCities: function (country) {
                var defer = $q.defer();
                var relation = country.relation("citiesRelation");
                var query = relation.query();
                query.find({
                    success: function (cities) {
                        for (var i = 0; i < cities.length; i++) {
                            if (cities[i].id) {
                               Country.destroyCity(cities[i]);
                               country.save();
                            }
                        }
                        defer.resolve(cities);
                    }, error: function (cities, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            destroyCity: function (city) {
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

            getByIds: function (ids) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                query.containedIn('objectId', ids);
                query.find({
                    success: function (countries) {
                        defer.resolve(countries);
                    }, error: function (error) {
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
                    success: function (countries) {
                        defer.resolve(countries);
                    }, error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
             // removeRelationCity: function (cityObj) {
            //     var defer = $q.defer();
            //     var country = cityObj.country;
            //     var city = cityObj.city;
            //     var relation = country.relation("citiesRelation");
            //     var query = relation.query();
            //     query.find({
            //         success: function (follower) {
            //             for (var i = 0; i < follower.length; i++) {
            //                 if (follower[i].id === city.id) {
            //                     relation.remove(follower[i]);
            //                     country.save();
            //                 }
            //             }
            //             defer.resolve(follower);
            //         }, error: function (follower, error) {
            //             defer.reject(error);
            //         }
            //     });
            //     return defer.promise;
            // },
        });

        Object.defineProperty(Country.prototype, 'citiesRelation', {
            get: function () {
                return this.get('citiesRelation');
            },
            set: function (val) {
                this.set('citiesRelation', val);
            }
        });

        Object.defineProperty(Country.prototype, 'title_ru', {
            get: function () {
                return this.get('title_ru');
            },
            set: function (val) {
                this.set('title_ru', val);
            }
        });

        Object.defineProperty(Country.prototype, 'title_ro', {
            get: function () {
                return this.get('title_ro');
            },
            set: function (val) {
                this.set('title_ro', val);
            }
        });

        Object.defineProperty(Country.prototype, 'title_en', {
            get: function () {
                return this.get('title_en');
            },
            set: function (val) {
                this.set('title_en', val);
            }
        });

        Object.defineProperty(Country.prototype, 'information_ru', {
            get: function () {
                return this.get('information_ru');
            },
            set: function (val) {
                this.set('information_ru', val);
            }
        });

        Object.defineProperty(Country.prototype, 'information_ro', {
            get: function () {
                return this.get('information_ro');
            },
            set: function (val) {
                this.set('information_ro', val);
            }
        });

        Object.defineProperty(Country.prototype, 'information_en', {
            get: function () {
                return this.get('information_en');
            },
            set: function (val) {
                this.set('information_en', val);
            }
        });

        // Object.defineProperty(Country.prototype, 'image', {
        //     get: function () {
        //         return this.get('image');
        //     },
        //     set: function (val) {
        //         this.set('image', val);
        //     }
        // });

        // Object.defineProperty(Country.prototype, 'deletedimage', {
        //     get: function () {
        //         return this.get('deletedimage');
        //     },
        //     set: function (value) {
        //         this.set('deletedimage', value);
        //     }
        // });

        Object.defineProperty(Country.prototype, 'deletedicon', {
            get: function () {
                return this.get('deletedicon');
            },
            set: function (value) {
                this.set('deletedicon', value);
            }
        });

        Object.defineProperty(Country.prototype, 'icon', {
            get: function () {
                return this.get('icon');
            },
            set: function (val) {
                this.set('icon', val);
            }
        });
        return Country;
    });
