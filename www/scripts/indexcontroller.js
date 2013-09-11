//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ngCookies']);

myModule.directive('ngTap', function() {
    var isTouchDevice = !!("ontouchstart" in window);
    return function(scope, elm, attrs) {
        if (isTouchDevice) {
            var tapping = false;
            elm.bind('touchstart', function() { tapping = true; });
            elm.bind('touchmove', function() { tapping = false; });
            elm.bind('touchend', function() {
                tapping && scope.$apply(attrs.ngTap);
            });
        } else {
            elm.bind('click', function() {
                scope.$apply(attrs.ngTap);
            });
        }
    };
});

myModule.controller('MainCtr', function ($scope, $location, $rootScope, $routeParams, $cookieStore, $window) {
    $scope.tron = {
        "username":"",
        "password":""
    };
    $scope.guest = function(){
        this.tron.username = 'guest';
        this.tron.password ='guest';
        this.login();
    }
    $scope.needLogin = function(){
        if($cookieStore.get('user')){
            $window.location.href ="dashboard.html"
        }
    }
    $scope.needLogin();
    $scope.login = function() {
        if(this.tron.username = "a" && this.tron.password == "a"){
            $cookieStore.put('user',{
                    displayName:"Eteng",
                    url:"wikid.jpg"
            })
            $window.location.href ="dashboard.html"
            //location.href ="dashboard.html"
        }else{
            this.error_message = "Username / password is incorrect, please try again!"
            alert(this.error_message);
        }

    }
});

