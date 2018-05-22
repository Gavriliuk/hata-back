

var Image = require('../helpers/image');
var fs = require('fs');

function saveImage(base64) {
    var parseFile = new Parse.File('image.jpg', { base64: base64 });
    return parseFile.save();
}

var filePath = './files/';

function deleteFSFile(fileName) {
    if (fs.existsSync(filePath + fileName)) {
        fs.unlinkSync(filePath + fileName);
    }
}

Parse.Cloud.define('getUserStats', function (req, res) {

    var user = req.user;

    if (!user) {
        return res.error('Not Authorized');
    }

    var queryReview = new Parse.Query('Review');
    queryReview.equalTo('user', user);

    var queryPlace = new Parse.Query('Place');
    queryPlace.equalTo('user', user);

    var queryFavorite = new Parse.Query('Place');
    queryFavorite.equalTo('likes', user);

    var queryReview = queryReview.count({ useMasterKey: true });
    var queryPlace = queryPlace.count({ useMasterKey: true });
    var queryFavorite = queryFavorite.count({ useMasterKey: true });

    Parse.Promise.when(queryReview, queryPlace, queryFavorite)
        .then(function (reviews, places, favorites) {
            res.success({
                reviews: reviews,
                places: places,
                favorites: favorites
            });
        }, function (error) {
            res.error(error);
        });
});

Parse.Cloud.define('findUserByEmail', function (req, res) {

    var query = new Parse.Query(Parse.User);
    query.equalTo('email', req.params.email);
    query.first({ useMasterKey: true }).then(function (results) {
        res.success(results || {});
    }, function (error) {
        res.error(error.message);
    });
});

Parse.Cloud.define('isPlaceStarred', function (req, res) {

    var user = req.user;
    var placeId = req.params.placeId;

    if (!user) {
        return res.error('Not Authorized');
    }

    var objPlace = new Parse.Object('Place');
    objPlace.id = placeId;

    var query = new Parse.Query('Review');
    query.equalTo('place', objPlace);
    query.equalTo('user', user);

    query.first({ useMasterKey: true }).then(function (review) {
        var isStarred = review ? true : false;
        res.success(isStarred);
    }, function (error) {
        res.error(error.message);
    });
});

Parse.Cloud.define('isPlaceLiked', function (req, res) {

    var user = req.user;
    var placeId = req.params.placeId;

    if (!user) {
        return res.error('Not Authorized');
    }

    var query = new Parse.Query('Place');
    query.equalTo('likes', user);
    query.equalTo('objectId', placeId);

    query.first({ useMasterKey: true }).then(function (place) {
        var isLiked = place ? true : false;
        res.success(isLiked);
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.define('likePlace', function (req, res) {

    var user = req.user;
    var placeId = req.params.placeId;

    if (!user) {
        return res.error('Not Authorized');
    }

    var query = new Parse.Query('Place');
    var objPlace;
    var response = { action: null };

    query.get(placeId).then(function (place) {
        objPlace = place;
        var queryPlace = new Parse.Query('Place');
        queryPlace.equalTo('likes', user);
        queryPlace.equalTo('objectId', placeId)
        return queryPlace.find();
    }).then(function (result) {

        var relation = objPlace.relation('likes');

        if (result.length > 0) {
            objPlace.increment('likeCount', -1);
            relation.remove(user);
            response.action = 'unlike';
        } else {
            objPlace.increment('likeCount');
            relation.add(user);
            response.action = 'like';
        }

        return objPlace.save(null, { useMasterKey: true });
    }).then(function () {
        res.success(response);
    }, function (error) {
        res.error(error.message);
    });

});

Parse.Cloud.define('applyPromocode', function (req, res) {

    var promocode = req.params.promocode;
    var deviceId = req.params.deviceId;

    var objPromocode;
    var query = new Parse.Query('Promocode');
    query.equalTo('code', promocode);
    var response = { action: null };

    query.find().then(function (dbPromocode) {
        if (dbPromocode.length && !dbPromocode[0].get("isUsed") && dbPromocode[0].get("isApproved")) {
            objPromocode = dbPromocode[0];
            objPromocode.set("deviceId", deviceId);
            objPromocode.set("isUsed", true);
            response.action = dbPromocode[0].get("route");
            response.payload = objPromocode;
            return objPromocode.save(null, { useMasterKey: true });
        } else {
            response.action = '[]';
            response.error = 'Promocode Not Found!';
        }
    }).then(function () {
        res.success(response);
    }, function (error) {
        res.error(error.message);
    });
});

Parse.Cloud.define('validatePromocode', function (req, res) {

    var promocode = req.params.promocode;

    var objPromocode;
    var query = new Parse.Query('Promocode');
    query.equalTo('code', promocode);
    var response = { action: null };

    query.find().then(function (dbPromocode) {
        if (dbPromocode.length && !dbPromocode[0].get("isUsed") && dbPromocode[0].get("isApproved")) {
            response.action = dbPromocode[0].get("route");
            return response;
        } else {
            response.action = '[]';
            response.error = 'Promocode Not Valid!';
        }
    }).then(function () {
        res.success(response);
    }, function (error) {
        res.error(error.message);
    });
});

Parse.Cloud.define('getUsers', function (req, res) {

    var params = req.params;
    var user = req.user;

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', user);
    query.first().then(function (adminRole) {

        if (!adminRole) {
            return res.error('Not Authorized');
        }

        var query = new Parse.Query(Parse.User);

        if (params.filter != '') {
            query.contains('email', params.filter);
        }

        query.descending('createdAt');
        query.include('route');

        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);

        var queryUsers = query.find({ useMasterKey: true });
        var queryCount = query.count({ useMasterKey: true });

        return Parse.Promise.when(queryUsers, queryCount);
    }).then(function (users, total) {
        res.success({ users: users, total: total });
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.define('createUser', function (req, res) {

    var data = req.params;
    var user = req.user;

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', user);
    query.first().then(function (adminRole) {

        if (!adminRole) {
            return res.error('Not Authorized');
        } else {

            var user = new Parse.User();
            user.set('name', data.name);
            user.set('username', data.email);
            user.set('email', data.email);
            user.set('password', data.password);
            user.set('photo', data.photo);
            user.set('roleName', data.roleName);
            user.set('route', data.route);

            var acl = new Parse.ACL();
            acl.setPublicReadAccess(false);
            acl.setPublicWriteAccess(false);
            user.setACL(acl);

            user.signUp().then(function (objUser) {
                res.success(objUser);
            }, function (error) {
                res.error(error);
            });
        }
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.define('updateUser', function (req, res) {

    var data = req.params;
    var user = req.user;

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', user);
    query.first().then(function (adminRole) {

        if (!adminRole) {
            return res.error('Not Authorized');
        }

        var query = new Parse.Query(Parse.User);
        query.equalTo('objectId', data.id);
        return query.first({ useMasterKey: true });
    }).then(function (objUser) {

        objUser.set('name', data.name);
        objUser.set('username', data.email);
        objUser.set('email', data.email);
        objUser.set('photo', data.photo);
        objUser.set('route', data.route);



        if (!data.password) {
            objUser.set('password', data.password);
        }

        return objUser.save(null, { useMasterKey: true });
    }).then(function (success) {
        res.success(success);
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.define('destroyUser', function (req, res) {

    var params = req.params;
    var user = req.user;

    var query = new Parse.Query(Parse.Role);
    query.equalTo('name', 'Admin');
    query.equalTo('users', user);
    query.first().then(function (adminRole) {

        if (!adminRole) {
            return res.error('Not Authorized');
        }

        var query = new Parse.Query(Parse.User);
        query.equalTo('objectId', params.id);
        return query.first({ useMasterKey: true });
    }).then(function (objUser) {

        if (!objUser) {
            return res.error('User not found');
        }

        return objUser.destroy({ useMasterKey: true });
    }).then(function (success) {
        res.success(success);
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.define('saveFacebookPicture', function (req, res) {

    var user = req.user;

    if (!user) {
        res.error('Not Authorized');
        return;
    }

    user.fetch({ sessionToken: user.getSessionToken() }).then(function (objUser) {

        var authData = objUser.get('authData');

        if (!authData) {
            res.error('No auth data found');
            return;
        }

        var url = 'https://graph.facebook.com/' + authData.facebook.id + '/picture';
        return Parse.Cloud.httpRequest({ url: url, followRedirects: true, params: { type: 'large' } });

    }).then(function (httpResponse) {
        var buffer = httpResponse.buffer;
        var base64 = buffer.toString('base64');
        var parseFile = new Parse.File('image.jpg', { base64: base64 });
        return parseFile.save();
    }).then(function (savedFile) {
        user.set({ 'photo': savedFile });
        return user.save(null, { sessionToken: user.getSessionToken() });
    }).then(function (success) {
        res.success(success);
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.beforeSave('Route', function (req, res) {

    var route = req.object;
    var user = req.user;

    if (!user) {
        return res.error('Not Authorized');
    }

    if (!route.get('image')) {
        return res.error('The field Image is required.');
    }

    if (!route.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        route.setACL(acl);
    }

    if ((route.dirty('title_ru') && route.get('title_ru')) || (route.dirty('title_ro') && route.get('title_ro')) || (route.dirty('title_en') && route.get('title_en'))) {
        route.set('canonical', (route.get('title_ru') + route.get('title_ro') + route.get('title_en')).toLowerCase());
    }

    if (!route.dirty('image')) {
        return res.success();
    }

    var imageUrl = route.get('image').url();

    Image.resize(imageUrl, 810, 540).then(function (base64) {
        return saveImage(base64);
    }).then(function (savedFile) {
        route.set('image', savedFile);
        return Image.resize(imageUrl, 160, 160);
    }).then(function (base64) {
        return saveImage(base64);
    }).then(function (savedFile) {
        route.set('imageThumb', savedFile);
        res.success();
    }, function (error) {
        res.error(error.message);
    });

});



Parse.Cloud.beforeSave('Category', function (req, res) {
    var category = req.object;
    var user = req.user;

    if (!user) {
        return res.error('Not Authorized');
    }


    if (!category.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        category.setACL(acl);
    }

    if ((category.dirty('title_ru') && category.get('title_ru')) || (category.dirty('title_ro') && category.get('title_ro')) || (category.dirty('title_en') && category.get('title_en'))) {
        category.set('canonical', (category.get('title_ru') + category.get('title_ro') + category.get('title_en')).toLowerCase());
    }
    return res.success();
});






Parse.Cloud.beforeSave('Story', function (req, res) {
    var story = req.object;
    var user = req.user;

    if (!user) {
        return res.error('Not Authorized');
    }

    // if (!story.get('audios_ru') || !story.get('audios_ro') || !story.get('audios_en')) {
    //     return res.error('The field Audios is required.');
    // }

    if (!story.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        story.setACL(acl);
    }

    if (story.dirty('name') && story.get('name')) {
        story.set('canonical', story.get('name').toLowerCase());
    }
    return res.success();
});

Parse.Cloud.beforeSave('Place', function (req, res) {

    var place = req.object;
    var user = req.user;

    if (req.master) {
        return res.success();
    }

    if (!user) {
        return res.error('Not Authorized');
    }

    if (!place.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        acl.setWriteAccess(user, true);
        place.setACL(acl);
    }

    if (!place.get('images')) {
        return res.error('Upload the first image');
    }
    // if (place.dirty('deletedImages') && place.get('deletedImages')) {
    // ----------iteracia po deletedImages--------
    //       for (var i = 0; i < place.get('deletedImages').length; i++){
    //           var deletedImage = place.get('deletedImages')[i];
    //           console.log("deletedImage: ",deletedImage)
    //           deleteFSFile(deletedImage.image.name());
    //           // deleteFSFile(deletedImage.image.name());
    //           // deleteFSFile(place.get('original_images')[deletedImage.index].name());
    //           place.set('deletedImages', []);
    //       }

    // }

    if ((place.dirty('title_ru') && place.get('title_ru')) || (place.dirty('title_ro') && place.get('title_ro')) || (place.dirty('title_en') && place.get('title_en'))) {
        place.set('canonical', (place.get('title_ru') + place.get('title_ro') + place.get('title_en')).toLowerCase());
    }

    if (!place.dirty('images')) {
        return res.success();
    }

    var promises = [];
    var resizedImages = [];

    if (place.dirty('images')) {

        for (var i = 0; i < place.get('images').length; i++) {
            var url = place.get('images')[i].url();
            // deleteFSFile(place.get('images')[i].name());
            // var promise = Image.resize(url, 800, 510).then(function (base64) {
            //     return saveImage(base64);
            // }).then(function (savedFile) {
            //     resizedImages.push(savedFile);
            // });

            // promises.push(promise);
            if (i === 0) {
                var promiseThumb = Image.resize(url, 160, 160).then(function (base64) {
                    return saveImage(base64);
                }).then(function (savedFile) {
                    place.set('imageThumb', savedFile);
                });
                promises.push(promiseThumb);
            }
        }
    }

    Parse.Promise.when(promises).then(function (result) {
        place.set('original_images', place.get('images'));
        // place.set('images', resizedImages);
        res.success();
    }, function (error) {
        res.error(error);
    });
});
Parse.Cloud.beforeSave('Promocode', function (req, res) {
    var promocode = req.object;
    var user = req.user;

    if (req.master) {
        return res.success();
    }
    if (!user) {
        return res.error('Not Authorized');
    }
    if (!promocode.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        acl.setWriteAccess(user, true);
        promocode.setACL(acl);
    }
    if (promocode.dirty('title') && promocode.get('title')) {
        promocode.set('canonical', promocode.get('title').toLowerCase());
    }
    res.success();
});

Parse.Cloud.beforeSave('Review', function (req, res) {

    var review = req.object;
    var user = req.user;

    if (req.master) {
        return res.success();
    }

    if (!user) {
        return res.error('Not Authorized');
    }

    if (!review.existed()) {
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setRoleWriteAccess('Admin', true);
        acl.setWriteAccess(user, true);
        review.setACL(acl);
        review.set('isInappropriate', false);
        review.set('user', user);
    }

    if (review.existed() && review.dirty('isInappropriate')) {
        return res.success();
    }

    var query = new Parse.Query('Review');
    query.equalTo('user', user);
    query.equalTo('place', review.get('place'));

    query.find().then(function (obj) {

        if (obj.length > 0) {
            return res.error('You already write a review for this place');
        } else if (review.get('rating') < 1) {
            return res.error('You cannot give less than one star');
        } else if (review.get('rating') > 5) {
            return res.error('You cannot give more than five stars');
        } else {

            var query = new Parse.Query('UserData');
            query.equalTo('user', user);
            return query.first();
        }
    }).then(function (userData) {

        if (userData) {
            review.set('userData', userData);
            res.success();
        } else {
            res.error('UserData not found');
        }
    }, function (error) {
        res.error(error.message);
    });

    query.find({
        success: function (res1) {

        },
        error: function (obj, error) {
            res.error(error);
        }
    });
});

Parse.Cloud.afterSave('Review', function (req) {

    var review = req.object;
    var rating = review.get('rating');
    var placeId = review.get('place').id;

    var query = new Parse.Query('Place');

    query.get(placeId).then(function (place) {

        var currentTotalRating = place.get('ratingTotal') || 0;

        place.increment('ratingCount');
        place.set('ratingTotal', currentTotalRating + rating);
        place.save(null, { useMasterKey: true });

    });
});

Parse.Cloud.beforeSave(Parse.User, function (req, res) {

    var user = req.object;

    if (user.existed() && user.dirty('roleName') && !req.master) {
        return res.error('Role cannot be changed');
    }

    if (!user.get('photo') || !user.dirty('photo')) {
        return res.success();
    }

    var imageUrl = user.get('photo').url();

    Image.resize(imageUrl, 160, 160).then(function (base64) {
        return saveImage(base64);
    }).then(function (savedFile) {
        user.set('photo', savedFile);
        res.success();
    }, function (error) {
        res.error(error);
    });
});

Parse.Cloud.afterSave(Parse.User, function (req) {

    var user = req.object;
    var userRequesting = req.user;

    var queryUserData = new Parse.Query('UserData');
    queryUserData.equalTo('user', user);
    queryUserData.first().then(function (userData) {

        if (userData) {
            userData.set('name', user.get('name'));
            userData.set('photo', user.get('photo'));
            userData.set('route', user.get('route'));
        } else {

            var aclUserData = new Parse.ACL();
            aclUserData.setPublicReadAccess(true);
            aclUserData.setWriteAccess(user, true);

            var userData = new Parse.Object('UserData', {
                user: user,
                ACL: aclUserData,
                name: user.get('name'),
                photo: user.get('photo'),
                route: user.get('route')

            });
        }
        userData.save(null, { useMasterKey: true });
    });

    if (!user.existed()) {

        var query = new Parse.Query(Parse.Role);
        query.equalTo('name', 'Admin');
        query.equalTo('users', userRequesting);
        query.first({ useMasterKey: true }).then(function (isAdmin) {

            if (!isAdmin && user.get('roleName') === 'Admin') {
                return Parse.Promise.error(new Parse.Error(1, 'Not Authorized'));
            }

            var roleName = user.get('roleName') || 'User';

            var innerQuery = new Parse.Query(Parse.Role);
            innerQuery.equalTo('name', roleName);
            return innerQuery.first({ useMasterKey: true });
        }).then(function (role) {

            if (!role) {
                return Parse.Promise.error(new Parse.Error(1, 'Role not found'));
            }

            role.getUsers().add(user);
            return role.save(null, { useMasterKey: true });
        }).then(function () {
            console.log(success);
        }, function (error) {
            console.error('Got an error ' + error.code + ' : ' + error.message);
        })
    }
});
