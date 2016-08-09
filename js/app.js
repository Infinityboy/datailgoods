var app = angular.module('app', ['ngRoute'], function ($httpProvider) {
    // 头部配置
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript, */*; q=0.01';
    $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';

    /**
     * 重写angular的param方法，使angular使用jquery一样的数据序列化方式  The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/tab/home', {
            templateUrl: 'template/home.html',
            controller: 'homeCtrl'
        })
        .when('/tab/list', {
            templateUrl: 'template/list.html',
            controller: 'listCtrl'
        })
        .when('/tab/share', {
            templateUrl: 'template/share.html',
            controller: 'shareCtrl'
        })
        .when('/tab/productDetail', {
            templateUrl: 'template/productDetail.html',
            controller: 'productDetailCtrl'
        })
        .when('/tab/productInfo', {
            templateUrl: 'template/productInfo.html',
            controller: 'productInfoCtrl'
        })
        .when('/tab/passedPublish', {
            templateUrl: 'template/passedPublish.html',
            controller: 'passedPublishCtrl'
        })
        .when('/tab/productShare', {
            templateUrl: 'template/productShare.html',
            controller: 'productShareCtrl'
        })
        .when('/tab/login', {
            templateUrl: 'template/login.html',
            controller: 'loginCtrl'
        })
        .when('/tab/updatePassword', {
            templateUrl: 'template/updatePassword.html',
            controller: 'updatePasswordCtrl'
        })
        .when('/tab/rigister', {
            templateUrl: 'template/rigister.html',
            controller: 'rigisterCtrl'
        })
        .when('/tab/search', {
            templateUrl: 'template/search.html',
            controller: 'searchCtrl'
        })
        .when('/tab/searchResult', {
            templateUrl: 'template/searchResult.html',
            controller: 'searchResultCtrl'
        })
        .when('/tab/personCenter', {
            templateUrl: 'template/personCenter.html',
            controller: 'personCenterCtrl'
        })
        .when('/tab/rechargeRecord', {
            templateUrl: 'template/rechargeRecord.html',
            controller: 'rechargeRecordCtrl'
        })
        .when('/tab/winningRecord', {
            templateUrl: 'template/winningRecord.html',
            controller: 'winningRecordCtrl'
        })
        .when('/tab/snatchRecord', {
            templateUrl: 'template/snatchRecord.html',
            controller: 'snatchRecordCtrl'
        })
        .when('/tab/recharge', {
            templateUrl: 'template/recharge.html',
            controller: 'rechargeCtrl'
        })
        .when('/tab/personalInfo', {
            templateUrl: 'template/personalInfo.html',
            controller: 'personalInfoCtrl'
        })
        .when('/tab/address', {
            templateUrl: 'template/address.html',
            controller: 'addressCtrl'
        })
        .when('/tab/addAddress', {
            templateUrl: 'template/addAddress.html',
            controller: 'addAddressCtrl'
        })
        .when('/tab/updateAddress', {
            templateUrl: 'template/updateAddress.html',
            controller: 'updateAddressCtrl'
        })
        .when('/tab/updateNickname', {
            templateUrl: 'template/updateNickname.html',
            controller: 'updateNicknameCtrl'
        })
        .when('/tab/updatePhone', {
            templateUrl: 'template/updatePhone.html',
            controller: 'updatePhoneCtrl'
        })
        .when('/tab/shareDetail', {
            templateUrl: 'template/shareDetail.html',
            controller: 'shareDetailCtrl'
        })
        .when('/tab/tenList', {
            templateUrl: 'template/tenList.html',
            controller: 'tenListCtrl'
        })
        .when('/tab/newProd', {
            templateUrl: 'template/newProd.html',
            controller: 'newProd'
        })
        .when('/tab/shopList', {
            templateUrl: 'template/shopList.html',
            controller: 'shopListCtrl'
        })
        .when('/tab/pay', {
            templateUrl: 'template/pay.html',
            controller: 'payCtrl'
        })
        .when('/tab/payResult', {
            templateUrl: 'template/payResult.html',
            controller: 'payResultCtrl'
        })
        .when('/tab/payRe', {
            templateUrl: 'template/payRe.html',
            controller: 'payReCtrl'
        })
        .when('/tab/payResultState', {
            templateUrl: 'template/payResultState.html',
            controller: 'payResultStateCtrl'
        })
        .when('/tab/rechargeResult', {
            templateUrl: 'template/rechargeResult.html',
            controller: 'rechargeResultCtrl'
        })
        .when('/tab/winningDetail', {
            templateUrl: 'template/winningDetail.html',
            controller: 'winningDetailCtrl'
        })
        .when('/tab/calculation', {
            templateUrl: 'template/calculation.html',
            controller: 'calculationCtrl'
        })
        .when('/tab/agreement', {
            templateUrl: 'template/agreement.html',
            controller: 'agreementCtrl'
        })
        .when('/tab/question', {
            templateUrl: 'template/question.html',
            controller: 'questionCtrl'
        })
        .when('/tab/friendRebate', {
            templateUrl: 'template/friendRebate.html',
            controller: 'friendRebateCtrl'
        })
        .when('/tab/invite', {
            templateUrl: 'template/invite.html',
            controller: 'inviteCtrl'
        })
        .when('/tab/notification', {
            templateUrl: 'template/notification.html',
            controller: 'notificationCtrl'
        })
        .when('/tab/articleInfo', {
            templateUrl: 'template/articleInfo.html',
            controller: 'articleInfoCtrl'
        })
        .when('/tab/discover', {
            templateUrl: 'template/discover.html',
            controller: 'discoverCtrl'
        })
        .when('/tab/about', {
            templateUrl: 'template/about.html',
            controller: 'aboutCtrl'
        })
        .when('/tab/privacy', {		//隐私声明  ios
            templateUrl: 'template/privacy.html',
            controller: 'privacyCtrl'
        })
        .when('/tab/protect', {		//网络游戏xx 个人信息保护 ios
            templateUrl: 'template/protect.html',
            controller: 'protectCtrl'
        })
        .when('/tab/termOfService', {		//服务条款
            templateUrl: 'template/termOfService.html',
            controller: 'termOfServiceCtrl'
        })
        .when('/tab/appProductInfo', {		//APP端商品图文详情
            templateUrl: 'template/appProductInfo.html',
            controller: 'appProductInfoCtrl'
        })
        .when('/tab/appCalculation', {		//APP端计算详情
            templateUrl: 'template/appCalculation.html',
            controller: 'appCalculationCtrl'
        })
}]);





