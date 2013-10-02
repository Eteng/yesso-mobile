//ngResource
var myModule = angular.module('assetsApp',['Scope.safeApply','ajoslin.mobile-navigate','ngResource']);

myModule.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

myModule.factory("Enrollment",function($resource){
    return $resource("http://yesso.smartappng.com/console/public/api/v1/enrollment/:enrollment_id",{},{
        store:{method:'PUT', isArray:false}
    })
    /*return $resource("http://localhost/apps/yesso-unified/public/api/v1/enrollment/:enrollment_id",{},{
        store:{method:'PUT', isArray:false}
    })*/
});


myModule.directive('myHeadMat',function($window, $rootScope){
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

            scope.user = angular.fromJson(localStorage.user);
            scope.logout = function(e){
                e.preventDefault();
                localStorage.removeItem('newhouse');
                $window.location.href = "index.html";
            }
            scope.newHouseHold = function(e){
                if(!angular.isUndefined(localStorage.newhouse)){
                    navigator.notification.confirm('There is an ongoing enrolment do you want to continue',function(button){
                        if(button == 2){
                            localStorage.removeItem("newhouse");
                            localStorage.removeItem("newmember");
                            $rootScope.enrollment = {};
                        }
                    },"New Enrolment",["continue","discard"])
                }
            }

        }
    };
});

myModule.directive('renderQuestion',function($compile,$rootScope){
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

            var bool_check = function(type,place,id){
                return '<div class="list-group" >'+
                    '<label class="list-group-item">'+
                    '<input name="model_' +
                    id+'"' +
                    'type="checkbox" ' +
                    'ng-model="enrollment.model_'+
                    id+
                    '">  '+
                    place+
                        '</label>' +
                    '</div>'
            }
            var boot_input = function(type,place,id){
                if(type=="checkbox"){
                    return bool_check(type,place,id);
                }else
                return '<input type="' +
                    type +
                    '" class="form-control" placeholder="' +
                    place +
                    '" ng-model="enrollment.model_'+
                    id+
                    '">'
            };
            var boot_radio = function(key,value,id){
                return '<div class="radio">' +
                    '<label><input type="radio" ng-model="enrollment.model_' +
                    id+
                    '" name="optionsRadios" value="' +
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


            scope.$watch("question",function(newvalue,oldvalue,scope){

                if(newvalue.type == "radio"){
                    var logs = []
                    angular.forEach(newvalue.options, function(value,key){
                        this.push(boot_radio(value.key,value.label,newvalue.qid));
                    },logs)
                    elem.append(logs)
                 }else if(newvalue.type == "form"){
                    var formlog = angular.element('<form role="form"></form>');
                    angular.forEach(newvalue.options, function(value,key){
                        this.append('<div class="form-group">'+boot_input(value.type,value.label,value.key)+'</div>');
                    },formlog)
                    elem.append(formlog);
                }else if(newvalue.type=="date"){
                    elem.append(angular.element(boot_input(newvalue.type,newvalue.question,newvalue.qid)))
                }else{
                    elem.append(angular.element(boot_input(newvalue.type,newvalue.question,newvalue.qid)))
                }
                $compile(elem)($rootScope);

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
        .when('/member/:house', {templateUrl:'views/member.html',transition: "modal"})
        .when('/house', { templateUrl:'views/house.html',transition: "modal"})
        .when('/two/:page/:quest', { templateUrl:'views/page1.html',transition: "modal"})
        .when('/f/:page/:quest', { templateUrl:'views/page2.html',transition: "modal"})
        .when('/search', {templateUrl:'views/search.html',transition: "modal"})
        .when('/viewhouse/:view_id', {templateUrl:'views/view.html',transition: "modal"})
        .otherwise({redirectTo:'/home'});
});

myModule.controller('MainController', function ($scope, $location,$navigate, $rootScope, $routeParams, $window, Enrollment) {

    $scope.$location = $location;

    $scope.$navigate = $navigate;

    var data ={
        house_members:[
            {label:"REGISTRATION DETAILS", questions:[
                {qid:"lga_registration", question:'LGA of Registration', type:'text', skip:false},
                {qid:"ward_registration", question:'Ward of Registration', type:'text', skip:false},
                {qid:46, question:'Venue of Registration', type:'text', skip:false},
                {qid:"date_registration", question:'Date of Registration', type:'date', skip:false}
            ]},
            {label:'PERSONAL INFORMATION',questions:[
                {qid:"title", question:'Title',type:'radio', skip:false, options:[{key:0,label:"Mr"},{key:1,label:"Miss"},{key:2,label:"Mrs"}]},
                {question:'Names',type:'form', skip:false,
                    options:[{qid:2,type:'text',key:'surname',label:'Surname'}, {qid:3,type:'text',key:'first_name',label:'First Name'},
                        {qid:4,type:'text',key:'middle_name',label:'Middle Name'}
                    ]},
                {qid:"gender", question:'Sex',type:'radio', skip:false, options:[{key:1,label:"Male"},{key:0,label:"Female"}]},
                {qid:"height", question:'Height(cm)', type:'number', skip:false},
                {qid:"date_of_birth", question:'Date of Birth', type:'date', skip:false},
                {qid:8, question:'Does he/she have a birth registration certificate?', type:'radio', skip:false,
                    options:[{key:1,label:"Yes"},{key:0,label:"No"}]},
                {qid:"nat_id_card_number", question:'National ID Card Number', type:'text', skip:false},
                {qid:10, question:'Marital Status',type:'radio',
                    options:[{key:0,label:"Single"},{key:1,label:"Married"},{key:2,label:"Divorced"},
                        {key:3,label:"Widowed"},{key:4,label:"separated"}]},
                {qid:"religion", question:'Religion',type:'radio', options:[{key:0,label:"Christian"},{key:1,label:"Islam"},{key:2,label:"Other"}]}
            ]},
            {label:"BIO DATA", questions:[
                {qid:"blood_group", question:'Blood Group',type:'radio', options:[{key:0,label:"A"},{key:1,label:"B"},{key:2,label:"AB"},{key:3,label:"O"}]},
                {qid:"rhesus", question:'Rhesus',type:'radio', skip:false, options:[{key:0,label:"Plus"},{key:1,label:"Minus"}]}
            ]},
            {label:"RESIDENTIAL INFORMATION", questions:[
                {qid:"residential_add", question:'Residential Address', type:'text', skip:false},
                {qid:"residential_city", question:'City or Village of Residence', type:'text', skip:false},
                {qid:"residential_ward", question:'Ward of Residence', type:'text', skip:false},
                {qid:23, question:'LGA of Residence', type:'text', skip:false}
            ]},
            {label:"CONTACT INFORMATION", questions:[
                {qid:"contact_add", question:'Contact Address', type:'text', skip:false},
                {qid:"contact_city", question:'City or Village of Contact', type:'text', skip:false},
                {qid:"contact_ward", question:'Ward of Contact', type:'text', skip:false},
                {qid:"contact_lga", question:'LGA of Contact', type:'text', skip:false}
            ]},
            {label:"EDUCATION AND PROFESSION", questions:[
                {qid:"education_level", question:'Education Level',type:'radio', options:[{key:0,label:"Nursery"},{key:1,label:"Primary"},{key:2,label:"JSS1"},{key:3,label:"SS3"}]},
                {qid:"profession", question:'Profession',type:'radio', skip:false, options:[{key:0,label:"Teacher"},{key:1,label:"Mechanic"}]}
            ]},
            {label:"ORIGIN", questions:[
                {qid:"native_language", question:'Main native language-spoken', type:'text', skip:false},
                {qid:"other_language", question:'Other Language spoken', type:'text', skip:false},
                {qid:"origin_ward", question:'Ward of origin', type:'text', skip:false},
                {qid:"origin_lga", question:'LGA of origin', type:'text', skip:false}
            ]},
            {label:"FOR NON-INDIGENES ONLY", questions:[
                {qid:"date_of_arrival", question:'Date of arrival in State', type:'date', skip:false},
                {qid:"origin_state", question:'State of origin', type:'text', skip:false},
                {qid:"origin_country", question:'Country of origin (if not Nigeria)', type:'text', skip:false}
            ]},
            {label:"NEXT OF KIN", questions:[
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'next_of_kin_surname',label:'Surname'},
                        {type:'text',key:'next_of_kin_other_names',label:'Other Names'}
                    ]},
                {qid:'next_of_kin_contact_add', question:'Contact Address', type:'text', skip:false},
                {qid:'next_of_kin_relationship', question:'Relationship', type:'text', skip:false},
                {qid:'next_of_kin_phone', question:'Telephone number', type:'tel', skip:false}
            ]},
            {label:"ACADEMIC INFORMATION", questions:[
                {
                    /**question:'Academic Year',type:'form', skip:false,
                     options:[{type:'text',key:'pre_academic_yr',label:'Year'},
                     {type:'text',key:'pos_academic_yr',label:'/Year'}
                     ]},*/
                    qid:'acad_yr',   question:'Academic Year',type:'text', skip:false
                },
                {qid:'acad_level', question:'Level', type:'text', skip:false},
                {qid:'acad_class', question:'Class', type:'text', skip:false},
                {qid:'school_city', question:'School City', type:'text', skip:false},
                {qid:'school_lga', question:'School LGA', type:'text', skip:false},
                {qid:'school', question:'School', type:'text', skip:false}
            ]},
            {label:"EMPLOYMENT INFORMATION", questions:[
                {qid:'role', question:'Role', type:'text', skip:false},
                {qid:'income_type', question:'Income Type', type:'text', skip:false},
                {qid:'amount_per_day', question:'Amount Per Day', type:'text', skip:false},
                {qid:'trainable', question:'Trainable', type:'checkbox', skip:false}
            ]}
        ],
        household:[
            {label:"REGISTRATION DETAILS", questions:[
                {qid:"lga_registration", question:'LGA of Registration', type:'text', skip:false},
                {qid:"ward_registration", question:'Ward of Registration', type:'text', skip:false},
                {qid:46, question:'Venue of Registration', type:'text', skip:false},
                {qid:"date_registration", question:'Date of Registration', type:'date', skip:false}
            ]},
            {label:'PERSONAL INFORMATION',questions:[
                {qid:"title", question:'Title',type:'radio', skip:false, options:[{key:0,label:"Mr"},{key:1,label:"Miss"},{key:2,label:"Mrs"}]},
                {question:'Names',type:'form', skip:false,
                    options:[{qid:2,type:'text',key:'surname',label:'Surname'}, {qid:3,type:'text',key:'first_name',label:'First Name'},
                         {qid:4,type:'text',key:'middle_name',label:'Middle Name'}
                    ]},
                {qid:"gender", question:'Sex',type:'radio', skip:false, options:[{key:1,label:"Male"},{key:0,label:"Female"}]},
                {qid:"height", question:'Height(cm)', type:'number', skip:false},
                {qid:"date_of_birth", question:'Date of Birth', type:'date', skip:false},
                {qid:8, question:'Does he/she have a birth registration certificate?', type:'radio', skip:false,
                    options:[{key:1,label:"Yes"},{key:0,label:"No"}]},
                {qid:"nat_id_card_number", question:'National ID Card Number', type:'text', skip:false},
                {qid:10, question:'Marital Status',type:'radio',
                    options:[{key:0,label:"Single"},{key:1,label:"Married"},{key:2,label:"Divorced"},
                             {key:3,label:"Widowed"},{key:4,label:"separated"}]},
                {qid:"religion", question:'Religion',type:'radio', options:[{key:0,label:"Christian"},{key:1,label:"Islam"},{key:2,label:"Other"}]}
            ]},
            {label:"BIO DATA", questions:[
                {qid:"blood_group", question:'Blood Group',type:'radio', options:[{key:0,label:"A"},{key:1,label:"B"},{key:2,label:"AB"},{key:3,label:"O"}]},
                {qid:"rhesus", question:'Rhesus',type:'radio', skip:false, options:[{key:0,label:"Plus"},{key:1,label:"Minus"}]}
            ]},
            {label:"RESIDENTIAL INFORMATION", questions:[
                {qid:"residential_add", question:'Residential Address', type:'text', skip:false},
                {qid:"residential_city", question:'City or Village of Residence', type:'text', skip:false},
                {qid:"residential_ward", question:'Ward of Residence', type:'text', skip:false},
                {qid:23, question:'LGA of Residence', type:'text', skip:false}
            ]},
            {label:"CONTACT INFORMATION", questions:[
                {qid:"contact_add", question:'Contact Address', type:'text', skip:false},
                {qid:"contact_city", question:'City or Village of Contact', type:'text', skip:false},
                {qid:"contact_ward", question:'Ward of Contact', type:'text', skip:false},
                {qid:"contact_lga", question:'LGA of Contact', type:'text', skip:false}
            ]},
            {label:"EDUCATION AND PROFESSION", questions:[
                {qid:"education_level", question:'Education Level',type:'radio', options:[{key:0,label:"Nursery"},{key:1,label:"Primary"},{key:2,label:"JSS1"},{key:3,label:"SS3"}]},
                {qid:"profession", question:'Profession',type:'radio', skip:false, options:[{key:0,label:"Teacher"},{key:1,label:"Mechanic"}]}
            ]},
            {label:"ORIGIN", questions:[
                {qid:"native_language", question:'Main native language-spoken', type:'text', skip:false},
                {qid:"other_language", question:'Other Language spoken', type:'text', skip:false},
                {qid:"origin_ward", question:'Ward of origin', type:'text', skip:false},
                {qid:"origin_lga", question:'LGA of origin', type:'text', skip:false}
            ]},
            {label:"FOR NON-INDIGENES ONLY", questions:[
                {qid:"date_of_arrival", question:'Date of arrival in State', type:'date', skip:false},
                {qid:"origin_state", question:'State of origin', type:'text', skip:false},
                {qid:"origin_country", question:'Country of origin (if not Nigeria)', type:'text', skip:false}
            ]},
            {label:"NEXT OF KIN", questions:[
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'next_of_kin_surname',label:'Surname'},
                        {type:'text',key:'next_of_kin_other_names',label:'Other Names'}
                    ]},
                {qid:'next_of_kin_contact_add', question:'Contact Address', type:'text', skip:false},
                {qid:'next_of_kin_relationship', question:'Relationship', type:'text', skip:false},
                {qid:'next_of_kin_phone', question:'Telephone number', type:'tel', skip:false}
            ]},
            {label:"HOUSEHOLD", questions:[
                {qid:"household_structure", question:'Household Structure', type:'text', skip:false},
                {qid:"clothing", question:'Clothing', type:'text', skip:false},
                {qid:"nut_status", question:'Nutritional status', type:'text', skip:false},
                {qid:"house_acc", question:'Housing Accommodation', type:'text', skip:false},
                {qid:"surrounding_env", question:'Surrounding Environment', type:'text', skip:false}
            ]},
            {label:"ACADEMIC INFORMATION", questions:[
                {
                    /**question:'Academic Year',type:'form', skip:false,
                     options:[{type:'text',key:'pre_academic_yr',label:'Year'},
                     {type:'text',key:'pos_academic_yr',label:'/Year'}
                     ]},*/
                     qid:'acad_yr',   question:'Academic Year',type:'text', skip:false
                },
                {qid:'acad_level', question:'Level', type:'text', skip:false},
                {qid:'acad_class', question:'Class', type:'text', skip:false},
                {qid:'school_city', question:'School City', type:'text', skip:false},
                {qid:'school_lga', question:'School LGA', type:'text', skip:false},
                {qid:'school', question:'School', type:'text', skip:false}
            ]},
            {label:"EMPLOYMENT INFORMATION", questions:[
                {qid:'role', question:'Role', type:'text', skip:false},
                {qid:'income_type', question:'Income Type', type:'text', skip:false},
                {qid:'amount_per_day', question:'Amount Per Day', type:'text', skip:false},
                {qid:'trainable', question:'Trainable', type:'checkbox', skip:false}
            ]},
            {label:"HOUSEHOLD ASSET", questions:[
                {question:'bed & Mattress',type:'form', skip:false,
                    options:[{type:'checkbox',key:'bed_check',label:'Check'},
                        {type:'number',key:'bed_qty',label:'Quanity'},
                        {type:'text',key:'bed_msr',label:'Unit of Measure'},
                        {type:'number',key:'bed_value',label:'Unit Value'}
                    ]},
                {question:'Bicycle',type:'form', skip:false,
                    options:[{type:'checkbox',key:'bicycle_chck',label:'Check'},
                        {type:'number',key:'bicycle_qty',label:'Quanity'},
                        {type:'text',key:'bicycle_msr',label:'Unit of Measure'},
                        {type:'number',key:'bicycle_value',label:'Unit Value'}
                    ]},
                {question:'Cattle',type:'form', skip:false,
                    options:[{type:'checkbox',key:'cattle_check',label:'Check'},
                        {type:'number',key:'cattle_qty',label:'Quanity'},
                        {type:'text',key:'cattle_msr',label:'Unit of Measure'},
                        {type:'number',key:'cattle_value',label:'Unit Value'}
                    ]},
                {question:'Chicken',type:'form', skip:false,
                    options:[{type:'checkbox',key:'chicken_check',label:'Check'},
                        {type:'number',key:'chicken_qty',label:'Quanity'},
                        {type:'text',key:'chicken_msr',label:'Unit of Measure'},
                        {type:'number',key:'chicken_value',label:'Unit Value'}
                    ]},
                {question:'Goat',type:'form', skip:false,
                    options:[{type:'checkbox',key:'goat_check',label:'Check'},
                        {type:'number',key:'goat_qty',label:'Quanity'},
                        {type:'text',key:'goat_msr',label:'Unit of Measure'},
                        {type:'number',key:'goat_value',label:'Unit Value'}
                    ]},
                {question:'Land',type:'form', skip:false,
                    options:[{type:'checkbox',key:'land_check',label:'Check'},
                        {type:'number',key:'land_qty',label:'Quanity'},
                        {type:'text',key:'land_msr',label:'Unit of Measure'},
                        {type:'number',key:'land_value',label:'Unit Value'}
                    ]},
                {question:'Pig',type:'form', skip:false,
                    options:[{type:'checkbox',key:'pig_check',label:'Check'},
                        {type:'number',key:'pig_qty',label:'Quanity'},
                        {type:'text',key:'pig_msr',label:'Unit of Measure'},
                        {type:'number',key:'pig_value',label:'Unit Value'}
                    ]},
                {question:'Radio',type:'form', skip:false,
                    options:[{type:'checkbox',key:'radio_check',label:'Check'},
                        {type:'number',key:'radio_qty',label:'Quanity'},
                        {type:'text',key:'radio_msr',label:'Unit of Measure'},
                        {type:'number',key:'radio_value',label:'Unit Value'}
                    ]},
                {question:'Sewing Machine',type:'form', skip:false,
                    options:[{type:'checkbox',key:'sewing_check',label:'Check'},
                        {type:'number',key:'sewing_qty',label:'Quanity'},
                        {type:'text',key:'sewing_msr',label:'Unit of Measure'},
                        {type:'number',key:'sewing_value',label:'Unit Value'}
                    ]},
                {question:'Television',type:'form', skip:false,
                    options:[{type:'checkbox',key:'tv_check',label:'Check'},
                        {type:'number',key:'tv_qty',label:'Quanity'},
                        {type:'text',key:'tv_msr',label:'Unit of Measure'},
                        {type:'number',key:'tv_value',label:'Unit Value'}
                    ]}
            ]}
        ]
    };

    angular.extend($scope,data);

    function getHeadQuestion(qid){
        for(var nv=0; nv < $scope.household.length; nv++){
            for(var zv=0; zv < $scope.household[nv].questions.length; zv++){
                if($scope.household[nv].questions[zv].type =="form"){
                    for(var inx=0; inx < $scope.household[nv].questions[zv].options.length; inx++){
                        if($scope.household[nv].questions[zv].options[inx].key==qid){
                            return $scope.household[nv].questions[zv].options[inx];
                        }
                    }
                }else{
                    if($scope.household[nv].questions[zv].qid == qid){
                        return $scope.household[nv].questions[zv];
                    }
                }
            }
        }
    }

    function getMemberQuestion(qid){
        for(var nv=0; nv < $scope.house_members.length; nv++){
            for(var zv=0; zv < $scope.house_members[nv].questions.length; zv++){
                if($scope.house_members[nv].questions[zv].type =="form"){
                    for(var inx=0; inx < $scope.house_members[nv].questions[zv].options.length; inx++){
                        if($scope.house_members[nv].questions[zv].options[inx].key==qid){
                            return $scope.house_members[nv].questions[zv].options[inx];
                        }
                    }
                }else{
                    if($scope.house_members[nv].questions[zv].qid == qid){
                        return $scope.house_members[nv].questions[zv];
                    }
                }
            }
        }
    }

    function getOptionByKey(options, key){
        for(var nv=0; nv < options.length; nv++){
            if(options[nv].key==key){
                return options[nv]
            }
        }
    }

    function updateSessionRecord() {
        var question = this.household[this.householdInfo.index].questions[this.householdInfo.counter]
        var ans;
        var enrolment;

        if($location.path().toString().indexOf("f") !== -1){
            enrolment = angular.fromJson(localStorage.newmember);
        }else{
            enrolment = angular.fromJson(localStorage.newhouse);
        }
        //check for undefined
        if(angular.isUndefined(enrolment)){
            enrolment = {};
        }

        if (question.type == "form") {
            angular.forEach(question.options, function (v, k) {
                ans = this['model_' + v.key];
                enrolment[v.key] = ans;
            },$rootScope.enrollment)
        } else {
            ans = $rootScope.enrollment['model_' + question.qid];
            enrolment[question.qid] = ans;
        }
        if($location.path().toString().indexOf("f") !== -1){
            localStorage.newmember = angular.toJson(enrolment);
        }else{
            localStorage.newhouse = angular.toJson(enrolment);
        }

    }

    $scope.counter = 0;

    $scope.householdInfo = {
         counter:0,
         index:0
    }
    $scope.memberInfo = {
        counter:0,
        index:0
    }

    $scope.needLogin = function(){
        if(angular.isUndefined(localStorage.user)){
            $window.location.href ="index.html"
        }
    }
    $scope.needLogin();

    $scope.scopeExistingEnrolment= function(){

         var x_enrolment = angular.fromJson(localStorage.newhouse);
         if(!angular.isUndefined(x_enrolment)){
                angular.forEach(x_enrolment, function(v,k){
                    this['model_'+k]=v;
                },$rootScope.enrollment)
         }
    }
    $scope.scopeExistingEnrolment();

    $scope.isLastInSection = function () {
        if ($scope.householdInfo.counter == this.section().questions.length -1) {
            return true
        }else{
            return false;
        }
    };

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
    $scope.canBack = function () {
        if ($scope.householdInfo.counter >= 1) {
            return true
        }else{
            return false;
        }
    };
    $scope.setPage = function (n) {
        $scope.householdInfo.counter = n;
    };
    $scope.submit = function (n) {
        //process question..
        updateSessionRecord.call(this);
        $scope.householdInfo.counter = n;
    };
    $scope.saveSection = function() {
        updateSessionRecord.call(this);
        alert("Save Successful!")
    }
    $scope.section = function(){
        return this.household[this.householdInfo.index]
    }
    $scope.returnBack = function(){
        this.householdInfo.counter=0;
        this.householdInfo.index =0;
        $location.path("/house");
    }
    $scope.returnBack2 = function(){
        this.householdInfo.counter=0;
        this.householdInfo.index =0;
        $location.path("/member/0");
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

    $scope.addMemberEnrolment = function(){
         //check if household enrolment has been loaded
        if(!angular.isUndefined(this.currentHouse)){
            $location.path("/member/"+this.currentHouse.Enrolment_id);
        }
    }

    $scope.totalEnrolment = function(){
         var db = app.database()
         db.transaction(
            function(transaction){
                transaction.executeSql("SELECT COUNT(*) AS total FROM Enrolment;",[],
                    function(trnsaction, results){
                        for (var i=0; i<results.rows.length; i++) {
                            var row = results.rows.item(i);
                            $scope.totalEnrolments = row.total;
                            $scope.$safeApply();
                        }
                    },function(err){
                        alert("Error processing SQL: "+err.code);
                    })
            }
         );
    }

    $scope.allEnrolments = function(){
        var db = app.database()
        db.transaction(
            function(transaction){
                transaction.executeSql('SELECT * FROM Enrolment left join Enrolled on Enrolled.Enrolment_id = Enrolment.id WHERE Enrolled.Question in ("first_name","middle_name","surname") ;',[],
                    function(trnsaction, results){
                        var prop ={}
                        var listing = []

                        for (var i=0; i<results.rows.length; i++) {
                            var row = results.rows.item(i);

                            if(i == 0){
                                prop["Household_id"] = row.Household_id;
                                prop["Head"] = row.Head;
                                prop["Enrolment_id"] = row.Enrolment_id;
                                prop[row.Question]= row.Answer;
                            }else{
                                if(prop.Enrolment_id == row.Enrolment_id){
                                    prop[row.Question]= row.Answer;
                                }else{
                                    listing.push(prop);
                                    //new step
                                    var prop ={}
                                    prop["Household_id"] = row.Household_id;
                                    prop["Head"] = row.Head;
                                    prop["Enrolment_id"] = row.Enrolment_id;
                                    prop[row.Question]= row.Answer;
                                }
                            }
                            if(i== results.rows.length - 1){
                                listing.push(prop);
                            }

                        }
                        $scope.allE = listing;
                        $scope.$safeApply();
                    },function(err){
                        alert("Error processing SQL: "+err.code);
                    })
            }
        );
    }

    $scope.viewEnrolment = function(){
        var db = app.database()
        var current;
        db.transaction(
            function(transaction){
                transaction.executeSql('SELECT * FROM Enrolment left join Enrolled on Enrolled.Enrolment_id = Enrolment.id WHERE Enrolled.Enrolment_id = ? ;',[$routeParams.view_id],
                    function(trnsaction, results){
                        var prop ={}
                        for (var i=0; i<results.rows.length; i++) {
                            var row = results.rows.item(i);

                            prop["Household ID"] = row.Household_id;
                            prop["Head"] = row.Head;
                            prop["Enrolment ID"] = row.Enrolment_id;
                            current = {Enrolment_id:row.Enrolment_id,household_id:row.Household_id};
                            //prop[row.Question]= row.Answer;
                            if(row.Head=="true"){
                                var quest = getHeadQuestion(row.Question);
                                //console.log(quest);
                                if(quest.type=="radio"){
                                    if(angular.isUndefined(quest.label)){
                                        prop[quest.question]= getOptionByKey(quest.options, row.Answer).label;
                                    }else{
                                        prop[quest.label]= getOptionByKey(quest.options, row.Answer).label;
                                    }
                                }else{
                                    if(angular.isUndefined(quest.label)){
                                        prop[quest.question]= row.Answer;
                                    }else{
                                        prop[quest.label]= row.Answer;
                                    }
                                }
                            }else{
                                var quest = getMemberQuestion(row.Question);
                                //console.log(quest);
                                if(quest.type=="radio"){
                                    if(angular.isUndefined(quest.label)){
                                        prop[quest.question]= getOptionByKey(quest.options, row.Answer).label;
                                    }else{
                                        prop[quest.label]= getOptionByKey(quest.options, row.Answer).label;
                                    }
                                }else{
                                    if(angular.isUndefined(quest.label)){
                                        prop[quest.question]= row.Answer;
                                    }else{
                                        prop[quest.label]= row.Answer;
                                    }
                                }
                            }
                        }
                        $scope.viewEnt = prop;
                        $scope.currentHouse = current;
                        $scope.$safeApply();
                    },function(err){
                        alert("Error processing SQL: "+err.code);
                    })
            }
        );
    }

    $scope.totalEnrolment();

    $scope.saveEnrolment = function(){
        var db = app.database()
        var current;
        db.transaction(
            function(transaction){
                //@todo: start time and finish time
                var gen_household_id = new Date().getTime();
                transaction.executeSql("INSERT INTO Enrolment(Household_id,Head) VALUES(?,?) ;",[gen_household_id,true],
                    function(trnsaction, results){
                        var x_enrolment = angular.fromJson(localStorage.newhouse);
                        current= {Enrolment_id:results.insertId,household_id:gen_household_id};
                        angular.forEach(x_enrolment, function(v,k){
                            this.executeSql("INSERT INTO Enrolled(Enrolment_id,Question,Answer) VALUES (?,?,?);",[results.insertId,k,v]);
                        },transaction);
                    },function(err){
                        alert("Error processing SQL: "+err.code);
                    });

            },function(err){
                alert("Error processing SQL for save enrolment: "+err.message);
            },function(){
                $scope.totalEnrolment();
                $scope.currentHouse = current;
                $scope.trashScope();
                localStorage.removeItem("newhouse");
                alert("Saved Enrollment data success")
            }
        );
    }
    $scope.progress = "0%"

    $scope.syncEnrollment = function(){
        var listing =  [];
        var db = app.database();
        this.progress_index = 0;
        this.progress_value = 100;
        db.transaction(
            function(transaction){
                transaction.executeSql('SELECT * FROM Enrolment left join Enrolled on Enrolled.Enrolment_id = Enrolment.id;',[],
                    function(trnsaction, results){
                        var prop ={}

                        for (var i=0; i<results.rows.length; i++) {
                            $scope.progress_msg="Processing Enrollment id ("+prop.enrollment_id+")..";
                            $scope.$safeApply();
                            var row = results.rows.item(i);
                            //first item
                            if(i==0){
                                prop["household_id"] = row.Household_id;
                                prop["head"] = (row.Head == 'true')?1:0 ;
                                prop["enrollment_id"] = row.Enrolment_id;
                                prop[row.Question]= row.Answer;
                            }else{
                                if(prop.enrollment_id == row.Enrolment_id){
                                    prop[row.Question]= row.Answer;
                                }else{
                                    prop['agent_id'] =  angular.fromJson(localStorage.user).id;
                                    listing.push(prop);
                                    var prop =  {};
                                    //newset
                                    prop["household_id"] = row.Household_id;
                                    prop["head"] = (row.Head == 'true')?1:0 ;
                                    prop["enrollment_id"] = row.Enrolment_id;
                                    prop[row.Question]= row.Answer;
                                }
                            }
                            //last item
                            if(i == results.rows.length-1){
                                prop['agent_id'] =  angular.fromJson(localStorage.user).id;
                                listing.push(prop);
                            }
                        }

                        $scope.$safeApply();
                    })
            }
            ,function(err){
                alert("Error processing SQL: "+err.code);
            },function(){
                //no record
                if(listing.length == 0){
                    $scope.progress ="100%";
                    $scope.progress_msg="nothing to synchronizations ..";
                    $scope.$safeApply();
                    return;
                }
                //$scope.progress ="50%";
                //$scope.$safeApply();
                $scope.progress_msg="Preparing synchronizations ..";
                $scope.$safeApply();
                var lengthy = listing.length;
                var c_index = 0;
                //one by one
                var pre_enroll = function(popx){
                    $scope.progress_msg="synchronising  enrollment (" +popx.enrollment_id+") ..";
                    $scope.$safeApply();

                    var ent_up = Enrollment.save(popx,function(resp){
                            $scope.progress_msg=resp.message
                            $scope.progress_value=(c_index / lengthy)* 100
                            $scope.progress = $scope.progress_value + "%";
                            $scope.$safeApply();
                            //remove record from db..
                            db.transaction(
                                function(transaction){
                                    transaction.executeSql("DELETE FROM Enrolment WHERE id = ?;",[popx.enrollment_id]);
                                    transaction.executeSql("DELETE FROM Enrolled WHERE Enrolment_id = ?;",[popx.enrollment_id]);
                                },function(err){
                                    alert("Error processing SQL for DELETE enrolment: "+err.message);
                                },function(){
                                    $scope.totalEnrolment();
                                }
                            );
                            c_index ++;
                            if(c_index < lengthy){

                                pre_enroll(listing[c_index]);
                            }else{
                                //close..
                            }
                    },function(err){
                        alert(err.data.error.message);
                    })
                    $scope.$safeApply();
                }
                pre_enroll(listing[0])

            });
        $scope.$safeApply();

    }

    $scope.saveMemberEnrolment = function(){
        var current ={}
        if(angular.isUndefined(this.currentHouse)){
            var gen_household_id = new Date().getTime();
            var household_id = prompt("Please provide house hold id:",gen_household_id)
            if(angular.isUndefined(household_id)){
                return;
            }else{
                gen_household_id = household_id;
            }
            current.household_id = gen_household_id;
        }else{
            current = this.currentHouse;
        }
        var db = app.database()
        db.transaction(
            function(transaction){
                //@todo: start time and finish time
                transaction.executeSql("INSERT INTO Enrolment(Household_id,Head) VALUES(?,?) ;",[current.household_id,false],
                    function(trnsaction, results){
                        var x_enrolment = angular.fromJson(localStorage.newmember);
                        current.Enrolment_id = results.insertId;
                        angular.forEach(x_enrolment, function(v,k){
                            this.executeSql("INSERT INTO Enrolled(Enrolment_id,Question,Answer) VALUES (?,?,?);",[results.insertId,k,v]);
                        },transaction);
                    },function(err){
                        alert("Error processing SQL: "+err.code);
                    });

            },function(err){
                alert("Error processing SQL for save enrolment: "+err.message);
            },function(){
                $scope.totalEnrolment();
                $scope.currentHouse = current;
                $scope.trashScope();
                localStorage.removeItem("newmember");
                alert("Saved Member Enrollment data success")
            }
        );
    }
    $scope.trashScope = function(){
        $rootScope.enrollment = {};
    }
    $scope.trashEnrollment = function(){
        //check for member enrolment
        if(!angular.isUndefined(localStorage.newmember)){
            localStorage.removeItem("newmember");
            $location.path("/viewhouse/"+this.currentHouse.Enrolment_id)
            return;
        }

        if(!angular.isUndefined(localStorage.newhouse)){
            localStorage.removeItem("newhouse");
            this.trashScope();
            $rootScope.$safeApply();
            $location.path("/home");
            return;
        }
    }
});
