//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ajoslin.mobile-navigate','ngCookies']);

myModule.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

myModule.directive('myHeadMat',function($cookieStore, $window){
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
        link:function(scope, elem, attrs){
            scope.user = $cookieStore.get('user');
            scope.logout = function(e){
                e.preventDefault();
                $cookieStore.remove('user')
                $window.location.href = "index.html";
            }

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
            var boot_input = function(type,place){
                return '<input type="' +
                    type +
                    '" class="form-control" placeholder="' +
                    place +
                    '">'
            };
            var boot_radio = function(key,value){
                return '<div class="radio">' +
                    '<label><input type="radio" name="optionsRadios" value="' +
                    key +
                    '">' +
                    value +
                    '</label></div>';
            };
            var boot_date = function(){
                return '<div class="input-group date datepicker" data-date="" data-date-format="dd-mm-yyyy">'+
                    '<input class="span2" size="16" type="text" value="12-02-2012" readonly/>'+
                    '<span class="add-on"><i class="icon-th"></i></span>'+
                '</div>'
            };

            scope.$watch("question",function(newvalue){

                if(newvalue.type == "text"){
                    elem.append(angular.element(boot_input(newvalue.type,newvalue.question)))
                }else if(newvalue.type == "radio"){
                    var logs = []
                    angular.forEach(newvalue.options, function(value,key){
                        this.push(boot_radio(value.key,value.label));
                    },logs)
                    elem.append(logs)
                 }else if(newvalue.type == "form"){
                    var formlog = angular.element('<form role="form"></form>');
                    angular.forEach(newvalue.options, function(value,key){
                        this.append('<div class="form-group">'+boot_input(value.type,value.label)+'</div>');
                    },formlog)
                    elem.append(formlog);
                }else if(newvalue.type=="date"){
                    elem.append(angular.element(boot_input(newvalue.type,newvalue.question)))
                }else{
                    elem.append(angular.element(boot_input(newvalue.type,newvalue.question)))
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
        .when('/home', {templateUrl:'views/home.html',transition: "modal"})
        .when('/new', {templateUrl:'views/new.html',transition: "modal"})
        .when('/member', { templateUrl:'views/member.html',transition: "modal"})
        .when('/two/:page/:quest', { templateUrl:'views/page1.html',transition: "modal"})
        .when('/search', {templateUrl:'views/search.html'})
        .otherwise({redirectTo:'/home'});
});

myModule.controller('MainController', function ($scope, $location, $cookieStore, $navigate, $rootScope, $routeParams) {
    $scope.$location = $location;
    $scope.$navigate = $navigate;

    var data ={
        sections:["SECTION 1: HOUSEHOLD SCHEDULE"],
        household:[
            {label:'PERSONAL INFORMATION',questions:[
                {question:'Title',type:'radio', skip:false, options:[{key:1,label:"Mr"},{key:0,label:"Miss"},{key:0,label:"Mrs"}]},
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'surname',label:'Surname'}, {type:'text',key:'firstname',label:'First Name'},
                         {type:'text',key:'middlename',label:'Middle Name'}
                    ]},
                {question:'Sex',type:'radio', skip:false, options:[{key:1,label:"Male"},{key:0,label:"Female"}]},
                {question:'Height(cm)', type:'number', skip:false},
                {question:'Date of Birth', type:'date', skip:false},
                {question:'Does he/she have a birth registration certificate?', type:'radio', skip:false,
                    options:[{key:1,label:"Yes"},{key:0,label:"No"}]},
                {question:'National ID Card Number', type:'text', skip:false},
                {question:'Marital Status',type:'radio',
                    options:[{key:0,label:"Single"},{key:1,label:"Married"},{key:2,label:"Divorced"},
                             {key:3,label:"Widowed"},{key:4,label:"separated"}]},
                {question:'Religion',type:'radio', options:[{key:0,label:"Christian"},{key:1,label:"Islam"},{key:2,label:"Other"}]}
            ]},
            {label:"BIO DATA", questions:[
                {question:'Blood Group',type:'radio', options:[{key:0,label:"A"},{key:1,label:"B"},{key:2,label:"AB"},{key:3,label:"O"}]},
                {question:'Rhesus',type:'radio', skip:false, options:[{key:0,label:"Plus"},{key:1,label:"Minus"}]}
            ]},
            {label:"ADDRESS", questions:[
                {question:'Residential Address', type:'text', skip:false},
                {question:'Contact Address', type:'text', skip:false}
            ]},
            {label:"EDUCATION AND PROFESSION", questions:[
                {question:'Education Level',type:'radio', options:[{key:0,label:"Nursery"},{key:1,label:"Primary"},{key:2,label:"JSS1"},{key:3,label:"SS3"}]},
                {question:'Profession',type:'radio', skip:false, options:[{key:0,label:"Teacher"},{key:1,label:"Mechanic"}]}
            ]},
            {label:"NEXT OF KIN", questions:[
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'surname',label:'Surname'}, {type:'text',key:'firstname',label:'First Name'},
                        {type:'text',key:'middlename',label:'Middle Name'}
                    ]},
                {question:'Contact Address', type:'text', skip:false},
                {question:'Relationship', type:'text', skip:false},
                {question:'Telephone number', type:'tel', skip:false}
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
        return this.household[this.householdInfo.index]
    }
    $scope.returnBack = function(){
        this.householdInfo.counter=0;
        this.householdInfo.index =0;
        $location.path("/member");
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
    //new
    $scope.regions = [
        {id:1,name:'Calabar West',district:["Federal hosuing","state housing"]},
        {id:2,name:'Calabar South',district:["Federal high way","state high way","akabiyo"]}
    ];
    $scope.selectedItem = $scope.regions[0];


});
