//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ajoslin.mobile-navigate','ngCookies']);


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
            $scope.user = $cookies.user;
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

myModule.config(function($routeProvider) {
     $routeProvider
        .when('/home', {templateUrl:'views/home.html'})
        .when('/new', {templateUrl:'views/new.html'})
        .when('/member', { templateUrl:'views/member.html'})
        .when('/two/:page/:quest', { templateUrl:'views/page1.html',transition: "modal"})
        .when('/search', {templateUrl:'views/search.html'})
        .otherwise({redirectTo:'/home'});
});

myModule.controller('MainController', function ($scope, $location, $navigate, $rootScope, $routeParams) {
    $scope.$location = $location;
    $scope.$navigate = $navigate;

    var data ={
        sections:["SECTION 1: HOUSEHOLD SCHEDULE"],
        household:[{label:'PERSONAL INFORMATION',questions:[
            {question:'Names',type:'text', skip:false},
            {question:'Sex',type:'radio', skip:false, options:[{key:1,value:"Male"},{key:0,value:"Female"}]},
            {question:'Date of Birth', type:'text', skip:false},
            {question:'Date of ssdd', type:'text', skip:false},
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
    //login side
    $scope.tron = {
        "username":"",
        "password":""
    };
    $scope.guest = function(){
        this.tron.username = 'guest';
        this.tron.password ='guest';
        this.login();
    }
    $scope.logout = function(e){
        $location.href = "index.html"
    }
    //new
    $scope.regions = [
        {id:1,name:'Calabar West',district:["Federal hosuing","state housing"]},
        {id:2,name:'Calabar South',district:["Federal high way","state high way","akabiyo"]}
    ];
    $scope.selectedItem = $scope.regions[0];


});
