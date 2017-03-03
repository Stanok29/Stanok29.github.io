define(['imgcache', 'dom7'], function (imgcache, $$) {
    'use strict';

    var init = function (cb)
    {
        imgcache.options.debug = false;

        imgcache.options.chromeQuota = 50 * 1024 * 1024;

        imgcache.init(function () {

            cb && cb();

        }, function () {
            console.log('ImgCache init: error! Check the log for errors');
        });
    };

    var useRightSinleImage = function (target) {
        var src = target.attr('data-pre-src');
        if (!src)
            return;

        var setSrc = function (newSrc)
        {
            if (newSrc)
                return target.attr('src', newSrc);

            imgcache.getCachedFileURL(src, function (imgSrc, res) {
                target.attr('src', res);
            });
        };

        if (!src.match(/^http/))
            return setSrc(src);

        imgcache.isCached(src, function (path, success) {
            if (success) {
                setSrc();
            } else {
                imgcache.cacheFile(src, function (res) {
                    setSrc();
                });
            }
        });
    }

    var useRightImage = function (target)
    {
        if (target.length && target.length > 1) {
            target.each(function(i, el){
                useRightSinleImage($$(el));
            });
            
        }else{
            useRightSinleImage(target);
        }


    }

    var getRightImgSrc = function (src, callback, error)
    {
        imgcache.isCashed(src, function (path, success)
        {
            var cachedCallback = imgcache.getCachedFileURL(src, function (res) {
                callback && callback(res);
            }, function (err) {
                console.log('fail to load image');
                error && error();
            });

            if (success)
            {
                cachedCallback();
            }
            else
            {
                imgcache.cacheFile(src, function (res) {
                    cachedCallback();
                }, function (err) {
                    error && error();
                });
            }
        });
    };

    return {
        getRightImgSrc: getRightImgSrc,
        init: init,
        useRightImage: useRightImage
    };

});


