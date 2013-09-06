//mapping JSON tron API to services
//---------------------------------//
var ServiceProvider = {
    servlet:[],
    mapping:{},
    service: function(name,action){
        this.mapping[name] = function(data){

        }
    },
    post:function(url,data){
        var ajaxparam = {
            type: "POST",
            dataType: "json",
            url: url,
            data: data
        }
        return $.ajax(ajaxparam);
    }
}

var APIService = function(defaultOptions) {
    var othis = this;

    var defaultVar = {
        requireLogin: true,
        baseUrl: 'http://yesso.smartappng.com/api/',
        loginKey: null,
        defaultApiData:function(){
           return {
               apiKey: othis.getApiKey(),
               loginKey:othis.getLoginKey()
           };
        }
    };
    var parameters = function(){
        var params = defaultVar.defaultApiData();
        if(arguments.length > 0){
            if(arguments[0])
                params = angular.extend(params,arguments[0])

        }
        return params;
    }
    //utility functions
    this.route = function(url) {
        return defaultVar.baseUrl + url;
    };
    this.data = function() {
        var arsgx = argmaps ? argmaps : {}

        arsgx['apiKey'] = this.getApiKey();
        return arsgx;
    };
    this.initialize = function() {
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred.promise();
    };
    this.setLoginKey = function(key) {
        defaultVar.loginKey = key;
    }
    this.getLoginKey = function() {
        return defaultVar.loginKey;
    };
    this.getApiKey=function() {
        return defaultOptions.apikey;
    };
    this.defaultFail = function(){
        return defaultOptions.fail;
    };
    this.post =function(url,data){
        var furl = this.route(url);
        data = parameters(data);
        return ServiceProvider.post(furl,data).fail(defaultOptions.fail);
    }
}

APIService.prototype.login = function(param) {
    return this.post("login/",param);
}
APIService.prototype.logout = function() {
    return this.post("logout/");
}
/*------------user info api------------------------*/
APIService.prototype.userInfo = function(push_notification ,category_preference) {
    return this.post("user/info/");
}
/*featured deal api
*@latlong position in KM - format "Format “latitude, longitude”
**/
APIService.prototype.userInfo = function(latlong,km) {
    var ajaxparam = {
        url: this.route("deal/featured/")
    }
    return $.ajax(ajaxparam);
}
/*categories api to list all categories
 */
APIService.prototype.categories = function() {
    return this.post("categories/");
}
APIService.prototype.featuredCategories = function() {
    return this.post("deal/featured-with-categories/");
}

/*locations api to Return list of locations
 */
APIService.prototype.locations = function() {
    var ajaxparam = {
        url: this.route("locations/")
    }
    return $.ajax(ajaxparam);
}
/*Return list of deals filter by the selected category
 */
APIService.prototype.getDealsByCategory = function(category_id) {
    noparam = true;
    var ajaxparam = {
        url: this.route("deal/category/"+category_id+"/")
    }
    return $.ajax(ajaxparam);
}
/*Return list of deals filter by the selected location
 */
APIService.prototype.getDealsByLocation = function(location_id) {
    noparam = true;
    var ajaxparam = {
        url: this.route("deal/location/"+location_id+"/")
    }
    return $.ajax(ajaxparam);
}
/* Get list of gift redemption deals
 */
APIService.prototype.searchDealsGift = function(search) {
    var ajaxparam = {
        url: this.route("deal/gift/")
    }
    return $.ajax(ajaxparam);
}
/* Return list of deals filter by the current user location
 */
APIService.prototype.getDealsByCurrentLocation = function(latlong,km) {
    //get current lat,long
    var ajaxparam = {
        url: this.route("deal/location/current/")
    }
    return $.ajax(ajaxparam);
}
/* Return list of deals filter by the selected merchant
 */
APIService.prototype.getDealsByMerchant = function(merchant_id) {
    noparam = true;
    var ajaxparam = {
        url: this.route("deal/merchant/"+merchant_id+"/")
    }
    return $.ajax(ajaxparam);
}
/* Return list of deals filter by the selected merchant
 */
APIService.prototype.getDealsRecommended = function() {
    var ajaxparam = {
        url: this.route("/deals/recommended")
    }
    return $.ajax(ajaxparam);
}
/* Return deal information
 */
APIService.prototype.deal = function(deal_id) {
    return this.post("deal/"+deal_id+"/");
    /*var ajaxparam = {
        url: this.route("/deals/"+deal_id+"/")
    }
    return $.ajax(ajaxparam);*/
}
/* Share the deal to Facebook, Twitter, or Foursquare
 * @method deal
 */
APIService.prototype.share = function(deal_id) {
    noparam = true;
    var ajaxparam = {
        url: this.route("/deals/"+deal_id+"/share/")
    }
    return $.ajax(ajaxparam);
}
/* Start a transaction to purchase the deal
 * @method deal, transaction
 */
APIService.prototype.checkout = function(deal_id) {
    noparam = true;
    var ajaxparam = {
        url: this.route("/deals/"+deal_id+"/checkout/")
    }
    return $.ajax(ajaxparam);
}
/* Checkout confirmation when everything is settled
 * @method transaction
 */
APIService.prototype.checkoutConfirm = function(transaction_id,quantity,ms_type ) {
    mixparam=true;
    var ajaxparam = {
        url: this.route("/transaction/"+transaction_id+"/confirm/")
    }
    return $.ajax(ajaxparam);
}