//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ajoslin.mobile-navigate']);

myModule.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});


myModule.directive('myHeadMat',function(){
    return {
        restrict: 'E',
        scope:{
          title:'@',
          showRefresh:'@',
          onRefresh:'&',
          onBack:'&'
        },
        templateUrl: 'partial/header.html',
        transclude: false,
        replace:true,
        link:function($scope, elem, attrs){
            $scope.user = app.api.getLoginKey();
            //$scope.$safeApply();
           /* $scope.showRefresh = false;
            if(typeof ($scope.onRefresh)== 'function'){
                $scope.showRefresh = true;
            }*/
            //alert($scope.showRefresh);
            //console.log($scope.onRefresh);
            //console.log("recognised the head-mat")
        }
    };
});

myModule.directive('dealPager',function(){
    return {
        restrict:'E',
        template:
            '<ul class="pager">'+
            '<li ng-class="{disabled: currentPage == 0}"><a href ng-click="prevPage()">Previous</a></li>'+
            '<li><span>{{2}}/4</span></li>'+
            '<li ng-class="{disabled: currentPage == pz.length - 1}"><a ng-click="nextPage()">Next</a></li>'+
            '</ul>',
        scope:{

        },
        replace:true,
        link:function($scope, elem, attrs){

        }
    }
})

myModule.directive('ngTap',function(){
   var isTouchDevice = !!("ontouchstart" in window);
    return function(scope, elem, attrs){
        if(isTouchDevice){
            var tapping = false;
            elem.bind("touchstart",function(){tapping = true;});
            elem.bind("touchmove",function(){tapping = false;});
            elem.bind("touchend",function(){
                tapping && scope.$apply(attrs.ngTap);}
            );
        }else{
            elem.bind("click",function(){
                scope.$apply(attrs.ngTap);
            })
        }
    }

})
function defaultPostData(){
    return {
        apiKey:app.api.getApiKey(),
        loginKey:app.api.getLoginKey()
    };
}
function defaultError(e){
    alert("An error occurred please try later!");
}

myModule.config(function($routeProvider) {
     $routeProvider
        .when('/login',{controller:'LoginController', templateUrl:'views/login.html' })
        .when('/home', {controller:'HomeCtrl', templateUrl:'views/home.html'})
        .when('/deal/:dealId', {controller:'DealInfoCtrl', templateUrl:'views/deal.html'})
        .when('/account/:accountId', { controller:'AccountCtrl', templateUrl:'views/account.html' })
        .when('/new', {controller:'NewCtrl', templateUrl:'views/new.html'})
         .when('/two', { templateUrl:'views/page1.html',transition: "modal"})
        .when('/search', {controller:'SearchCtrl', templateUrl:'views/search.html'})
        .when('/category', {controller:'CategoryCtrl', templateUrl:'views/category.html'})
        .when('/finder', {controller:'FinderCtrl', templateUrl:'views/finder.html'})
        .otherwise({redirectTo:'/login'});
});

myModule.controller('MainController', function ($scope, $location, $rootScope) {
    $scope.$location = $location;

});

myModule.controller('LoginController', function ($scope, $routeParams, $location, $rootScope){
   $scope.tron = {
       "apiKey":app.api.getApiKey(),
       "username":"",
       "password":""
   };
   $scope.guest = function(){
       this.tron.username = 'guest';
       this.tron.password ='guest';
       this.login();
   }
    $scope.login = function() {
        /**app.api.login($scope.tron).done(function(response){
            if(response.success==true){
                app.api.setLoginKey(response.loginKey);
                $location.path("/home");
            }else{
                alert(response.error_message);
            }
            $scope.$safeApply();
        })**/
        if(this.tron.username = "a" && this.tron.password == "a"){
            app.api.setLoginKey(
                {
                    displayName:"Eteng omini",
                    url:"wikid.jpg"
                })
            $location.path("/home");
        }else{
            this.error_message = "Username / password is incorrect, please try again!"
            alert(this.error_message);
        }

    }

    $scope.loginSubmit = function(e){
        e.preventDefault();
        this.login();
        return false;
    }
});

myModule.controller('HomeCtrl', function ($scope, $http,$location, $filter) {
    $scope.user = app.api.getLoginKey();
    $scope.loadFeaturedCat = function(){
        /*app.api.featuredCategories().done(function(response){
            if(response.success){
                $scope.deals = response;
            }else{
                alert(response.error_message);
            }
            $scope.$safeApply();
        });*/
    }

    $scope.loadFeaturedCat();

    $scope.refreshData = function(){
        this.loadFeaturedCat();
    }
});

myModule.controller('AccountCtrl', function ($scope, $http, $routeParams){
   
});
myModule.controller('DealInfoCtrl', function ($scope, $http, $routeParams){

    $scope.getDeal = function(deal_id) {

    };
    $scope.convertDealDate = function(form){
        return form.toString().split("/").reverse().join("/");
    }
    $scope.loadDealInfo = function() {
        app.api.deal($routeParams.dealId).done(function(data){
            if(data.success){
                $scope.deal = data.deal;
            }else{
                alert(data.error_message);
            }
            $scope.$safeApply();
        })
    }
    $scope.loadDealInfo();
});
myModule.controller('NewCtrl', function ($scope, $http, $routeParams, $location,$navigate){
    $scope.regions = [
        {id:1,name:'Calabar West',district:["Federal hosuing","state housing"]},
        {id:2,name:'Calabar South',district:["Federal high way","state high way","akabiyo"]}
    ];
    $scope.selectedItem = $scope.regions[0];

    $scope.returnBack = function(){
        $location.path("/home");
    }
});
myModule.controller('SearchCtrl', function ($scope, $http, $location, $routeParams){

    $scope.$location = $location;

    $scope.initialize = function (){

    }

    $scope.search = function(){
        var svr_url = app.api.route("deal/search")
    }
});
myModule.controller('CategoryCtrl', function ($scope, $http, $routeParams ,$location){

    function fetchCategories() {
        app.api.post("categories/").done(function(data){
            $scope.categories = data.categories
        });
        /*ServiceProvider.post(app.api.route(''), defaultPostData()).done(function (data) {
            if (data.success) {
                $scope.categories = data.categories
            } else {
                alert(data.error_message);
            }
        });*/
    }

    fetchCategories();
    
    $scope.refreshData = function(){
        fetchCategories();
    }
    $scope.returnBack = function(){
        $location.path("/home");
    }

   
});
myModule.controller('FinderCtrl', function ($scope, $http, $routeParams){
   
});

function PageController($scope) {

    $scope.pageSize = 3;

    $scope.currentPage = 0;

    $scope.isPagable = function(){
        if( 0 == this.numberOfPages()-1)
            return false;
        else
            return true;
    }
    $scope.numberOfPages = function(){
        return Math.ceil(this.$parent.cate.deals.length/this.pageSize);
    }
    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    $scope.nextPage = function () {
        if ($scope.currentPage < this.numberOfPages()) {
            $scope.currentPage++;
        }
    };
}
