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

                if (params.order === 'year') {
                    query.ascending('year');
                } else if (params.order === '-year') {
                    query.descending('year');
                } else {
                    query.ascending('year');
                }

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

        Object.defineProperty(Story.prototype, 'year',
            {
                get: function () {
                    return this.get('year');
                },
                set: function (val) {
                    this.set('year', val);
                }
            });


        Object.defineProperty(Story.prototype, 'audios_ru',
            {
                get: function () {
                    return this.get('audios_ru');
                },
                set: function (val) {
                    var audios_ru = this.get('audios_ru')||[];
                    audios_ru.push(val);
                    this.set('audios_ru', audios_ru);
                }
        });

        Object.defineProperty(Story.prototype, 'audios_ro',
            {
                get: function () {
                    return this.get('audios_ro');
                },
                set: function (val) {
                    var audios_ro = this.get('audios_ro')||[];
                    audios_ro.push(val);
                    this.set('audios_ro', audios_ro);
                }
        });

        Object.defineProperty(Story.prototype, 'audios_en',
            {
                get: function () {
                    return this.get('audios_en');
                },
                set: function (val) {
                    var audios_en = this.get('audios_en')||[];
                    audios_en.push(val);
                    this.set('audios_en', audios_en);
                }
        });
        return Story;

    });
