'use strict';
angular.module('nearPlaceApp')
    .factory('Route', function ($q) {

        var Route = Parse.Object.extend('Route', {}, {

            create: function (route) {

                var defer = $q.defer();
                var objRoute = new Route();

                objRoute.save(route, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            update: function (route) {

                var defer = $q.defer();

                route.save(null, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },
            save: function (route) {
                var defer = $q.defer();

                if (route.places && route.places.length !== 0) {
                    var relation = route.relation('placesRelation');
                    for (var i = 0; i < route.places.length; i++) {
                        relation.add(route.places[i]);
                        delete route.places[i];
                    }
                }
                if (route.stories && route.stories.length !== 0) {
                    var relation = route.relation('storiesRelation');
                    for (var i = 0; i < route.stories.length; i++) {
                        relation.add(route.stories[i]);
                        delete route.stories[i];
                    }
                }

                route.save(null, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            get: function (routeId) {
                var defer = $q.defer();

                var route = new Route();
                var query = new Parse.Query(route);
                query.get(routeId, {
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            find: function (places) {
                var defer = $q.defer();

                places.find({
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            destroy: function (routeId) {

                var defer = $q.defer();

                var route = new Route();
                route.id = routeId;

                route.destroy({
                    success: function (obj) {
                        defer.resolve(obj);
                    }, error: function (obj, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            removePlace: function (placeObj) {
                var defer = $q.defer();
                var route = placeObj.route;
                var place = placeObj.place;
                var relation = route.relation("placesRelation");
                var query = relation.query();
                query.find({
                    success: function (follower) {

                        for (var i = 0; i < follower.length; i++) {
                            if (follower[i].id === place.id) {
                                relation.remove(follower[i]);
                                route.save();
                            }
                        }
                        defer.resolve(follower);
                    }, error: function (follower, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },

            removeStory: function (storyObj) {
                var defer = $q.defer();
                var route = storyObj.route;
                var story = storyObj.story;
                var relation = route.relation("storiesRelation");
                var query = relation.query();
                query.find({
                    success: function (follower) {

                        for (var i = 0; i < follower.length; i++) {
                            if (follower[i].id === story.id) {
                                relation.remove(follower[i]);
                                route.save();
                            }
                        }
                        defer.resolve(follower);

                    },
                    error: function (follower, error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },


            destroy: function (routeId) {

                var defer = $q.defer();

                var route = new Route();
                route.id = routeId;

                route.destroy({
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
                    success: function (routes) {
                        defer.resolve(routes);
                    }, error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;

            },

        });

        Object.defineProperty(Route.prototype, 'placesRelation',
            {
                get: function () {
                    return this.get('placesRelation');
                },
                set: function (val) {
                    this.set('placesRelation', val);
                }
            });

        Object.defineProperty(Route.prototype, 'storiesRelation',
            {
                get: function () {
                    return this.get('storiesRelation');
                },
                set: function (val) {
                    this.set('storiesRelation', val);
                }
            });

        Object.defineProperty(Route.prototype, 'title_ru',
            {
                get: function () {
                    return this.get('title_ru');
                },
                set: function (val) {
                    this.set('title_ru', val);
                }
            });
        Object.defineProperty(Route.prototype, 'title_ro',
            {
                get: function () {
                    return this.get('title_ro');
                },
                set: function (val) {
                    this.set('title_ro', val);
                }
            });
        Object.defineProperty(Route.prototype, 'title_en',
            {
                get: function () {
                    return this.get('title_en');
                },
                set: function (val) {
                    this.set('title_en', val);
                }
            });

        Object.defineProperty(Route.prototype, 'information_ru',
            {
                get: function () {
                    return this.get('information_ru');
                },
                set: function (val) {
                    this.set('information_ru', val);
                }
            });
        Object.defineProperty(Route.prototype, 'information_ro',
            {
                get: function () {
                    return this.get('information_ro');
                },
                set: function (val) {
                    this.set('information_ro', val);
                }
            });
        Object.defineProperty(Route.prototype, 'information_en',
            {
                get: function () {
                    return this.get('information_en');
                },
                set: function (val) {
                    this.set('information_en', val);
                }
            });

        Object.defineProperty(Route.prototype, 'start_route',
            {
                get: function () {
                    return this.get('start_route');
                },
                set: function (val) {
                    this.set('start_route', val);
                }
            });

        Object.defineProperty(Route.prototype, 'waypoints',
            {
                get: function () {
                    return this.get('waypoints');
                },
                set: function (val) {
                    this.set('waypoints', val);
                }
            });

        Object.defineProperty(Route.prototype, 'end_route',
            {
                get: function () {
                    return this.get('end_route');
                },
                set: function (val) {
                    this.set('end_route', val);
                }
            });

        Object.defineProperty(Route.prototype, 'center_map',
            {
                get: function () {
                    return this.get('center_map');
                },
                set: function (val) {
                    this.set('center_map', val);
                }
            });

        Object.defineProperty(Route.prototype, 'image',
            {
                get: function () {
                    return this.get('image');
                },
                set: function (val) {
                    this.set('image', val);
                }
            });

        Object.defineProperty(Route.prototype, 'imageThumb',
            {
                get: function () {
                    return this.get('imageThumb');
                }
            });

        Object.defineProperty(Route.prototype, 'icon',
            {
                get: function () {
                    return this.get('icon');
                },
                set: function (val) {
                    this.set('icon', val);
                }
            });

        Object.defineProperty(Route.prototype, 'order',
            {
                get: function () {
                    return this.get('order');
                },
                set: function (val) {
                    this.set('order', val);
                }
            });

        return Route;

    });
