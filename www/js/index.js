/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
       // app.receivedEvent('deviceready');
        document.addEventListener("backbutton", function() {
            var hashtag = location.hash;
            if (hashtag == "#/index.html" || hashtag == "#/home") {
                navigator.app.exitApp();
            } else {
                history.back();
            }
        }, false);
        app.database();
        //bootstrap doc
        angular.element(document).ready(function() {
            angular.bootstrap(document);
        });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    exitAppPopup: function(){
         navigator.notification.confirm(
            'Exit Yesso Application'
            , function(button) {
                if (button == 2) {

                    navigator.app.exitApp();
                }
            }
            , 'Exit'
            , ['No','Yes']
        );
        return false;
    },

    database:function(){
        if(angular.isUndefined(this.db)){
            try {
                if (!window.openDatabase) {
                    alert('Databases are not supported in this browser.');
                } else {
                    this.db = window.openDatabase("yesso_database","1.0","yesso offline database storage", 200000);
                    this.db.transaction(
                        function(tx){
                            tx.executeSql('CREATE TABLE IF NOT EXISTS Enrolment(id INTEGER PRIMARY KEY AUTOINCREMENT, Household_id INTEGER NOT NULL, Head BOOLEAN NOT NULL)');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS Enrolled(' +
                                ' id INTEGER PRIMARY KEY AUTOINCREMENT,' +
                                ' Enrolment_id INTEGER NOT NULL,' +
                                ' Question Text NOT NULL,' +
                                ' Answer Text,' +
                                ' FOREIGN KEY(Enrolment_id) REFERENCES Enrolment(id))');
                        },function(err){
                            alert("Error processing SQL: "+err.code);
                        },function(){
                            console.log("initialising database success");
                        }
                    );
                }
            } catch(e) {

                if (e == 2) {
                    console.log("Invalid database version.");
                } else {
                    console.log("Unknown error "+e+".");
                }
                return;
            }

        }
        return this.db;
    }

};
