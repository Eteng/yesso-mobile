//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ngResource']);

myModule.config(function($routeProvider) {
    $routeProvider
        .when('/login', {templateUrl:'views/login.html',transition: "modal"})
        .when('/first_login', {templateUrl:'views/firstlogin.html',transition: "modal"})
        .otherwise({redirectTo:'/login'});
});
//services...
myModule.factory("Agent",function($resource){
    return $resource("http://yesso.smartappng.com/console/public/api/v1/agent/:agentid",{},{
        query:{method:'GET', isArray:false},
        auth:{method:'POST', isArray:false}
    })
    /*return $resource("http://localhost/apps/yesso-unified/public/api/v1/agent/:agentid",{},{
        query:{method:'GET', isArray:false},
        auth:{method:'POST', isArray:false}
    })*/
});

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

myModule.controller('MainCtr', function ($scope, $location, $rootScope, $routeParams, $window, Agent) {

    $scope.loadAgentInfo = function(){
        if(angular.isUndefined(localStorage.user)){
            $location.path("/first_login");
            return
        }
    };

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
        if(!angular.isUndefined(localStorage.user)){
            $window.location.href ="dashboard.html"
        }
    }
    //$scope.needLogin();

    $scope.activate = function() {
        var agent = Agent.query(this.tron,function(resp) {
            if(resp.error){
                this.error_message = "Username / password is incorrect, please try again!"
                alert(this.error_message);
            }else{
                localStorage.user = angular.toJson(resp.agents[0]);
                //downloading image with progress
                $location.path("/login");
            }

        },function(err){
            alert(err.data.error.message);
        })
    }
    $scope.login = function() {
        var agent = angular.fromJson(localStorage.user);
        if(this.tron.username = agent.username && this.tron.password == agent.password){
            $window.location.href ="dashboard.html"
        }else{
            this.error_message = "Username / password is incorrect, please try again!"
            alert(this.error_message);
        }

    }
});

