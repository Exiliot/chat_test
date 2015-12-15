(function() {
    'use strict';

    angular
        .module('app')
        .directive('chatInput', function(Socket, FileUploader, SweetAlert, Lightbox, $translate) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'app/components/main/chatInput.html',
                scope: {
                    channel: '='
                },
                link: function(scope) {
                    scope.message = '';

                    scope.sendMessage = function(message, uploadedImage) {
                        if (uploadedImage) {
                            Socket.emit('chat:messageSend', {
                                message: message ? message.split('\n').map(function(item) {
                                    return '<p>' + item + '</p>';
                                }).join('') : null,
                                image: uploadedImage,
                                channel: scope.channel._id
                            });
                            scope.message = null;
                            scope.uploadedImage = null;
                        } else {
                            SweetAlert.swal($translate.instant('main.warning'), $translate.instant('main.imageRequired'), 'warning');
                        }
                    };

                    scope.uploader.onAfterAddingAll = function(items) {
                        console.log('items', items);
                        scope.uploader.uploadAll();
                    };

                    scope.uploader.onCompleteAll = function() {
                        console.log('uploaded');
                        scope.uploader.clearQueue();
                    };

                    scope.uploader.onSuccessItem = function(item, response) {
                        console.log('onSuccessItem', item, response);
                        scope.uploadedImage = {
                            file: 'http://localhost:3002' + response.file,
                            preview: 'http://localhost:3002' + response.preview,
                            background: response.background
                        };
                    };

                    scope.uploader.onErrorItem = function(item, response, status, headers) {
                        console.error('onErrorItem', item, response, status, headers);
                    };

                    scope.uploader.onWhenAddingFileFailed = function(item) {
                        SweetAlert.swal($translate.instant('main.fail'), $translate.instant('main.imageFormatInvalid') + ' (' + $translate.instant('main.yourFile') + ': ' + item.name + ')', 'error');
                    };
                },
                controller: function($scope) {
                    var uploader = $scope.uploader = new FileUploader({
                        url: '/api/uploadImage'
                    });

                    uploader.filters.push({
                        name: 'imageFilter',
                        fn: function(item) {
                            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                            return '|jpg|png|jpeg|bmp|'.indexOf(type) !== -1;
                        }
                    });

                    $scope.imageFileInputActivate = function() {
                        if (!$scope.uploadedImage) {
                            angular.element('#imageFileInput').click();
                        }
                    };

                    $scope.openLightbox = function(image) {
                        Lightbox.openModal([{
                            url: image.file,
                            thumbUrl: image.preview
                        }], 0);
                    };
                }
            };
        });

})();
