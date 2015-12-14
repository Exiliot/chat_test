(function() {
    'use strict';

    angular
        .module('app')
        .filter('htmlToPlainText', function() {
            var allowed = '<b><i><a><u><pre><p><blockquote><strike><ul><li><ol><br><img><font>';

            return function(text) {
                //return String(text).replace(/<[^>]+>/gm, '');
                var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
                return text.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
                    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                });
            };
        });

})();
