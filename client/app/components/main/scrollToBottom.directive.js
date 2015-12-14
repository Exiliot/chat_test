(function() {
    'use strict';

    /*global $:true*/

    angular
        .module('app')
        .directive('scrollToBottom', function() {
            return {
                scope: {
                    scrollToBottom: '='
                },
                link: function(scope, element) {
                    scope.$watchCollection('scrollToBottom', function(newValue) {
                        if (newValue) {
                            $(element).scrollTop($(element)[0].scrollHeight);
                        }
                    });
                }
            };
        });

})();
