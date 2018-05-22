'use strict';
angular.module('nearPlaceApp').factory('File', function ($q) {

  return {
    upload: function (file) {
      var defer = $q.defer();
      // var lastNameImg = file.name.slice(0,4)+'_'+'image.jpg';
      // console.log('lastNameImg',);
      // var imgName = 'image.jpg';
      // var parseFile = new Parse.File(lastNameImg, file);
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

    uploadAudio: function (file) {
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
