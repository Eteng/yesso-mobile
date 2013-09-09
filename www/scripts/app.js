//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ajoslin.mobile-navigate'],function($compileProvider) {
    $compileProvider.directive('compile', function($compile) {
        // directive factory creates a link function
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        }
    });
});


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
          showBack:'@',
          onRefresh:'&',
          onBack:'&'
        },
        templateUrl: 'partial/header.html',
        transclude: false,
        replace:true,
        link:function($scope, elem, attrs){
            $scope.user = app.api.getLoginKey();
            if($scope.showBack == "true"){
                $scope.show_back= true;
            }
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

myModule.directive('renderQuestion',function(){
    return {
        restrict:'E',
        template:
            '<div>' +
            '<h2>{{question.question}}</h2>' +
            '</div>',
        scope:{
            question:"="
        },
        replace:true,
        link:function(scope, elem, attrs){

            scope.$watch("question",function(newvalue){

                if(newvalue.type == "text"){
                    text = '<input type="text" class="form-control" placeholder="' +
                        newvalue.question +
                        '">'
                    elem.append(angular.element(text))
                }else if(newvalue.type == "radio"){
                    var logs = []
                    angular.forEach(newvalue.options, function(value,key){
                        var tmpl = '<div class="radio">' +
                            '<label><input type="radio" name="optionsRadios" value="' +
                            value.key +
                            '">' +
                            value.value +
                            '</label></div>';
                        this.push(tmpl);
                    },logs)
                    elem.append(logs)
                 }

            },true)
        }
    }
})

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
        .when('/member', { templateUrl:'views/member.html'})
        .when('/two/:page/:quest', { templateUrl:'views/page1.html',transition: "modal"})
        .when('/search', {controller:'SearchCtrl', templateUrl:'views/search.html'})
        .when('/category', {controller:'CategoryCtrl', templateUrl:'views/category.html'})
        .when('/finder', {controller:'FinderCtrl', templateUrl:'views/finder.html'})
        .otherwise({redirectTo:'/login'});
});

myModule.controller('MainController', function ($scope, $location, $navigate, $rootScope, $routeParams) {
    $scope.$location = $location;
    $scope.$navigate = $navigate;

    var data ={
        sections:["SECTION 1: HOUSEHOLD SCHEDULE"],
        household:[{label:'PERSONAL INFORMATION',questions:[
            {question:'Full Name',type:'text', skip:false},
            {question:'Sex',type:'radio', skip:false, options:[{key:1,value:"Male"},{key:0,value:"Female"}]},
            {question:'Date of Birth', type:'text', skip:false},
            {question:'Does he/she have a birth registration certificate?', type:'radio', skip:false, options:[{key:1,value:"Yes"},{key:0,value:"No"}]}
        ]}]
    };

    angular.extend($scope,data);

    $scope.counter = 0;

    $scope.householdInfo = {
        counter:0,
        index:0
    }

    $scope.prevPage = function () {
        if ($scope.householdInfo.counter > 0) {
            $scope.householdInfo.counter--;
        }
    };
    $scope.nextPage = function () {
        if ($scope.householdInfo.counter < this.section().questions.length - 1) {
            $scope.householdInfo.counter++;
        }
    };
    $scope.canNext = function () {
        if ($scope.householdInfo.counter < this.section().questions.length - 1) {
            return true
        }else{
            return false;
        }
    };
    $scope.setPage = function (n) {
        $scope.householdInfo.counter = n;
    };
    $scope.section = function(){
        return this.household[0]
    }
    $scope.renderQuestion = function(question){
        console.log(question)
        if(question.type=="text"){
            return 'views/textoption.html'
        }
    }
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

    $scope.$navigate = $navigate;



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
