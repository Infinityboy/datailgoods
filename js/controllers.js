app.controller('indexCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "一元神马购 神马都是一元";
        $rootScope.holdUID = getCookie("holdUID");
        $rootScope.holdState = 0;
        if (isNull(getCookie("shopList"))) {
            $rootScope.shopList = [];
        } else {
            $rootScope.shopList = eval('(' + getCookie("shopList") + ')');
        }

        $scope.login = function () {
            $location.path('/tab/login');
        };
        $scope.$on("itemChange", function (event, msg) {
            //console.log("indexCtrl", msg);
            $scope.$broadcast("itemChangeFromParrent", msg);
        });
        $scope.$on("uid", function (event, msg) {
            //console.log("indexCtrl", msg);
            $rootScope.holdUID = msg;
            addCookie("holdUID", msg, 0);
        });

        $scope.confirmExecute = function () {
            $rootScope.holdState = 1;
            $('#confirmModal').modal('hide');
        };

        $scope.dowloadApp = function () {
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsWeiXin = sUserAgent.match(/MicroMessenger/i) == "micromessenger";
            if (bIsAndroid) {
                if (bIsWeiXin) {
                    $("#mcover").css("display", "block");
                } else {
                    window.location.href = "http://www.1ysmg.com/yyzl.apk";
                }
            } else if (bIsIphoneOs) {
                if (bIsWeiXin) {
                    $("#mcover").css("display", "block");
                } else {
                    //$rootScope.showAlert("IOS版即将上线，敬请期待");
                    window.location.href = "http://itunes.apple.com/cn/app/id1071871513?mt=8";
                }
            }
        };

        $scope.choosed = false;

        $scope.addNewAddress = function () {
            $('#addressModal').modal('hide');
            if ($scope.userAddress.length > 4) {
                $rootScope.showAlert("最多只能添加5条地址");
                return;
            }
            $location.url("/tab/addAddress?flag=address&uid=" + $rootScope.holdUID);
        };

        $scope.addressExecute = function () {
            var radios = document.getElementsByName("addressRadios");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    if ($scope.choosed) {
                        $scope.choosed = false;
                        $('#addressModal').modal('hide');
                        $scope.do_confirm_address($scope.rid, radios[i].value);
                    } else {
                        $scope.address_c = $scope.userAddress[i];
                        $scope.choosed = true;
                    }
                    break;
                }
            }
        };

        $scope.hideAddress = function () {
            $('#addressModal').modal('hide');
            $scope.choosed = false;
        };

        $scope.do_confirm_address = function (rid, aid) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $rootScope.holdUID, rid: rid, aid: aid},
                url: "../index.php/yungouapi/member/do_confirm_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        /*var str = JSON.stringify(response);
                         console.log("----------->", str);*/
                        $rootScope.showAlert(response.message);
                        $scope.userAddress = [];
                        window.location.reload();
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $rootScope.addToCart = function (data, $event) {
            /*$($event.target).css('box-shadow', '0 0 15px #000');
             setTimeout(function(){
             $($event.target).css('box-shadow', 'none');
             }, 160);*/
            var img = data.thumb;
            var flyElm = $('<img style="z-index:999;width:40px;" class="u-flyer" src="' + img + '">');
            $('body').append(flyElm);
            flyElm.css({
                'z-index': 9000,
                'display': 'block',
                'position': 'absolute',
                'top': event.pageY - 50 + 'px',
                'left': event.pageX - 50 + 'px',
                'width': 60 + 'px',
                'height': 60 + 'px'
            });
            flyElm.animate({
                top: $("#shopList").offset().top,
                left: $("#shopList").offset().left + 20,
                width: 5,
                height: 10
            }, 'slow', function () {
                flyElm.remove();
            });

            var isAdded = false;
            for (var i = 0; i < $rootScope.shopList.length; i++) {
                if (data.id == $rootScope.shopList[i].id) {
                    isAdded = true;
                    if (data.wap_ten == 10) {
                        if (data.zongrenshu - data.canyurenshu > $rootScope.shopList[i].num) {
                            $rootScope.shopList[i].num += 10;
                        }
                    } else {
                        if (data.zongrenshu - data.canyurenshu > $rootScope.shopList[i].num) {
                            $rootScope.shopList[i].num += 1;
                        }
                    }
                    break;
                }
            }
            if (!isAdded) {
                if (data.wap_ten == 10) {
                    if (data.zongrenshu - data.canyurenshu > 10) {
                        data.num = 10;
                    } else {

                    }
                    data.num = 10;
                } else {
                    data.num = 1;
                }

                $rootScope.shopList.push(data);
            }
            addCookie("shopList", JSON.stringify($rootScope.shopList), 0);
        };

        $scope.showMsg = [];
        $rootScope.showAlert = function (msg, num, code) {
            if (num == 0) {
                $scope.winCode = code;
                $scope.showMsg = msg.split(",");
                $('#showModal').modal('show');
                $('#showModal').css('margin-top', $(window).height() / 2 - 230);
            } else if (num == 1) {
                $scope.userAddress = msg;
                $scope.rid = code;
                $('#addressModal').modal('show');
            } else {
                $scope.alertMsg = msg;
                $('#alertModal').modal('show');
            }
        };

        $rootScope.showPic = function (msg) {
            $scope.picUrl = msg;
            $('#picModal').modal('show');
        };

        $scope.browserRedirect = function () {
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsMidp = sUserAgent.match(/midp/i) == "midp";
            var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                $("#footbar").show();
            } else {
                $("#footbar").hide();
                window.location.href = "http://1ysmg.com";
            }
        };
        $scope.browserRedirect();

        $scope.closeBar = function () {
            $("#footbar").hide();
            $("#shopList").css("bottom", "10px");
        };
    })
    .controller('headerCtrl', function ($scope, $location, $rootScope) {
        $scope.isSelected1 = true;
        $scope.isSelected2 = false;
        $scope.isSelected3 = false;
        $scope.$on("itemChangeFromParrent", function (event, msg) {
            //console.log("headerCtrl", msg);
            if (msg == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
            } else if (msg == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
            }
            $('body').scrollTop(0);
        });

        $scope.is_weixin = function () {
            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        };

        $scope.toLogin = function () {
            if (!isNull($rootScope.holdUID)) {
                $location.url('/tab/personCenter?uid=' + $rootScope.holdUID);
            } else {
                if ($scope.is_weixin()) {
                    window.location.href = "http://www.1ysmg.com/index.php/api/wapwxlogin";
                } else {
                    $location.url('/tab/login');
                }

            }
        };

        $scope.setSelectedItem = function (num) {
            if (num == 1) {
                $scope.isSelected1 = true;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
            } else if (num == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
            } else if (num == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
            }
        };
    })
    .controller('homeCtrl', function ($scope, $http, $rootScope, $location) {
        document.title = "一元云购";
        $("#headerId").show();
        $("#proId").hide();

        // 轮播图片数据
        $scope.imgData = [];
        $scope.get_slide_list = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/index/get_slide_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        var str = JSON.stringify(response);
                        if (response.data) {
                            $scope.imgData = response.data;
                            setTimeout(function () {
                                $("a").on("touchstart", function (e) {
                                    $(e.target).addClass('box-shadow-style');
                                });
                                $("a").on("touchmove", function (e) {
                                    $(e.target).removeClass('box-shadow-style');
                                });
                                $("a").on("touchend", function (e) {
                                    $(e.target).removeClass('box-shadow-style');
                                });
                            }, 500);
                        }
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        // 轮播效果
        $('.carousel').carousel({
            interval: 3000
        });
        $scope.setSelectedItem = function (num) {
            $scope.$emit("itemChange", num);
        };
        $scope.goodsStatus = "倒计时";
        $scope.imgTouchMove = function () {
            var slidePage = {};
            $('#carousel').on('touchstart', function (e) {
                var touch = e.originalEvent.targetTouches[0];
                slidePage.x = touch.pageX;
            });
            $('#carousel').on('touchend', function (e) {
                var touch = e.originalEvent.changedTouches[0];
                var x = touch.pageX;
                if (x - parseInt(slidePage.x) > 20) {
                    //从左往右
                    $('#carousel').carousel('prev');
                } else if (x - parseInt(slidePage.x) < -20) {
                    //从右往左
                    $('#carousel').carousel('next');
                }
            });
        };

        //$scope.endTime = "";
        $scope.newGoods = [];
        $scope.keepTime = false;
        $scope.isFirst = true;

        $scope.hotGoods = [];
        $scope.nGoods = [];

        // 中奖纪录
        $scope.get_win_member_info = function (id, i) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: id},
                url: "../index.php/yungouapi/goods/get_win_member_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.newGoods[i].tag = 0;
                        $scope.newGoods[i].goodsStatus = "恭喜";
                        $scope.newGoods[i].username = response.data.username
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.imgTouchMove();
        $scope.get_slide_list();

        // 获取具体分类
        $scope.$emit("itemChange", 2);

        $scope.noData = false;

        $scope.isSelected = -1;
        $scope.isSelected1 = true;
        $scope.isSelected2 = false;
        $scope.isSelected3 = false;
        $scope.isSelected4 = false;
        $scope.isShow = false;
        $scope.typeList = [];
        $scope.displayType = "商品分类";
        $scope.typeId = 0;
        if ($location.search()['flag'] == "zuixin") {
            $scope.isSelected1 = false;
            $scope.isSelected2 = true;
            $scope.isSelected3 = false;
            $scope.isSelected4 = false;
            $scope.type = "zuixin";
        }
        if ($location.search()['flag'] == "zuixin") {
            $scope.isSelected1 = false;
            $scope.isSelected2 = true;
            $scope.isSelected3 = false;
            $scope.isSelected4 = false;
            $scope.type = "zuixin";
        }

        $scope.page = 1;
        $scope.size = 10;

        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller").height($(window).height() - 120);

            $scope.mScroll = new iScroll("scroller", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_cate_goods_list($scope.page, $scope.size, $scope.type, $scope.typeId);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.chooseType = function (num, name, typeId) {
            $scope.isSelected = num;
            $scope.isShow = false;
            $scope.displayType = name;
            $scope.typeId = typeId;
            $scope.get_cate_goods_list(1, 10, $scope.type, $scope.typeId);
        };
        $scope.openMenuList = function () {
            if ($scope.isShow) {
                $scope.isShow = false;
            } else {
                $scope.isShow = true;
            }
        };
        $scope.setSelectedItem = function (num) {
            if (num == 1) {
                $scope.isSelected1 = true;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.type = "renqi";
            } else if (num == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.type = "zuixin";
            } else if (num == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
                $scope.isSelected4 = false;
                $scope.type = "shenyurenshu";
            } else if (num == 4) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = true;
                $scope.type = "zongxurenci";
            }
            $scope.page = 1;
            $scope.get_cate_goods_list($scope.page, 10, $scope.type, $scope.typeId);
        };

        $scope.goodsList = [];

        $scope.get_cate_goods_list = function (page, size, type, cateid) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            //$scope.goodsList = [];
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    page: page,
                    size: size,
                    type: type,
                    cateid: cateid
                },
                url: "../index.php/yungouapi/index/get_cate_goods_list"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            $scope.goodsList = response.data.list;
                            if ($scope.goodsList.length == 0) {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.goodsList = $scope.goodsList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.cateid = $location.search()['cateid'];
        $scope.typeList = [];
        $scope.get_category_list = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/index/get_category_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.typeList = response.data;
                        if (!isNull($scope.cateid)) {
                            for (var i = 0; i < $scope.typeList.length; i++) {
                                if ($scope.typeList[i].cateid == $scope.cateid) {
                                    $scope.displayType = $scope.typeList[i].name;
                                    $scope.isSelected = i;
                                    break;
                                }
                            }
                            $scope.typeId = $scope.cateid;
                        }
                        $scope.get_cate_goods_list(1, 10, $scope.type, $scope.typeId);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_category_list();

    })
    .controller('listCtrl', function ($scope, $http, $rootScope, $location) {
        document.title = "一元神马购 神马都是一元";
        $("#headerId").show();


        //$("#shopList").show();

        $scope.$emit("itemChange", 2);

        $scope.noData = false;

        $scope.isSelected = -1;
        $scope.isSelected1 = true;
        $scope.isSelected2 = false;
        $scope.isSelected3 = false;
        $scope.isSelected4 = false;
        $scope.isShow = false;
        $scope.typeList = [];
        $scope.displayType = "商品分类";
        $scope.typeId = 0;
        // $scope.type = "renqi";
        if ($location.search()['flag'] == "zuixin") {
            $scope.isSelected1 = false;
            $scope.isSelected2 = true;
            $scope.isSelected3 = false;
            $scope.isSelected4 = false;
            $scope.type = "zuixin";
        }
        if ($location.search()['flag'] == "zuixin") {
            $scope.isSelected1 = false;
            $scope.isSelected2 = true;
            $scope.isSelected3 = false;
            $scope.isSelected4 = false;
            $scope.type = "zuixin";
        }

        $scope.page = 1;
        $scope.size = 10;

        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller").height($(window).height() - 120);

            $scope.mScroll = new iScroll("scroller", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_cate_goods_list($scope.page, $scope.size, $scope.type, $scope.typeId);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.chooseType = function (num, name, typeId) {
            $scope.isSelected = num;
            $scope.isShow = false;
            $scope.displayType = name;
            $scope.typeId = typeId;
            $scope.get_cate_goods_list(1, 10, $scope.type, $scope.typeId);
        };
        $scope.openMenuList = function () {
            if ($scope.isShow) {
                $scope.isShow = false;
            } else {
                $scope.isShow = true;
            }
        };
        $scope.setSelectedItem = function (num) {
            if (num == 1) {
                $scope.isSelected1 = true;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.type = "renqi";
            } else if (num == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.type = "zuixin";
            } else if (num == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
                $scope.isSelected4 = false;
                $scope.type = "shenyurenshu";
            } else if (num == 4) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = true;
                $scope.type = "zongxurenci";
            }
            $scope.page = 1;
            $scope.get_cate_goods_list($scope.page, 10, $scope.type, $scope.typeId);
        };

        $scope.goodsList = [];

        $scope.get_cate_goods_list = function (page, size, type, cateid) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            //$scope.goodsList = [];
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    page: page,
                    size: size,
                    type: type,
                    cateid: cateid
                },
                url: "../index.php/yungouapi/index/get_cate_goods_list"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            $scope.goodsList = response.data.list;
                            if ($scope.goodsList.length == 0) {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.goodsList = $scope.goodsList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.cateid = $location.search()['cateid'];
        $scope.typeList = [];
        $scope.get_category_list = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/index/get_category_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.typeList = response.data;
                        if (!isNull($scope.cateid)) {
                            for (var i = 0; i < $scope.typeList.length; i++) {
                                if ($scope.typeList[i].cateid == $scope.cateid) {
                                    $scope.displayType = $scope.typeList[i].name;
                                    $scope.isSelected = i;
                                    break;
                                }
                            }
                            $scope.typeId = $scope.cateid;
                        }
                        $scope.get_cate_goods_list(1, 10, $scope.type, $scope.typeId);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_category_list();

    })
    .controller('shareCtrl', function ($scope, $http, $rootScope) {
        document.title = "一元神马购 神马都是一元";
        $("#headerId").show();
        $("#shopList").hide();

        $scope.$emit("itemChange", 3);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_share").height($(window).height() - 90);

            $scope.mScroll = new iScroll("scroller_share", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_shaidan_list($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.shareList = [];

        $scope.get_shaidan_list = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size},
                url: "../index.php/yungouapi/goods/get_shaidan_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data.list) {
                                $scope.shareList = response.data.list;
                                if ($scope.shareList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.shareList = $scope.shareList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.list && response.data.list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_shaidan_list(1, 10);
    })
    .controller('productDetailCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "商品详情";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.notLogin = false;
        $scope.notJoin = false;
        $scope.isJoin = false;
        $scope.havaWinner = false;
        $scope.canBuy = true;
        $scope.backTo = function () {
            window.history.go(-1);
        };

        $("#footbar").hide();
        $("#shopList").css("bottom", "10px");

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.isTime = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_product_detail").height($(window).height() - 90);

            $scope.mScroll = new iScroll("scroller_product_detail", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_record_list($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        if (isNull($rootScope.holdUID)) {
            $scope.uid = "";
            $scope.notLogin = true;
        } else {
            $scope.uid = $rootScope.holdUID;
            $scope.notLogin = false;
        }

        $scope.imgTouchMove = function () {
            var slidePage = {};
            $('#carousel').on('touchstart', function (e) {
                var touch = e.originalEvent.targetTouches[0];
                slidePage.x = touch.pageX;
            });
            $('#carousel').on('touchend', function (e) {
                var touch = e.originalEvent.changedTouches[0];
                var x = touch.pageX;
                if (x - parseInt(slidePage.x) > 0) {
                    //从左往右
                    $('#carousel').carousel('prev');
                } else {
                    //从右往左
                    $('#carousel').carousel('next');
                }
            });
        };

        $scope.isFirst = true;

        /*$scope.keepTimeF = function(){
         var nowTime = new Date().getTime();
         var paseTime = getCookie("pasedTime");
         console.log("", nowTime - paseTime);
         if(nowTime - paseTime > 500){
         if($scope.isFirst){
         $scope.isFirst = false;
         }else{
         clearInterval($scope.shut);
         window.location.reload();
         //set_on_off(true);
         //$scope.get_goods_info_again();
         }
         }
         addCookie("pasedTime", nowTime);
         if($scope.havaWinner){
         clearInterval($scope.shut);
         }
         };*/

        $scope.id = $location.search()['id'];
        $scope.endTime = $location.search()['endTime'];
        $scope.someCode = [];
        $scope.allCode = "";
        $scope.waiting = true;
        $scope.get_goods_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id, uid: $scope.uid},
                url: "../index.php/yungouapi/goods/get_goods_info"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $scope.goodsInfo = response.data;
                        if ($scope.goodsInfo.tag == 0) {
                            $scope.tag = "已揭晓";
                            $scope.havaWinner = true;
                            $scope.canBuy = false;
                            $scope.winUid = response.data.q_user.uid;
                        } else if ($scope.goodsInfo.tag == 1) {
                            $scope.tag = "进行中";
                            $scope.canBuy = true;
                            $("#shopList").show();
                        } else if ($scope.goodsInfo.tag == 2) {
                            $scope.tag = "倒计时";
                            $scope.canBuy = false;
                            $scope.isTime = true;
                            $scope.lastTime = response.data.surplus;
                            setTimeout(function () {
                                var test_time_four = response.data.test_time;
                                test_time_four = (new Date().getTime()) + (parseInt(test_time_four)) * 1000;
                                $("#fnTimeCountDown").fnTimeCountDown(test_time_four, function () {
                                    $scope.waiting = false;
                                    setTimeout(function () {
                                        var partner = "ZLAPITOH5WAP";
                                        var timestamp = Date.parse(new Date()) / 1000;
                                        var sign = $.md5(partner + timestamp + key);
                                        $http({
                                            method: 'POST',
                                            data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                                            url: "../index.php/yungouapi/goods/get_win_member_info"
                                        })
                                            .success(function (response, status, headers, config) {
                                                /*var str = JSON.stringify(response);
                                                 console.log("------------>", str);*/
                                                if (response.status == "1") {
                                                    $scope.isTime = false;
                                                    $scope.havaWinner = true;
                                                    $scope.goodsInfo.q_user_code = response.data.q_user_code;
                                                    $scope.goodsInfo.q_user = response.data;
                                                    $scope.winUid = response.data.uid;
                                                } else {
                                                    //$rootScope.showAlert(response.message);
                                                }
                                            })
                                            .error(function (response, status, headers, config) {

                                            });
                                    }, 3000);
                                });
                            }, 500);
                            // $scope.shut = setInterval($scope.keepTimeF,200);
                        } else if ($scope.goodsInfo.tag == 3) {
                            $scope.tag = "期满";
                            $scope.canBuy = false;
                        }
                        if ($scope.goodsInfo.curr_uinfo.is_join == 0) {
                            if (!$scope.notLogin) {
                                $scope.notJoin = true;
                            }
                        } else if ($scope.goodsInfo.curr_uinfo.is_join == 1) {
                            $scope.isJoin = true;
                            $scope.someCode = $scope.goodsInfo.curr_uinfo.goucode.split(",");
                            $scope.allCode = $scope.goodsInfo.curr_uinfo.goucode_all;
                        }
                        $scope.qishu = response.data.qishu;
                        $scope.get_record_list(1, 10);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        hideLoading();
                        $rootScope.showAlert(response.message);
                    }
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.get_goods_info_again = function () {
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id, uid: $scope.uid},
                url: "../index.php/yungouapi/goods/get_goods_info"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.goodsInfo.tag == 2) {
                            $scope.lastTime = response.data.surplus;
                            setTimeout(function () {
                                var test_time = response.data.test_time;
                                test_time = (new Date().getTime()) + (parseInt(test_time)) * 1000;
                                $("#fnTimeCountDown").fnTimeCountDown(test_time, function () {
                                    $scope.waiting = false;
                                    setTimeout(function () {
                                        var partner = "ZLAPITOH5WAP";
                                        var timestamp = Date.parse(new Date()) / 1000;
                                        var sign = $.md5(partner + timestamp + key);
                                        $http({
                                            method: 'POST',
                                            data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                                            url: "../index.php/yungouapi/goods/get_win_member_info"
                                        })
                                            .success(function (response, status, headers, config) {
                                                /*var str = JSON.stringify(response);
                                                 console.log("------------>", str);*/
                                                if (response.status == "1") {
                                                    $scope.isTime = false;
                                                    $scope.havaWinner = true;
                                                    $scope.goodsInfo.q_user_code = response.data.q_user_code;
                                                    $scope.goodsInfo.q_user = response.data;
                                                    $scope.winUid = response.data.uid;
                                                } else {
                                                    //$rootScope.showAlert(response.message);
                                                }
                                            })
                                            .error(function (response, status, headers, config) {

                                            });
                                    }, 3000);
                                });
                            }, 500);
                            //$scope.shut = setInterval($scope.keepTimeF,200);
                        }
                    } else {

                    }
                })
                .error(function (response, status, headers, config) {

                });
        };

        $scope.showAll = function (code) {
            $rootScope.showAlert($scope.allCode, 0, code);
        };

        $scope.recordList = [];
        $scope.get_record_list = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    shopid: $scope.id,
                    qishu: $scope.qishu,
                    page: page,
                    size: size
                },
                url: "../index.php/yungouapi/goods/get_record_list"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     console.log("------------>", str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data.list) {
                                $scope.recordList = response.data.list;
                                if ($scope.recordList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.recordList = $scope.recordList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.list && response.data.list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_more_number = function (code) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    id: $scope.id,
                    uid: $scope.winUid,
                    qishu: $scope.qishu
                },
                url: "../index.php/yungouapi/goods/get_more_number"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $rootScope.showAlert(response.data.goucode, 0, code);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.imgTouchMove();
        $scope.get_goods_info();
    })
    .controller('productInfoCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "商品详情";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];
        $scope.get_goods_pic_content = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                url: "../index.php/yungouapi/goods/get_goods_pic_content"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $("#productInfoData").append(response.data.content);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_goods_pic_content();
    })
    .controller('passedPublishCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "往期揭晓";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_passed_publish").height($(window).height() - 45);

            $scope.mScroll = new iScroll("scroller_passed_publish", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_old_lottery($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });
        $scope.finishedList = [];
        $scope.progressList = [];
        $scope.sid = $location.search()['sid'];
        $scope.get_old_lottery = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size, sid: $scope.sid},
                url: "../index.php/yungouapi/goods/get_old_lottery"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        var list = response.data.list;
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].tag == 0) {
                                $scope.finishedList.push(list[i]);
                            } else if (list[i].tag == 2) {
                                $scope.progressList.push(list[i]);
                            }
                        }
                        if ($scope.page == 1) {
                            if ($scope.finishedList.length == 0 && $scope.progressList.length == 0) {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_old_lottery(1, 10);
    })
    .controller('productShareCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "晒单分享";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_product_share").height($(window).height() - 45);

            $scope.mScroll = new iScroll("scroller_product_share", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        if (!isNull($scope.uid)) {
                            $scope.get_member_shaidan($scope.page, $scope.size);
                        } else if (!isNull($scope.sid)) {
                            $scope.get_shaidan_list($scope.page, $scope.size);
                        }
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.uid = $location.search()['uid'];
        $scope.sid = $location.search()['sid'];
        $scope.shareList = [];

        $scope.get_member_shaidan = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid, page: page, size: size},
                url: "../index.php/yungouapi/member/get_member_shaidan"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data) {
                                $scope.shareList = response.data;
                                if ($scope.shareList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.shareList = $scope.shareList.concat(response.data);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_shaidan_list = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, sid: $scope.sid, page: page, size: size},
                url: "../index.php/yungouapi/goods/get_shaidan_list"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data.list) {
                                $scope.shareList = response.data.list;
                                if ($scope.shareList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.shareList = $scope.shareList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        if (!isNull($scope.uid)) {
            $scope.get_member_shaidan(1, 10);
        } else if (!isNull($scope.sid)) {
            $scope.get_shaidan_list(1, 10);
        }
    })
    .controller('loginCtrl', function ($scope, $http, $location, $rootScope) {
        $rootScope.holdUID = getCookie("holdUID")
        if (!isNull($rootScope.holdUID)) {
            $location.url('/tab/personCenter?uid=' + $rootScope.holdUID);
        }
        document.title = "登陆";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.is_weixn = function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            } else {
                return false;
            }
        };
        $scope.do_login = function ($event) {
            /*$($event.target).css('box-shadow', '0 0 15px #000');
             setTimeout(function(){
             $($event.target).css('box-shadow', 'none');
             }, 160);*/
            if (isNull($scope.account)) {
                $rootScope.showAlert("请输入用户名");
                return;
            }
            if (isNull($scope.password)) {
                $rootScope.showAlert("请输入密码");
                return;
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    username: $scope.account,
                    password: $scope.password
                },
                url: "../index.php/yungouapi/member/do_login"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.$emit("uid", response.data.uid);
                        //console.log("loginCtrl", response.data.uid);
                        var url = '/tab/personCenter?uid=' + response.data.uid;
                        $location.url(url);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
    })
    .controller('updatePasswordCtrl', function ($scope, $http, $rootScope) {
        document.title = "忘记密码";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.checked = false;
        $scope.codeText = "获取验证码";
        $scope.nowtime = 60;
        $scope.setTime = function () {
            if ($scope.nowtime == 0) {
                clearInterval($scope.shut);
                $scope.checked = false;
                $scope.codeText = "重新获取";
                $scope.$apply();
            } else {
                $scope.nowtime--;
                $scope.codeText = "(" + $scope.nowtime + "S)重新获取";
                $scope.$apply();
            }
        };

        $scope.do_send_found_code = function () {
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, mobile: $scope.mobile},
                url: "../index.php/yungouapi/member/do_send_found_code"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.checked = true;
                        $scope.nowtime = 60;
                        $scope.shut = setInterval($scope.setTime, 1000);
                        $rootScope.showAlert("验证码发送成功");
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.do_save_new_password = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            if (isNull($scope.password)) {
                $rootScope.showAlert("请输入密码");
                return;
            }
            if ($scope.password.length < 6 || $scope.password.length > 12) {
                $rootScope.showAlert("密码长度不在规定范围内");
                return;
            }
            if (isNull($scope.code)) {
                $rootScope.showAlert("请输入验证码");
                return;
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    mobile: $scope.mobile,
                    password: $scope.password,
                    code: $scope.code
                },
                url: "../index.php/yungouapi/member/do_save_new_password"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $('#updateModal').modal('show');
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
    })
    .controller('rigisterCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "注册";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.checked = false;
        $scope.codeText = "获取验证码";
        $scope.backTo = function () {
            window.history.go(-1);
        };

        var su = getCookie('su');
        var sk = getCookie('sk');

        $scope.nowtime = 60;
        $scope.setTime = function () {
            if ($scope.nowtime == 0) {
                clearInterval($scope.shut);
                $scope.checked = false;
                $scope.codeText = "重新获取";
                $scope.$apply();
            } else {
                $scope.nowtime--;
                $scope.codeText = "(" + $scope.nowtime + "S)重新获取";
                $scope.$apply();
            }
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.do_send_mobile_code = function () {
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, mobile: $scope.mobile},
                url: "../index.php/yungouapi/member/do_send_mobile_code"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $scope.checked = true;
                        $scope.nowtime = 60;
                        $scope.shut = setInterval($scope.setTime, 1000);
                        $rootScope.showAlert("验证码发送成功");
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.yaoqing = $location.search()['yaoqing'];

        $scope.do_register = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            var checkbox = document.getElementById("optionsRigister");
            if (!checkbox.checked) {
                $rootScope.showAlert("您还没有同意服务协议");
                return;
            }
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            if (isNull($scope.password)) {
                $rootScope.showAlert("请输入密码");
                return;
            }
            if ($scope.password.length < 6 || $scope.password.length > 12) {
                $rootScope.showAlert("密码长度不在规定范围内");
                return;
            }
            if (isNull($scope.inputCode)) {
                $rootScope.showAlert("请输入验证码");
                return;
            }
            if (isNull($scope.yaoqing)) {
                $scope.yaoqing = "";
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    mobile: $scope.mobile,
                    password: $scope.password,
                    code: $scope.inputCode,
                    yaoqing: $scope.yaoqing,
                    su: su,
                    sk: sk
                },
                url: "../index.php/yungouapi/member/do_register"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $("#rigisterModal").modal();
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
    })
    .controller('searchCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "搜索商品";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.goSearch = function ($event) {
            /*$($event.target).css('box-shadow', '0 0 15px #000');
             setTimeout(function(){
             $($event.target).css('box-shadow', 'none');
             }, 160);*/
            if (isNull($scope.keywords)) {
                $rootScope.showAlert("请输入要搜索的关键字");
            } else {
                $location.url("/tab/searchResult?keywords=" + $scope.keywords);
            }
        };

        $scope.wordList = [];

        $scope.get_search_hot_words = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/index/get_search_hot_words"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.wordList = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_search_hot_words();
    })
    .controller('searchResultCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "搜索结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").show();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_search_result").height($(window).height() - 80);

            $scope.mScroll = new iScroll("scroller_search_result", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.do_search($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.searchList = [];

        $scope.keywords = $location.search()['keywords'];

        $scope.do_search = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    keywords: $scope.keywords,
                    page: page,
                    size: size
                },
                url: "../index.php/yungouapi/goods/do_search"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            $scope.searchList = response.data;
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.searchList = $scope.searchList.concat(response.data);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                        $scope.searchList.total = 0;
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.do_search(1, 10);
    })
    .controller('personCenterCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "个人中心";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $scope.uid = $location.search()['uid'];
        var type = $location.search()['type'];
        $scope.isHost = false;
        $scope.exit = function () {
            delCookie("holdUID");
            $rootScope.holdUID = "";
            //$rootScope.showAlert("退出成功");
            $location.url("/tab/home");
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.get_member_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);

            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid},
                url: "../index.php/yungouapi/member/get_member_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.userInfo = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_member_center = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid},
                url: "../index.php/yungouapi/member/get_member_center"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.userInfo = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        /////////////////////////////////////////////
        if ($location.search()['source'] == 'weixin') {
            var wx_sign = $location.search()['wx_sign'];
            var wx_key = "YYZL89LaEB54,@%888";
            var site_sign = $.md5($scope.uid + wx_key);
            if (wx_sign == site_sign) {
                $rootScope.holdUID = $scope.uid;
                addCookie("holdUID", $rootScope.holdUID, 0);
            }
        }

        if ($scope.uid != $rootScope.holdUID) {
            $scope.isHost = false;
            $scope.get_member_center();
        } else {
            $scope.isHost = true;
            if (type == 'other') {
                $scope.isHost = false;
            }
            ;

            $scope.get_member_info();
        }
    })
    .controller('rechargeRecordCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "充值记录";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_recharge_record").height($(window).height() - 85);

            $scope.mScroll = new iScroll("scroller_recharge_record", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_member_recharge_records($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.uid = $location.search()['uid'];
        $scope.recordList = [];

        $scope.get_member_recharge_records = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid, page: page, size: size},
                url: "../index.php/yungouapi/member/get_member_recharge_records"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data) {
                                $scope.recordList = response.data;
                                if ($scope.recordList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.recordList = $scope.recordList.concat(response.data);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_member_recharge_records(1, 10);
    })
    .controller('winningRecordCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "中奖记录";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_winning_record").height($(window).height() - 45);

            $scope.mScroll = new iScroll("scroller_winning_record", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_member_win_records($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.uid = $location.search()['uid'];
        if ($scope.uid != $rootScope.holdUID) {
            $scope.flag = false;
        } else {
            $scope.flag = true;
        }

        $scope.winningRecordList = [];

        $scope.get_member_win_records = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid, page: page, size: size},
                url: "../index.php/yungouapi/member/get_member_win_records"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data) {
                                $scope.winningRecordList = response.data;
                                if ($scope.winningRecordList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.winningRecordList = $scope.winningRecordList.concat(response.data);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_member_win_records(1, 10);
    })
    .controller('snatchRecordCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "夺宝记录";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();

        $scope.noData = false;

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_snatch_record").height($(window).height());

            $scope.mScroll = new iScroll("scroller_snatch_record", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_duobao_list($scope.page, $scope.size, $scope.type);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }

                }
            });
        };

        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.isSelected1 = true;
        $scope.isSelected2 = false;
        $scope.isSelected3 = false;
        $scope.type = 0;
        $scope.setSelectedItem = function (num) {
            if (num == 1) {
                $scope.isSelected1 = true;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.type = 0;
            } else if (num == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
                $scope.type = 1;
            } else if (num == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
                $scope.type = 2;
            }
            $scope.page = 1;
            $scope.get_duobao_list($scope.page, $scope.size, $scope.type);
        };
        $scope.backTo = function () {
            window.history.go(-1);
        };

        $scope.uid = $location.search()['uid'];
        $scope.recordListProgress = [];
        $scope.countDown = [];
        $scope.recordListFinished = [];

        if ($scope.uid != $rootScope.holdUID) {
            $scope.buyState = "跟买";
        } else {
            $scope.buyState = "追加";
        }

        $scope.get_duobao_list = function (page, size, type) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            console.log($scope.uid);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $scope.uid,
                    page: page,
                    size: size,
                    type: type
                },
                url: "../index.php/yungouapi/member/get_duobao_list"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            $scope.recordListProgress = [];
                            $scope.countDown = [];
                            $scope.recordListFinished = [];
                        }
                        if (!response.data) {
                            $scope.noData = true;
                            hideLoading();
                            return;
                        } else {
                            $scope.noData = false;
                        }
                        for (var i = 0; i < response.data.list.length; i++) {
                            if (response.data.list[i].tag == 0) {
                                $scope.recordListFinished.push(response.data.list[i]);
                            } else if (response.data.list[i].tag == 1) {
                                response.data.list[i].title = response.data.list[i].shopname;
                                $scope.recordListProgress.push(response.data.list[i]);
                            } else if (response.data.list[i].tag == 2) {
                                $scope.countDown.push(response.data.list[i]);
                            }

                        }
                        if (page == 1) {
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.list.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_duobao_list($scope.page, $scope.size, $scope.type);
    })
    .controller('rechargeCtrl', function ($scope, $http, $rootScope) {
        document.title = "充值";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);
        $scope.isSelected1 = true;
        $scope.isSelected2 = false;
        $scope.isSelected3 = false;
        $scope.isSelected4 = false;
        $scope.isSelected5 = false;
        $scope.setSelectedItem = function (num) {
            if (num == 1) {
                $scope.isSelected1 = true;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.isSelected5 = false;
            } else if (num == 2) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = true;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.isSelected5 = false;
            } else if (num == 3) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = true;
                $scope.isSelected4 = false;
                $scope.isSelected5 = false;
            } else if (num == 4) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = true;
                $scope.isSelected5 = false;
            } else if (num == 5) {
                $scope.isSelected1 = false;
                $scope.isSelected2 = false;
                $scope.isSelected3 = false;
                $scope.isSelected4 = false;
                $scope.isSelected5 = true;
            }
        };
        $scope.backTo = function () {
            window.history.go(-1);
        };

        $scope.setNumber = function () {
            if (isNull($scope.money) || $scope.money <= 0) {
                $scope.money = 1;
            }
        };

        $scope.payClass = [];

        $scope.do_get_pay_class = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/cart/do_get_pay_class"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        /*for (var i = 0; i <= response.data.length; i--) {


                         if (response.data[i].pay_class == 'alipay') {
                         response.data[i].pay_name = "爱贝支付";
                         break;
                         };
                         };*/
                        //console.log(response.data);
                        $scope.payClass = response.data;
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.wap_add_money = function (type) {
            if ($scope.isSelected1) {
                $scope.money = 20;
            }
            if ($scope.isSelected2) {
                $scope.money = 50;
            }
            if ($scope.isSelected3) {
                $scope.money = 100;
            }
            if ($scope.isSelected4) {
                $scope.money = 200;
            }
            if (isNull($scope.money)) {
                $rootScope.showAlert("请选择或输入要充值的金额");
                return;
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);

            if (type == 'wxpay') {

                var url = "../index.php/yungouapi/cart/wap_add_money?data=";

                var ss = '{"partner":"' + partner + '","timestamp":"' + timestamp + '","sign":"' + sign + '","uid":"' + $rootScope.holdUID + '","money":"' + $scope.money + '","pay_type":"' + type + '"}';
                //var s = '{"partner":"'+partner+'",'"timestamp":"'+timestamp+'","sign":"+sign+"','uid':'"+$rootScope.holdUID+"','money':'"+$scope.money+"','pay_type':'"+type+"'}";
                url = url + ss;
                window.location.href = url;
                return false;

            }

            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $rootScope.holdUID,
                    money: $scope.money,
                    pay_type: type
                },
                url: "../index.php/yungouapi/cart/wap_add_money"
            })
                .success(function (response, status, headers, config) {
                    /* var str = JSON.stringify(response);
                     console.log("---", str);
                     return false;*/
                    if (response.status == "1") {
                        //支付宝调用

                        if (type == 'alipay') {
                            $("#resultDisplay").html(response.data);

                        } else if (type == 'iapppay') {
                            window.location.href = response.data;
                        }

                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.confirmPay = function ($event) {
            /*$($event.target).css('box-shadow', '0 0 15px #000');
             setTimeout(function(){
             $($event.target).css('box-shadow', 'none');
             }, 160);*/
            var radios = document.getElementsByName("optionsRadios");
            var tag = 0;
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    tag = 1;
                    $scope.wap_add_money(radios[i].value);
                    break;
                }
            }
            if (tag == 0) {
                $rootScope.showAlert("请选择一种支付方式");
            }
        };
        $scope.do_get_pay_class();
    })
    .controller('personalInfoCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "个人资料";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/personCenter?uid=" + $scope.uid);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.uid = $location.search()['uid'];

        $scope.get_member_center = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid},
                url: "../index.php/yungouapi/member/get_member_center"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.userInfo = response.data;
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_member_center();
    })
    .controller('addressCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "地址管理";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/personalInfo?uid=" + $scope.uid);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.addAddress = function () {
            if ($scope.userAddress.length > 4) {
                $rootScope.showAlert("最多只能添加5条地址");
                return;
            }
            $location.url("/tab/addAddress?uid=" + $scope.uid);
        };

        $scope.uid = $location.search()['uid'];
        $scope.userAddress = [];

        $scope.get_member_address = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid},
                url: "../index.php/yungouapi/member/get_member_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if (response.data) {
                            $scope.userAddress = response.data;
                        }
                        if ($scope.userAddress.length == 0) {
                            $scope.noData = true;
                        }
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.get_member_address();
    })
    .controller('addAddressCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "添加地址";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.isSelected = true;
        $scope.default = 1;
        $scope.setSelectedItem = function () {
            if ($scope.isSelected) {
                $scope.isSelected = false;
                $scope.default = 0;
            } else {
                $scope.isSelected = true;
                $scope.default = 1;
            }
        };
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.uid = $location.search()['uid'];
        $scope.flag = $location.search()['flag'];

        $scope.showLocation = function (province, city, town) {
            var loc = new Location();
            var title = ['省份', '地级市', '市、县、区'];
            $.each(title, function (k, v) {
                title[k] = '<option value="">' + v + '</option>';
            });

            $('#loc_province').append(title[0]);
            $('#loc_city').append(title[1]);
            $('#loc_town').append(title[2]);

            $('#loc_province').change(function () {
                $('#loc_city').empty();
                $('#loc_city').append(title[1]);
                loc.fillOption('loc_city', '0,' + $('#loc_province').val());
                $('#loc_town').empty();
                $('#loc_town').append(title[2]);
                $scope.sheng = $("#loc_province option:selected").text();
            });

            $('#loc_city').change(function () {
                $('#loc_town').empty();
                $('#loc_town').append(title[2]);
                loc.fillOption('loc_town', '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
                $scope.shi = $("#loc_city option:selected").text();
            });

            $('#loc_town').change(function () {
                $scope.xian = $("#loc_town option:selected").text();
            });

            if (province) {
                loc.fillOption('loc_province', '0', province);

                if (city) {
                    loc.fillOption('loc_city', '0,' + province, city);

                    if (town) {
                        loc.fillOption('loc_town', '0,' + province + ',' + city, town);
                    }
                }

            } else {
                loc.fillOption('loc_province', '0');
            }
        };

        $scope.isSave = false;

        $scope.do_save_member_address = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            if (isNull($scope.shouhuoren)) {
                $rootScope.showAlert("收货人不能为空");
                return;
            }
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("收货人手机号码不能为空");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            if (isNull($scope.sheng)) {
                $rootScope.showAlert("请选择省份");
                return;
            }
            if (isNull($scope.shi)) {
                $rootScope.showAlert("请选择城市");
                return;
            }
            if (isNull($scope.xian)) {
                $rootScope.showAlert("请选择地区");
                return;
            }
            if (isNull($scope.jiedao)) {
                $rootScope.showAlert("请输入街道号");
                return;
            }
            if ($scope.isSave) {
                return;
            }
            $scope.isSave = true;
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $scope.uid,
                    shouhuoren: $scope.shouhuoren,
                    mobile: $scope.mobile,
                    sheng: $scope.sheng,
                    shi: $scope.shi,
                    xian: $scope.xian,
                    jiedao: $scope.jiedao,
                    default: $scope.default
                },
                url: "../index.php/yungouapi/member/do_save_member_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if ($scope.flag == "address") {
                            $rootScope.showAlert("添加成功");
                            window.history.go(-1);
                        } else {
                            $location.url("/tab/address?uid=" + $scope.uid);
                        }

                    } else {
                        $scope.isSave = false;
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    $scope.isSave = false;
                    hideLoading();
                });
        };

        $scope.showLocation();
    })
    .controller('updateNicknameCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "修改昵称";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.uid = $location.search()['uid'];

        $scope.do_mod_username = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            if (isNull($scope.username)) {
                $rootScope.showAlert("昵称不能为空");
                return;
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid, username: $scope.username},
                url: "../index.php/yungouapi/member/do_mod_username"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $location.url("/tab/personalInfo?uid=" + $scope.uid);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
    })
    .controller('updatePhoneCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "修改手机号码";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);
        $scope.checked = false;
        $scope.codeText = "获取验证码";
        $scope.nowtime = 60;
        $scope.setTime = function () {
            if ($scope.nowtime == 0) {
                clearInterval($scope.shut);
                $scope.checked = false;
                $scope.codeText = "重新获取";
                $scope.$apply();
            } else {
                $scope.nowtime--;
                $scope.codeText = "(" + $scope.nowtime + "S)重新获取";
                $scope.$apply();
            }
        };

        $scope.uid = $location.search()['uid'];

        $scope.send_mod_mobile_code = function () {
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入新手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $scope.uid, mobile: $scope.mobile},
                url: "../index.php/yungouapi/member/send_mod_mobile_code"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.checked = true;
                        $scope.nowtime = 60;
                        $scope.shut = setInterval($scope.setTime, 1000);
                        $rootScope.showAlert("验证码发送成功");
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.do_save_mobile = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("请输入新手机号码");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            if (isNull($scope.code)) {
                $rootScope.showAlert("请输入验证码");
                return;
            }
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $scope.uid,
                    mobile: $scope.mobile,
                    code: $scope.code
                },
                url: "../index.php/yungouapi/member/do_save_mobile"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $location.url("/tab/personalInfo?uid=" + $scope.uid);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
    })
    .controller('shareDetailCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "晒单详情";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.sd_id = $location.search()['sd_id'];

        if ($location.search()['come'] == "Android" || $location.search()['come'] == "IOS") {
            $scope.notNative = false;
            $("#footbar").hide();

            setTimeout(function () {
                connectWebViewJavascriptBridge(function (bridge) {
                    /* Init your app here */
                    bridge.init(function (message, responseCallback) {
                        if (responseCallback) {
                            responseCallback("Right back atcha")
                        }
                    });

                    var button = document.getElementById('native_user');
                    button.onclick = function () {
                        //test.preventDefault();
                        bridge.callHandler('goBackPersonalCenterVC', {'': ''}, function (response) {

                        })
                    };

                    var button1 = document.getElementById('native_product');
                    button1.onclick = function () {
                        //test.preventDefault();
                        bridge.callHandler('goToShangPinXqVC', {'productId': $scope.shareData.sd_shopid}, function (response) {

                        })
                    }
                });
            }, 500);

        } else {
            $scope.notNative = true;
            $("#shareDetailContent").css("margin-top", "45px");
        }

        $scope.get_shaidan_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, sd_id: $scope.sd_id},
                url: "../index.php/yungouapi/goods/get_shaidan_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.shareData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_shaidan_info();
    })
    .controller('newProd', function ($scope, $http, $rootScope) { // 即将揭晓
        $("#headerId").hide();
        //$("#shopList").show();

        document.title = "即将揭晓";

        // 返回历史
        $scope.backTo = function () {
            window.history.go(-1);
        };

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_ten_list").height($(window).height() - 45);

            $scope.mScroll = new iScroll("scroller_ten_list", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_ten_yuan_list($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };

        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.goodsList = [];

        // todo 获取最新揭晓
        $scope.get_will_goods = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            //$scope.goodsList = [];
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size},
                url: "../index.php/yungouapi/index/get_will_goods"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data.list) {
                                $scope.goodsList = response.data.list;
                                if ($scope.goodsList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.goodsList = $scope.goodsList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_will_goods(1, 10);


    })

    .controller('tenListCtrl', function ($scope, $http, $rootScope) {
        document.title = "十元专区";
        $("#headerId").hide();
        $("#shopList").show();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.noData = false;

        $scope.page = 1;
        $scope.size = 10;
        $scope.mScroll = "";
        $scope.isPullUp = false;
        $scope.haveMore = false;
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#scroller_ten_list").height($(window).height() - 45);

            $scope.mScroll = new iScroll("scroller_ten_list", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {
                    if (this.y <= (this.maxScrollY - 60)) {
                        $scope.isPullUp = true;
                    }
                },
                onScrollEnd: function () {
                    if ($scope.isPullUp && $scope.haveMore) {
                        $scope.page++;
                        $scope.isPullUp = false;
                        $scope.get_ten_yuan_list($scope.page, $scope.size);
                    }
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        $scope.goodsList = [];

        $scope.get_ten_yuan_list = function (page, size) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            //$scope.goodsList = [];
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size},
                url: "../index.php/yungouapi/index/get_ten_yuan_list"
            }).success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        if ($scope.page == 1) {
                            if (response.data.list) {
                                $scope.goodsList = response.data.list;
                                if ($scope.goodsList.length == 0) {
                                    $scope.noData = true;
                                }
                            } else {
                                $scope.noData = true;
                            }
                            setTimeout(function () {
                                $scope.initIScroll();
                            }, 500);
                        } else {
                            $scope.goodsList = $scope.goodsList.concat(response.data.list);
                            setTimeout(function () {
                                $scope.mScroll.refresh();
                            }, 500);
                        }
                        if (response.data.length == $scope.size) {
                            $scope.haveMore = true;
                        } else {
                            $scope.haveMore = false;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_ten_yuan_list(1, 10);
    })
    .controller('shopListCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "夺宝单";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();

        if ($rootScope.shopList.length == 0) {
            $scope.isEmpty = true;
        } else {
            $scope.isEmpty = false;
        }
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.mScroll = "";
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#shop_content").height($(window).height() - 90);

            $scope.mScroll = new iScroll("shop_content", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {

                },
                onScrollEnd: function () {
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        setTimeout(function () {
            $scope.initIScroll();
        }, 100);

        $scope.price = 0;
        for (var i = 0; i < $rootScope.shopList.length; i++) {
            $scope.price += $rootScope.shopList[i].num;
        }

        $scope.setNumber = function (index) {
            if ($rootScope.shopList[index].wap_ten == 10) {
                if ($rootScope.shopList[index].num < 10) {
                    $rootScope.shopList[index].num = 10;
                } else if ($rootScope.shopList[index].num > ($rootScope.shopList[index].zongrenshu - $rootScope.shopList[index].canyurenshu)) {
                    $rootScope.shopList[index].num = $rootScope.shopList[index].zongrenshu - $rootScope.shopList[index].canyurenshu;
                } else if ($rootScope.shopList[index].num % 10 > 0) {
                    $rootScope.shopList[index].num = Math.ceil($rootScope.shopList[index].num / 10) * 10;
                }
            } else {
                if ($rootScope.shopList[index].num < 1) {
                    $rootScope.shopList[index].num = 1;
                } else if ($rootScope.shopList[index].num > ($rootScope.shopList[index].zongrenshu - $rootScope.shopList[index].canyurenshu)) {
                    $rootScope.shopList[index].num = $rootScope.shopList[index].zongrenshu - $rootScope.shopList[index].canyurenshu;
                }
            }

            $scope.price = 0;
            for (var i = 0; i < $rootScope.shopList.length; i++) {
                $scope.price += $rootScope.shopList[i].num;
            }
            addCookie("shopList", JSON.stringify($rootScope.shopList), 0);
        };

        $scope.backTo = function () {
            window.history.go(-1);
        };

        $scope.plus = function (index) {
            if (($rootScope.shopList[index].num + $rootScope.shopList[index].wap_ten) <= ($rootScope.shopList[index].zongrenshu - $rootScope.shopList[index].canyurenshu)) {
                $rootScope.shopList[index].num += $rootScope.shopList[index].wap_ten;
                $scope.price += $rootScope.shopList[index].wap_ten;
            }
            addCookie("shopList", JSON.stringify($rootScope.shopList), 0);
        };
        $scope.subtract = function (index) {
            if ($rootScope.shopList[index].num - $rootScope.shopList[index].wap_ten > 0) {
                $rootScope.shopList[index].num -= $rootScope.shopList[index].wap_ten;
                $scope.price -= $rootScope.shopList[index].wap_ten;
            }
            addCookie("shopList", JSON.stringify($rootScope.shopList), 0);
        };
        $scope.del = function (index) {
            $scope.price = $scope.price - $rootScope.shopList[index].num;
            $rootScope.shopList.splice(index, 1);
            if ($rootScope.shopList.length == 0) {
                $scope.isEmpty = true;
            } else {
                $scope.isEmpty = false;
            }
            addCookie("shopList", JSON.stringify($rootScope.shopList), 0);
        };

        $scope.addToCart = function () {
            if ($scope.isEmpty) {
                return;
            }
            if (isNull($rootScope.holdUID)) {
                $location.url("/tab/login");
            } else {
                $location.url("/tab/pay");
            }
        };

    })
    .controller('payCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "支付订单";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.mScroll = "";
        $scope.initIScroll = function () {
            if ($scope.mScroll instanceof iScroll) {
                $scope.mScroll.destroy();
            }
            $("#pay_content").height($(window).height() - 90);

            $scope.mScroll = new iScroll("pay_content", {
                hScrollbar: false,
                vScrollbar: false,
                onScrollMove: function () {

                },
                onScrollEnd: function () {
                    if (this.y < -800) {
                        $('#proId').show();
                    } else {
                        $('#proId').hide();
                    }
                }
            });
        };
        $('#proId').click(function () {
            $scope.mScroll.scrollTo(0, 0, 0);
        });

        setTimeout(function () {
            $scope.initIScroll();
        }, 100);

        $scope.price = 0;
        for (var i = 0; i < $rootScope.shopList.length; i++) {
            $rootScope.shopList[i].num = Math.ceil($rootScope.shopList[i].num);
            $scope.price += $rootScope.shopList[i].num;
        }

        $scope.payClass = [];

        $scope.do_get_pay_class = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign},
                url: "../index.php/yungouapi/cart/do_get_pay_class"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $scope.payClass = response.data;
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.get_member_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/member/get_member_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.money = response.data.money;
                        if ($scope.money > 0) {
                            $("#optionsCheck").attr("checked", true);
                            $scope.enough = true;
                            $scope.price_wait = $scope.price - $scope.money;
                            if ($scope.price_wait < 0) {
                                $scope.price_wait = 0;
                            }
                            if ($scope.money >= $scope.price) {
                                $scope.isEnough = true;
                            } else {
                                $scope.isEnough = false;
                                $scope.do_get_pay_class();
                            }
                        } else {
                            $scope.price_wait = $scope.price;
                            $("#optionsCheck").attr("disabled", true);
                            $scope.enough = false;
                            $scope.do_get_pay_class();
                        }
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $("#optionsCheck").click(function () {
            if (document.getElementById("optionsCheck").checked) {
                $scope.price_wait = $scope.price - $scope.money;
                if ($scope.price_wait < 0) {
                    $scope.price_wait = 0;
                }
            } else {
                $scope.price_wait = $scope.price;
            }
            $scope.$apply();
        });

        $scope.confirmPay = function () {
            var checkbox = document.getElementById("optionsCheck");
            var radios = document.getElementsByName("optionsRadios");
            var tag = 0;
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    tag = 1;
                    if (checkbox.checked) {
                        $location.url("/tab/payResult?type=" + radios[i].value + "&is_yue=1");
                    } else {
                        $location.url("/tab/payResult?type=" + radios[i].value + "&is_yue=0");
                    }
                    break;
                }
            }
            if (tag == 0) {
                if (checkbox.checked) {
                    if ($scope.money < $scope.price) {
                        $rootScope.showAlert("余额不足，请选择一种支付方式");
                    } else {
                        $location.url("/tab/payResult?type=" + "&is_yue=1");
                    }
                } else {
                    $rootScope.showAlert("请选择一种支付方式");
                }
            }
        };

        $scope.get_member_info();

    })
    .controller('calculationCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "计算结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $scope.isUp = true;
        $scope.setUpDown = function () {
            if ($scope.isUp) {
                $scope.isUp = false;
            } else {
                $scope.isUp = true;
            }
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];

        $scope.get_calc_details = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                url: "../index.php/yungouapi/goods/get_calc_details"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.calData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_calc_details();

    })
    .controller("payResultStateCtrl", function ($scope, $http, $location, $rootScope) {
        document.title = "支付结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/home");
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.isFaild = false;
        $scope.isSuccess = false;
        $scope.isChongSuccess = false;
        $scope.isChongFaild = false;

        $scope.type = $location.search()['type'];
        $scope.code = $location.search()['code'];
        $uid = $rootScope.holdUID;
        $scope.get_pay_state = function () {
            $http({
                method: 'POST',
                data: {code: $scope.code, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/cart/get_pay_state2"
            })
                .success(function (response, status, headers, config) {
                    //$rootScope.showAlert(response.status_type);  1--支付   2---充值
                    if (response.status == 1) {
                        if (response.pay_state == 1) {
                            $rootScope.shopList = [];
                            delCookie("shopList");
                            $scope.isSuccess = true;
                            $rootScope.showAlert(response.message);
                            $scope.resultData = response.data;
                        } else {
                            $rootScope.shopList = [];
                            $scope.isFaild = true;
                            $rootScope.showAlert(response.message);
                        }
                    } else {
                        if (response.pay_state == 1) {
                            $rootScope.shopList = [];
                            $scope.isChongSuccess = true;
                            $rootScope.showAlert(response.message);
                        } else {
                            $rootScope.shopList = [];
                            $scope.isChongFaild = true;
                            $rootScope.showAlert(response.message);
                        }
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        }
        $scope.get_pay_state();
    })
    .controller('payReCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "支付结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/home");
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.isFaild = false;
        $scope.isSuccess = false;
        $scope.isChongSuccess = false;
        $scope.isChongFail = false;

        $scope.type = $location.search()['type'];
        $scope.is_yue = $location.search()['is_yue'];
        $scope.code = $location.search()['code'];
        $uid = $rootScope.holdUID;
        $scope.get_pay_state = function () {
            $http({
                method: 'POST',
                data: {code: $scope.code, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/cart/get_pay_state"
            })
                .success(function (response, status, headers, config) {
                    //$rootScope.showAlert(response.status_type);
                    if (response.status == 1) {
                        if (response.status_type == 2) {
                            $scope.isFaild = true;
                        } else if (response.status_type == 3) {
                            $scope.isChongSuccess = true;
                        } else {
                            $scope.isSuccess = true;
                        }
                        $rootScope.shopList = [];
                        delCookie("shopList");

                        $scope.resultData = response.data;
                    } else {
                        $rootScope.shopList = [];
                        delCookie("shopList");
                        $scope.isFaild = true;
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        }
        $scope.get_pay_state();
    })
    .controller('payResultCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "支付结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/home");
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.isFaild = false;
        $scope.isSuccess = false;

        $scope.type = $location.search()['type'];
        $scope.is_yue = $location.search()['is_yue'];
        $scope.code = $location.search()['code'];

        $scope.wap_do_pay = function (type, isYue) {
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            var info = "";
            for (var i = 0; i < $rootScope.shopList.length; i++) {
                info += $rootScope.shopList[i].id + "," + $rootScope.shopList[i].num + "|";
            }
            if (info != "") {
                info = info.substring(0, info.length - 1);
            }
            showLoading();
            if (type == 'wxpay') {
                var url = "../index.php/yungouapi/cart/wap_do_pay?data=";
                var ss = '{"partner":"' + partner + '","timestamp":"' + timestamp + '","sign":"' + sign + '","uid":"' + $rootScope.holdUID + '","info":"' + info + '","pay_type":"' + type + '","is_yue":"' + isYue + '"}';
                //var s = '{"partner":"'+partner+'",'"timestamp":"'+timestamp+'","sign":"+sign+"','uid':'"+$rootScope.holdUID+"','money':'"+$scope.money+"','pay_type':'"+type+"'}";
                url = url + ss;
                window.location.href = url;
                delCookie("shopList");
                return false;

            }
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $rootScope.holdUID,
                    info: info,
                    pay_type: type,
                    is_yue: isYue
                },
                url: "../index.php/yungouapi/cart/wap_do_pay"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     console.log(str);
                     return false;*/
                    if (response.status == "1") {
                        if (response.status_type == "2") {
                            if (type == 'alipay') {
                                $("#resultPay").html(response.data);
                            } else {
                                window.location.href = response.data;
                            }
                            /*$("#resultPay").html(response.data);
                             setTimeout(function(){
                             document.forms['alipaysubmit'].submit();
                             }, 500);*/

                        } else if (response.status_type == "1") {
                            $rootScope.shopList = [];
                            delCookie("shopList");
                            $scope.isSuccess = true;
                            $scope.resultData = response.data;
                        }
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else if (response.status == "2") {
                        if (response.status_type == "1") {
                            $rootScope.shopList = [];
                            $scope.isChongSuccess = true;
                            $rootScope.showAlert(response.message);
                        } else {
                            $rootScope.shopList = [];
                            $scope.isChongFaild = true;
                            $rootScope.showAlert(response.message);
                        }
                    } else {
                        $rootScope.shopList = [];
                        delCookie("shopList");
                        $scope.isFaild = true;
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.do_get_shoplist = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, code: $scope.code, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/cart/do_get_shoplist"
            })
                .success(function (response, status, headers, config) {
                    $rootScope.shopList = [];
                    delCookie("shopList");
                    if (response.status == "1") {
                        $scope.isSuccess = true;
                        $scope.resultData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        if (isNull($scope.code)) {
            $scope.wap_do_pay($scope.type, $scope.is_yue);
        } else if ($scope.code == 0) {
            $rootScope.shopList = [];
            delCookie("shopList");
            $scope.isFaild = true;
        } else {
            $scope.do_get_shoplist();
        }

    })
    .controller('winningDetailCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "中奖确认";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];

        $scope.get_win_records_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/member/get_win_records_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.winningInfo = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.do_confirm_receiving = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, rid: $scope.id, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/member/do_confirm_receiving"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $rootScope.showAlert(response.message);
                        window.location.reload();
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.get_member_address = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $rootScope.holdUID},
                url: "../index.php/yungouapi/member/get_member_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        if (response.data) {
                            $rootScope.showAlert(response.data, 1, $scope.id);
                        } else {
                            $rootScope.showAlert("还没有收货地址，请添加");
                            $location.url("/tab/addAddress?uid=" + $rootScope.holdUID);
                        }
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.confirmReceive = function () {
            $rootScope.confirmMsg = "确定已收货了吗？";
            $('#confirmModal').modal('show');
        };

        $scope.confirmAddress = function () {
            $scope.get_member_address();
        };

        $('#confirmModal').on('hide.bs.modal', function () {
            if ($rootScope.holdState == 1) {
                $rootScope.holdState = 0;
                $scope.do_confirm_receiving();
            }
        });

        $scope.get_win_records_info();

    })
    .controller('updateAddressCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "修改地址";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.isSelected = true;
        $scope.default = 1;
        $scope.setSelectedItem = function () {
            if ($scope.isSelected) {
                $scope.isSelected = false;
                $scope.default = 0;
            } else {
                $scope.isSelected = true;
                $scope.default = 1;
            }
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);
        $scope.backTo = function () {
            window.history.go(-1);
        };

        $scope.id = $location.search()['id'];

        $scope.showLocation = function (province, city, town) {
            var loc = new Location();
            var title = ['省份', '地级市', '市、县、区'];
            $.each(title, function (k, v) {
                title[k] = '<option value="">' + v + '</option>';
            });

            $('#loc_province').append(title[0]);
            $('#loc_city').append(title[1]);
            $('#loc_town').append(title[2]);

            $('#loc_province').change(function () {
                $('#loc_city').empty();
                $('#loc_city').append(title[1]);
                loc.fillOption('loc_city', '0,' + $('#loc_province').val());
                $('#loc_town').empty();
                $('#loc_town').append(title[2]);
                $scope.sheng = $("#loc_province option:selected").text();
            });

            $('#loc_city').change(function () {
                $('#loc_town').empty();
                $('#loc_town').append(title[2]);
                loc.fillOption('loc_town', '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
                $scope.shi = $("#loc_city option:selected").text();
            });

            $('#loc_town').change(function () {
                $scope.xian = $("#loc_town option:selected").text();
            });

            if (province) {
                loc.fillOption('loc_province', '0', province);

                if (city) {
                    loc.fillOption('loc_city', '0,' + province, city);

                    if (town) {
                        loc.fillOption('loc_town', '0,' + province + ',' + city, town);
                    }
                }

            } else {
                loc.fillOption('loc_province', '0');
            }
        };

        $scope.isSave = false;

        $scope.do_save_member_address = function ($event) {
            /*$($event.target).css('color', '#db3652');
             setTimeout(function(){
             $($event.target).css('color', '#0079fe');
             }, 160);*/
            if (isNull($scope.shouhuoren)) {
                $rootScope.showAlert("收货人不能为空");
                return;
            }
            if (isNull($scope.mobile)) {
                $rootScope.showAlert("收货人手机号码不能为空");
                return;
            } else if ($scope.mobile.length != 11) {
                $rootScope.showAlert("请输入有效的手机号码");
                return;
            } else {
                var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (!reg.test($scope.mobile)) {
                    $rootScope.showAlert("请输入有效的手机号码");
                    return;
                }
            }
            if (isNull($scope.sheng)) {
                $rootScope.showAlert("请选择省份");
                return;
            }
            if (isNull($scope.shi)) {
                $rootScope.showAlert("请选择城市");
                return;
            }
            if (isNull($scope.xian)) {
                $rootScope.showAlert("请选择地区");
                return;
            }
            if (isNull($scope.jiedao)) {
                $rootScope.showAlert("请输入街道号");
                return;
            }
            if ($scope.isSave) {
                return;
            }
            $scope.isSave = true;
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {
                    partner: partner,
                    timestamp: timestamp,
                    sign: sign,
                    uid: $rootScope.holdUID,
                    shouhuoren: $scope.shouhuoren,
                    mobile: $scope.mobile,
                    sheng: $scope.sheng,
                    shi: $scope.shi,
                    xian: $scope.xian,
                    jiedao: $scope.jiedao,
                    default: $scope.default,
                    id: $scope.id
                },
                url: "../index.php/yungouapi/member/do_save_member_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $location.url("/tab/address?uid=" + $rootScope.holdUID);
                    } else {
                        $scope.isSave = false;
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    $scope.isSave = false;
                    hideLoading();
                });
        };

        $scope.get_member_address = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $rootScope.holdUID, id: $scope.id},
                url: "../index.php/yungouapi/member/get_member_address"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $scope.shouhuoren = response.data.shouhuoren;
                        $scope.mobile = response.data.mobile;
                        $scope.sheng = response.data.sheng;
                        $scope.shi = response.data.shi;
                        $scope.xian = response.data.xian;
                        $scope.jiedao = response.data.jiedao;
                        if (response.data.is_default == "Y") {
                            $scope.default = 1;
                            $scope.isSelected = true;
                        } else {
                            $scope.default = 0;
                            $scope.isSelected = false;
                        }
                        $scope.setAddress($scope.sheng, $scope.shi, $scope.xian);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.setAddress = function (province, city, town) {
            var loc = new Location();
            var selectList = document.getElementById("loc_province");
            for (var i = 0; i < selectList.options.length; i++) {
                if (selectList.options[i].text == province) {
                    selectList.options[i].selected = true;
                    $('#loc_city').empty();
                    loc.fillOption('loc_city', '0,' + $('#loc_province').val());
                    break;
                }
            }

            var selectList1 = document.getElementById("loc_city");
            for (var j = 0; j < selectList1.options.length; j++) {
                if (selectList1.options[j].text == city) {
                    selectList1.options[j].selected = true;
                    $('#loc_town').empty();
                    loc.fillOption('loc_town', '0,' + $('#loc_province').val() + ',' + $('#loc_city').val());
                    break;
                }
            }

            var selectList2 = document.getElementById("loc_town");
            for (var k = 0; k < selectList2.options.length; k++) {
                if (selectList2.options[k].text == town) {
                    selectList2.options[k].selected = true;
                    break;
                }
            }
        };

        $scope.do_del_member_address = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, uid: $rootScope.holdUID, id: $scope.id},
                url: "../index.php/yungouapi/member/do_del_member_address"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        //$rootScope.showAlert(response.message);
                        $location.url("/tab/address?uid=" + $rootScope.holdUID);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };

        $scope.delAddress = function ($event) {
            /*$($event.target).css('color', '#656565');
             setTimeout(function(){
             $($event.target).css('color', '#DA3752');
             }, 160);*/
            $rootScope.confirmMsg = "确定删除本条收货地址吗？";
            $('#confirmModal').modal('show');
        };

        $('#confirmModal').on('hide.bs.modal', function () {
            if ($rootScope.holdState == 1) {
                $rootScope.holdState = 0;
                $scope.do_del_member_address();
            }
        });

        $scope.showLocation();
        $scope.get_member_address();
    })
    .controller('appProductInfoCtrl', function ($scope, $http, $location, $rootScope) {		//APP端商品图文详情
        document.title = "商品详情";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $("#footbar").hide();	//不显示底部广告
        $scope.backTo = function () {
            window.history.go(-1);
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];
        $scope.get_goods_pic_content = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                url: "../index.php/yungouapi/goods/get_goods_pic_content"
            })
                .success(function (response, status, headers, config) {
                    /*var str = JSON.stringify(response);
                     alert(str);*/
                    if (response.status == "1") {
                        $("#productInfoData").append(response.data.content);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_goods_pic_content();
    })
    .controller('appCalculationCtrl', function ($scope, $http, $location, $rootScope) {  //APP端计算详情
        document.title = "计算结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $("#footbar").hide();	//不显示底部广告
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $scope.isUp = true;
        $scope.setUpDown = function () {
            if ($scope.isUp) {
                $scope.isUp = false;
            } else {
                $scope.isUp = true;
            }
        }
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];

        $scope.get_calc_details = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                url: "../index.php/yungouapi/goods/get_calc_details"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.calData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_calc_details();

    })
    .controller('rechargeResultCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "支付结果";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            $location.url("/tab/home");
        };
        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.isFaild = false;
        $scope.isSuccess = false;

        $scope.ledou = $location.search()['ledou'];
        if ($scope.ledou == "-1") {
            $scope.isFaild = true;
        } else {
            $scope.isSuccess = true;
        }

    })
    .controller('agreementCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "服务协议";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

    })
    .controller('questionCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "常见问题";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

    })
    .controller('friendRebateCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "好友返利";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

    })
    .controller('inviteCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "邀请攻略";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

    })
    .controller('notificationCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "通知";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.get_article_list = function (page, size, type) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size, type: type},
                url: "../index.php/yungouapi/index/get_article_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.listData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_article_list(1, 20, 3);

    })
    .controller('discoverCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "发现";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.get_article_list = function (page, size, type) {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, page: page, size: size, type: type},
                url: "../index.php/yungouapi/index/get_article_list"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        $scope.listData = response.data;
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_article_list(1, 20, 1);

    })
    .controller('articleInfoCtrl', function ($scope, $http, $location, $rootScope) {
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

        $scope.id = $location.search()['id'];

        $scope.get_article_info = function () {
            showLoading();
            var partner = "ZLAPITOH5WAP";
            var timestamp = Date.parse(new Date()) / 1000;
            var sign = $.md5(partner + timestamp + key);
            $http({
                method: 'POST',
                data: {partner: partner, timestamp: timestamp, sign: sign, id: $scope.id},
                url: "../index.php/yungouapi/index/get_article_info"
            })
                .success(function (response, status, headers, config) {
                    if (response.status == "1") {
                        document.title = response.data.title;
                        $("#articleInfoData").append(response.data.content);
                        setTimeout(function () {
                            $("a").on("touchstart", function (e) {
                                $(e.target).addClass('box-shadow-style');
                            });
                            $("a").on("touchmove", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                            $("a").on("touchend", function (e) {
                                $(e.target).removeClass('box-shadow-style');
                            });
                        }, 500);
                    } else {
                        $rootScope.showAlert(response.message);
                    }
                    hideLoading();
                })
                .error(function (response, status, headers, config) {
                    hideLoading();
                });
        };
        $scope.get_article_info();

    })
    .controller('aboutCtrl', function ($scope, $http, $location, $rootScope) {
        document.title = "什么是一元神马购";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();

        setTimeout(function () {
            $("a").on("touchstart", function (e) {
                $(e.target).addClass('box-shadow-style');
            });
            $("a").on("touchmove", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
            $("a").on("touchend", function (e) {
                $(e.target).removeClass('box-shadow-style');
            });
        }, 500);

    })
    .controller('privacyCtrl', function ($scope, $http, $location, $rootScope) {		//ios需要的隐私声明
        document.title = "隐私声明";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();
    })
    .controller('protectCtrl', function ($scope, $http, $location, $rootScope) {		//ios需要的网络游戏和个人信息保护
        document.title = "信息保护";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();
    })
    .controller('termOfServiceCtrl', function ($scope, $http, $location, $rootScope) {		//ios 服务条款
        document.title = "服务条款";
        $('body').scrollTop(0);
        $("#headerId").hide();
        $("#shopList").hide();
        $scope.backTo = function () {
            window.history.go(-1);
        };
        $("#footbar").hide();
    });