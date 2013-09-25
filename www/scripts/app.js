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
           // scope.user = $cookieStore.get('user');
            scope.user = angular.fromJson(localStorage.user);
            scope.logout = function(e){

                e.preventDefault();
                $cookieStore.remove('user');
                $cookieStore.remove('newhouse');
                $window.location.href = "index.html";
            }
            scope.newHouseHold = function(e){
                if(angular.isUndefined($cookieStore.get('newhouse'))){
                    $cookieStore.put('newhouse',{});
                    return true;
                }else{
                    navigator.notification.confirm('There is an ongoing enrolment do you want to continue',function(button){
                        if(button == 2){
                            $cookieStore.put('newhouse',{});
                            //trash scope
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

myModule.controller('MainController', function ($scope, $location, $cookieStore, $navigate, $rootScope, $routeParams, $window) {

    $scope.$location = $location;

    $scope.$navigate = $navigate;

    var data ={
        house_members:[
            {label:"REGISTRATION DETAILS", questions:[
                {qid:46, question:'LGA of Registration', type:'text', skip:false},
                {qid:47, question:'Ward of Registration', type:'text', skip:false},
                {qid:48, question:'Venue of Registration', type:'text', skip:false},
                {qid:49, question:'Date of Registration', type:'date', skip:false}
            ]},
            {label:'PERSONAL INFORMATION',questions:[
                {qid:1, question:'Title',type:'radio', skip:false, options:[{key:0,label:"Mr"},{key:1,label:"Miss"},{key:2,label:"Mrs"}]},
                {question:'Names',type:'form', skip:false,
                    options:[{qid:2,type:'text',key:'surname',label:'Surname'}, {qid:3,type:'text',key:'firstname',label:'First Name'},
                        {qid:4,type:'text',key:'middlename',label:'Middle Name'}
                    ]},
                {qid:5, question:'Sex',type:'radio', skip:false, options:[{key:1,label:"Male"},{key:0,label:"Female"}]},
                {qid:6, question:'Height(cm)', type:'number', skip:false},
                {qid:7, question:'Date of Birth', type:'date', skip:false},
                {qid:8, question:'Does he/she have a birth registration certificate?', type:'radio', skip:false,
                    options:[{key:1,label:"Yes"},{key:0,label:"No"}]},
                {qid:9, question:'National ID Card Number', type:'text', skip:false},
                {qid:10, question:'Marital Status',type:'radio',
                    options:[{key:0,label:"Single"},{key:1,label:"Married"},{key:2,label:"Divorced"},
                        {key:3,label:"Widowed"},{key:4,label:"separated"}]},
                {qid:11, question:'Religion',type:'radio', options:[{key:0,label:"Christian"},{key:1,label:"Islam"},{key:2,label:"Other"}]}
            ]},
            {label:"BIO DATA", questions:[
                {qid:12, question:'Blood Group',type:'radio', options:[{key:0,label:"A"},{key:1,label:"B"},{key:2,label:"AB"},{key:3,label:"O"}]},
                {qid:13, question:'Rhesus',type:'radio', skip:false, options:[{key:0,label:"Plus"},{key:1,label:"Minus"}]}
            ]},
            {label:"RESIDENTIAL INFORMATION", questions:[
                {qid:14, question:'Residential Address', type:'text', skip:false},
                {qid:21, question:'City or Village of Residence', type:'text', skip:false},
                {qid:22, question:'Ward of Residence', type:'text', skip:false},
                {qid:23, question:'LGA of Residence', type:'text', skip:false}
            ]},
            {label:"CONTACT INFORMATION", questions:[
                {qid:14, question:'Contact Address', type:'text', skip:false},
                {qid:24, question:'City or Village of Contact', type:'text', skip:false},
                {qid:25, question:'Ward of Contact', type:'text', skip:false},
                {qid:26, question:'LGA of Contact', type:'text', skip:false}
            ]},
            {label:"EDUCATION AND PROFESSION", questions:[
                {qid:16, question:'Education Level',type:'radio', options:[{key:0,label:"Nursery"},{key:1,label:"Primary"},{key:2,label:"JSS1"},{key:3,label:"SS3"}]},
                {qid:17, question:'Profession',type:'radio', skip:false, options:[{key:0,label:"Teacher"},{key:1,label:"Mechanic"}]}
            ]},
            {label:"ORIGIN", questions:[
                {qid:27, question:'Main native language-spoken', type:'text', skip:false},
                {qid:28, question:'Other Language spoken', type:'text', skip:false},
                {qid:29, question:'Ward of origin', type:'text', skip:false},
                {qid:30, question:'LGA of origin', type:'text', skip:false}
            ]},
            {label:"FOR NON-INDIGENES ONLY", questions:[
                {qid:31, question:'Date of arrival in State', type:'date', skip:false},
                {qid:32, question:'State of origin', type:'text', skip:false},
                {qid:33, question:'Country of origin (if not Nigeria)', type:'text', skip:false}
            ]},
            {label:"NEXT OF KIN", questions:[
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'k_surname',label:'Surname'}, {type:'text',key:'k_firstname',label:'First Name'},
                        {type:'text',key:'k_middlename',label:'Middle Name'}
                    ]},
                {qid:18, question:'Contact Address', type:'text', skip:false},
                {qid:19, question:'Relationship', type:'text', skip:false},
                {qid:20, question:'Telephone number', type:'tel', skip:false}
            ]},
            {label:"ACADEMIC INFORMATION", questions:[
                {question:'Academic Year',type:'form', skip:false,
                    options:[{type:'text',key:'pre_academic_yr',label:'Year'},
                        {type:'text',key:'pos_academic_yr',label:'/Year'}
                    ]},
                {qid:37, question:'Level', type:'text', skip:false},
                {qid:38, question:'Class', type:'text', skip:false},
                {qid:39, question:'School City', type:'text', skip:false},
                {qid:40, question:'School LGA', type:'text', skip:false},
                {qid:41, question:'School', type:'text', skip:false}
            ]},
            {label:"EMPLOYMENT INFORMATION", questions:[
                {qid:42, question:'Role', type:'text', skip:false},
                {qid:43, question:'Income Type', type:'text', skip:false},
                {qid:44, question:'Amount Per Day', type:'text', skip:false},
                {qid:45, question:'Trainable', type:'checkbox', skip:false}
            ]}
        ],
        household:[
            {label:"REGISTRATION DETAILS", questions:[
                {qid:46, question:'LGA of Registration', type:'text', skip:false},
                {qid:47, question:'Ward of Registration', type:'text', skip:false},
                {qid:48, question:'Venue of Registration', type:'text', skip:false},
                {qid:49, question:'Date of Registration', type:'date', skip:false}
            ]},
            {label:'PERSONAL INFORMATION',questions:[
                {qid:1, question:'Title',type:'radio', skip:false, options:[{key:0,label:"Mr"},{key:1,label:"Miss"},{key:2,label:"Mrs"}]},
                {question:'Names',type:'form', skip:false,
                    options:[{qid:2,type:'text',key:'surname',label:'Surname'}, {qid:3,type:'text',key:'firstname',label:'First Name'},
                         {qid:4,type:'text',key:'middlename',label:'Middle Name'}
                    ]},
                {qid:5, question:'Sex',type:'radio', skip:false, options:[{key:1,label:"Male"},{key:0,label:"Female"}]},
                {qid:6, question:'Height(cm)', type:'number', skip:false},
                {qid:7, question:'Date of Birth', type:'date', skip:false},
                {qid:8, question:'Does he/she have a birth registration certificate?', type:'radio', skip:false,
                    options:[{key:1,label:"Yes"},{key:0,label:"No"}]},
                {qid:9, question:'National ID Card Number', type:'text', skip:false},
                {qid:10, question:'Marital Status',type:'radio',
                    options:[{key:0,label:"Single"},{key:1,label:"Married"},{key:2,label:"Divorced"},
                             {key:3,label:"Widowed"},{key:4,label:"separated"}]},
                {qid:11, question:'Religion',type:'radio', options:[{key:0,label:"Christian"},{key:1,label:"Islam"},{key:2,label:"Other"}]}
            ]},
            {label:"BIO DATA", questions:[
                {qid:12, question:'Blood Group',type:'radio', options:[{key:0,label:"A"},{key:1,label:"B"},{key:2,label:"AB"},{key:3,label:"O"}]},
                {qid:13, question:'Rhesus',type:'radio', skip:false, options:[{key:0,label:"Plus"},{key:1,label:"Minus"}]}
            ]},
            {label:"RESIDENTIAL INFORMATION", questions:[
                {qid:14, question:'Residential Address', type:'text', skip:false},
                {qid:21, question:'City or Village of Residence', type:'text', skip:false},
                {qid:22, question:'Ward of Residence', type:'text', skip:false},
                {qid:23, question:'LGA of Residence', type:'text', skip:false}
            ]},
            {label:"CONTACT INFORMATION", questions:[
                {qid:14, question:'Contact Address', type:'text', skip:false},
                {qid:24, question:'City or Village of Contact', type:'text', skip:false},
                {qid:25, question:'Ward of Contact', type:'text', skip:false},
                {qid:26, question:'LGA of Contact', type:'text', skip:false}
            ]},
            {label:"EDUCATION AND PROFESSION", questions:[
                {qid:16, question:'Education Level',type:'radio', options:[{key:0,label:"Nursery"},{key:1,label:"Primary"},{key:2,label:"JSS1"},{key:3,label:"SS3"}]},
                {qid:17, question:'Profession',type:'radio', skip:false, options:[{key:0,label:"Teacher"},{key:1,label:"Mechanic"}]}
            ]},
            {label:"ORIGIN", questions:[
                {qid:27, question:'Main native language-spoken', type:'text', skip:false},
                {qid:28, question:'Other Language spoken', type:'text', skip:false},
                {qid:29, question:'Ward of origin', type:'text', skip:false},
                {qid:30, question:'LGA of origin', type:'text', skip:false}
            ]},
            {label:"FOR NON-INDIGENES ONLY", questions:[
                {qid:31, question:'Date of arrival in State', type:'date', skip:false},
                {qid:32, question:'State of origin', type:'text', skip:false},
                {qid:33, question:'Country of origin (if not Nigeria)', type:'text', skip:false}
            ]},
            {label:"NEXT OF KIN", questions:[
                {question:'Names',type:'form', skip:false,
                    options:[{type:'text',key:'k_surname',label:'Surname'}, {type:'text',key:'k_firstname',label:'First Name'},
                        {type:'text',key:'k_middlename',label:'Middle Name'}
                    ]},
                {qid:18, question:'Contact Address', type:'text', skip:false},
                {qid:19, question:'Relationship', type:'text', skip:false},
                {qid:20, question:'Telephone number', type:'tel', skip:false}
            ]},
            {label:"HOUSEHOLD", questions:[
                {qid:34, question:'Household Structure', type:'text', skip:false},
                {qid:35, question:'Clothing', type:'text', skip:false},
                {qid:36, question:'Nutritional status', type:'text', skip:false},
                {qid:36, question:'Housing Accommodation', type:'text', skip:false},
                {qid:36, question:'Surrounding Environment', type:'text', skip:false}
            ]},
            {label:"ACADEMIC INFORMATION", questions:[
                {question:'Academic Year',type:'form', skip:false,
                    options:[{type:'text',key:'pre_academic_yr',label:'Year'},
                        {type:'text',key:'pos_academic_yr',label:'/Year'}
                    ]},
                {qid:37, question:'Level', type:'text', skip:false},
                {qid:38, question:'Class', type:'text', skip:false},
                {qid:39, question:'School City', type:'text', skip:false},
                {qid:40, question:'School LGA', type:'text', skip:false},
                {qid:41, question:'School', type:'text', skip:false}
            ]},
            {label:"EMPLOYMENT INFORMATION", questions:[
                {qid:42, question:'Role', type:'text', skip:false},
                {qid:43, question:'Income Type', type:'text', skip:false},
                {qid:44, question:'Amount Per Day', type:'text', skip:false},
                {qid:45, question:'Trainable', type:'checkbox', skip:false}
            ]},
            {label:"HOUSEHOLD ASSET", questions:[
                {question:'bed & Mattress',type:'form', skip:false,
                    options:[{type:'checkbox',key:'bm_check',label:'Check'},
                        {type:'number',key:'bm_quantity',label:'Quanity'},
                        {type:'text',key:'bm_um',label:'Unit of Measure'},
                        {type:'number',key:'bm_uv',label:'Unit Value'}
                    ]},
                {question:'Bicycle',type:'form', skip:false,
                    options:[{type:'checkbox',key:'byc_check',label:'Check'},
                        {type:'number',key:'byc_quantity',label:'Quanity'},
                        {type:'text',key:'byc_um',label:'Unit of Measure'},
                        {type:'number',key:'byc_uv',label:'Unit Value'}
                    ]},
                {question:'Cattle',type:'form', skip:false,
                    options:[{type:'checkbox',key:'ca_check',label:'Check'},
                        {type:'number',key:'ca_quantity',label:'Quanity'},
                        {type:'text',key:'ca_um',label:'Unit of Measure'},
                        {type:'number',key:'ca_uv',label:'Unit Value'}
                    ]},
                {question:'Chicken',type:'form', skip:false,
                    options:[{type:'checkbox',key:'c_check',label:'Check'},
                        {type:'number',key:'c_quantity',label:'Quanity'},
                        {type:'text',key:'c_um',label:'Unit of Measure'},
                        {type:'number',key:'c_uv',label:'Unit Value'}
                    ]},
                {question:'Goat',type:'form', skip:false,
                    options:[{type:'checkbox',key:'g_check',label:'Check'},
                        {type:'number',key:'g_quantity',label:'Quanity'},
                        {type:'text',key:'g_um',label:'Unit of Measure'},
                        {type:'number',key:'g_uv',label:'Unit Value'}
                    ]},
                {question:'Land',type:'form', skip:false,
                    options:[{type:'checkbox',key:'l_check',label:'Check'},
                        {type:'number',key:'l_quantity',label:'Quanity'},
                        {type:'text',key:'l_um',label:'Unit of Measure'},
                        {type:'number',key:'l_uv',label:'Unit Value'}
                    ]},
                {question:'Pig',type:'form', skip:false,
                    options:[{type:'checkbox',key:'p_check',label:'Check'},
                        {type:'number',key:'p_quantity',label:'Quanity'},
                        {type:'text',key:'p_um',label:'Unit of Measure'},
                        {type:'number',key:'p_uv',label:'Unit Value'}
                    ]},
                {question:'Radio',type:'form', skip:false,
                    options:[{type:'checkbox',key:'r_check',label:'Check'},
                        {type:'number',key:'r_quantity',label:'Quanity'},
                        {type:'text',key:'r_um',label:'Unit of Measure'},
                        {type:'number',key:'r_uv',label:'Unit Value'}
                    ]},
                {question:'Sewing Machine',type:'form', skip:false,
                    options:[{type:'checkbox',key:'sm_check',label:'Check'},
                        {type:'number',key:'sm_quantity',label:'Quanity'},
                        {type:'text',key:'sm_um',label:'Unit of Measure'},
                        {type:'number',key:'sm_uv',label:'Unit Value'}
                    ]},
                {question:'Television',type:'form', skip:false,
                    options:[{type:'checkbox',key:'tv_check',label:'Check'},
                        {type:'number',key:'tv_quantity',label:'Quanity'},
                        {type:'text',key:'tv_um',label:'Unit of Measure'},
                        {type:'number',key:'tv_uv',label:'Unit Value'}
                    ]}

            ]}
        ]
    };

    angular.extend($scope,data);

    function updateSessionRecord() {
        var question = this.household[this.householdInfo.index].questions[this.householdInfo.counter]
        var ans;
        var enrolment = $cookieStore.get('newhouse');
        if (question.type == "form") {
            angular.forEach(question.options, function (v, k) {
                ans = this['model_' + v.key];
                enrolment[v.key] = ans;
            },$rootScope.enrollment)
        } else {
            ans = $rootScope.enrollment['model_' + question.qid];
            enrolment[question.qid] = ans;
        }
        $cookieStore.put('newhouse', enrolment);
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
         var x_enrolment = $cookieStore.get('newhouse');
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
            $location.path("/member/"+this.currentHouse.id);
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
                transaction.executeSql('SELECT * FROM Enrolment left join Enrolled on Enrolled.Enrolment_id = Enrolment.id WHERE Enrolled.Question in ("firstname","middlename","surname") ;',[],
                    function(trnsaction, results){
                        var prop ={}
                        var listing = []

                        for (var i=0; i<results.rows.length; i++) {
                            var row = results.rows.item(i);
                            if(prop == {}){
                                prop["Household_id"] = row.Household_id;
                                prop["Head"] = row.Head;
                                prop["Enrolment_id"] = row.Enrolment_id;
                            }else{
                                if(prop.Household_id == row.Household_id){
                                    prop[row.Question]= row.Answer;
                                }else{
                                    listing.push(prop);
                                    //new step
                                    prop ={}
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
        db.transaction(
            function(transaction){
                transaction.executeSql('SELECT * FROM Enrolment left join Enrolled on Enrolled.Enrolment_id = Enrolment.id WHERE Enrolled.Enrolment_id = ? ;',[$routeParams.view_id],
                    function(trnsaction, results){
                        var prop ={}
                        for (var i=0; i<results.rows.length; i++) {
                            var row = results.rows.item(i);
                            if(prop == {}){
                                prop["Household_id"] = row.Household_id;
                                prop["Head"] = row.Head;
                                prop["Enrolment_id"] = row.Enrolment_id;
                            }else{
                                prop[row.Question]= row.Answer;
                            }
                        }
                        $scope.viewEnt = prop;
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
                        var x_enrolment = $cookieStore.get('newhouse');
                        //insert answers for enrolment
                        current= {'id':results.insertId,household_id:gen_household_id};
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
                console.log("Saving Enrollment data success");
                alert("Saved Enrollment data success")
            }
        );
    }
    $scope.trashScope = function(){
        $rootScope.enrollment = {};
    }
    $scope.trashEnrollment = function(){
        //check for member enrolment
        if(!angular.isUndefined($cookieStore.get("newmenber"))){
            $cookieStore.remove("newmember");
            $location.path("/viewhouse/"+this.currentHouse.id)
            return;
        }

        if(!angular.isUndefined($cookieStore.get("newhouse"))){
            $cookieStore.remove("newhouse");
            this.trashScope();
            $rootScope.$safeApply();
            $location.path("/home");
            return;
        }
    }
});
