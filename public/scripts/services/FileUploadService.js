'use strict';
angular.module('nearPlaceApp').factory('File', function ($q) {

  return {

    upload: function (file) {
      console.log("Jpeg file:", file);
      var defer = $q.defer();

      var parseFile = new Parse.File('image.jpg', file);
      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },
    uploadAudio_ru: function (file) {
      console.log("Audio RU file:", file);
      var defer = $q.defer();

      var parseFile = new Parse.File('audio.mp3', file);
      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },
    uploadAudio_ro: function (file) {
          console.log("Audio RO file:", file);
          var defer = $q.defer();

          var parseFile = new Parse.File('audio.mp3', file);
          parseFile.save({
              success: function (savedFile) {
                  defer.resolve(savedFile);
              },
              error: function (error) {
                  defer.reject(error);
              }
          });

          return defer.promise;
    },
    uploadAudio_en: function (file) {
          console.log("Audio EN file:", file);
          var defer = $q.defer();

          var parseFile = new Parse.File('audio.mp3', file);
          parseFile.save({
              success: function (savedFile) {
                  defer.resolve(savedFile);
              },
              error: function (error) {
                  defer.reject(error);
              }
          });

          return defer.promise;
    }
  };
});
