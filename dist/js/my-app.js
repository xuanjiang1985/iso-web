const dataUrl = "http://192.168.31.107:8080"
// Initialize your app
var myApp = new Framework7({
    cache: true,
    precompileTemplates: true
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true

});
//toolbar active
$$('.link').click(function(){
    $$('.link').removeClass('active');
    $$(this).addClass('active');
});

$$("img").click(function(){
        var src = $$(this).attr('data-src');
        //console.log("img");
        srcs = src.split('|');
        var myPhotoBrowser = myApp.photoBrowser({
            photos: srcs
        });
        myPhotoBrowser.open();
});

myApp.onPageInit('index', function (page) {
    $$("img").click(function(){
        var src = $$(this).attr('src');
        console.log("img");
        var myPhotoBrowser = myApp.photoBrowser({
            photos: [src]
        });
        myPhotoBrowser.open();
    });
});


myApp.onPageInit('message', function (page) {
    $$("#msg-button").click(function(){
        var val = $$("#msg-input").val();
        var str = val.replace(/\ +/g,"");
        if(val == "" || str == ""){
            $$("#msg-input").val("").attr("placeholder","我需要内容...");
            return false;
        }
        //ajax post content
        $$.ajax({
            method:"post",
            url: dataUrl + "/msg",
            dataType:"json",
            data: {"content":val},
            success: function(data){
                mainView.router.loadPage("chat.html");
            },
            error: function(data){
                console.log(data);
            }
        })
    });
});

myApp.onPageAfterAnimation('chat', function (page) {
    $$.get(dataUrl + '/msg?skip=0',function(data){
            //console.log(data)
            var obj = eval('(' + data + ')');
            //console.log(obj);
            var content = "";
            $$.each(obj.data,function(key,val){
            content += '<div class="img-block">' +
                            '<div class="msg-user">匿名用户 ' + val.Created_at + '</div>' +
                            '<div>' + val.Content +'</div>' +
                        '</div>';
            });
            $$("#msg-list").append(content);
        });
    //无限滚动
    var loading = false;
    $$('.infinite-scroll').on('infinite', function () {
     
      // 如果正在加载，则退出
      if (loading) return;
     
      // 设置flag
      loading = true;

      var lastIndex = $$('#msg-list .img-block').length;
      $$.get(dataUrl + '/msg?skip=' + lastIndex, function(data){
                //console.log(data)
                var obj = eval('(' + data + ')');
                //console.log(obj);
                var content = "";
                var arr = obj.data;
                if (arr == null) {
                     // 加载完毕，则注销无限加载事件，以防不必要的加载
                      myApp.detachInfiniteScroll($$('.infinite-scroll'));
                      // 删除加载提示符
                      $$('.infinite-scroll-preloader').remove();
                      return;
                }
                $$.each(arr, function(key,val){
                content += '<div class="img-block">' +
                                '<div class="msg-user">匿名用户 ' + val.Created_at + '</div>' +
                                '<div>' + val.Content +'</div>' +
                            '</div>';
                });
                $$("#msg-list").append(content);
            });
        loading = false; 
    });
});
// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
        $$.get(dataUrl + '/test',function(data){
            console.log(data)
            var obj = eval('(' + data + ')');
            $$('h4').html('$' + obj.book.price);
            console.log(obj.age);
            console.log(obj.book);
            console.log(obj);

        });

});
//template
var hasLoginHTML = Template7.templates.hasLoginTemplate({
                    'header': dataUrl + localStorage.getItem('userHeader'),
                    'name': localStorage.getItem('userName'),
                });
var notLoginHTML = Template7.templates.notLoginTemplate();
//if login
myApp.onPageInit('user', function (page) {
    createLoginPage();
    $$("#btn-login").click(function(){
        var phone = $$("#login-form input[name=phone]").val();
        var password = $$("#login-form input[name=password]").val();
        if (phone.length == 0) {
            myApp.alert('手机号不能为空;','错误');
            return;
        }
        if (password.length == 0) {
            myApp.alert('密码不能为空;','错误');
            return;
        }
        //ajax post login
        myApp.showIndicator();
        $$.ajax({
            method:"post",
            url: dataUrl + "/login",
            dataType:"json",
            data: {"phone":phone,"password":password},
            success: function(data){
                myApp.hideIndicator();
                if (data.code != 200){
                    myApp.alert(data.msg,'错误');
                    return;
                }
                localStorage.setItem('login', 1);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('userHeader', data.userHeader);
                localStorage.setItem('userId', data.userId);
                hasLoginHTML = Template7.templates.hasLoginTemplate({
                    'header': dataUrl + data.userHeader,
                    'name': data.userName,
                });
                createLoginPage();
            },
            error: function(data){
                myApp.hideIndicator();
                myApp.alert(data.textStatus,'错误');
            }
        });

    });
    $$("#btn-logout").click(function(){
        localStorage.removeItem('login');
        localStorage.setItem('token', '');
        createLoginPage();
    });
});

function createLoginPage(){
    if (localStorage.getItem('login')) {
        $$("#btn-logout").show();
        $$("#btn-login").hide();
        $$("#forget-psd").hide();
        $$("#login-page").html(hasLoginHTML);
        changeNameEvent();
    } else {
        $$("#btn-login").show();
        $$("#btn-logout").hide();
        $$("#forget-psd").show();
        $$("#login-page").html(notLoginHTML);
    }
}

function changeNameEvent() {
    $$('#change-name').on('click', function () {
        myApp.prompt('','修改昵称', function (value) {
            if(value.length == 0 || value.replace(/\ +/g,"") == "") {
                myApp.alert("昵称不能为空","错误");
                return 
            }
            $$.ajax({
                method:"get",
                url: dataUrl + "/v1/change-name",
                dataType:"json",
                headers: {'Authorization':'Bearer ' + localStorage.getItem('token')},
                data: {"name": value,"userId":localStorage.getItem('userId')},
                success: function(data){
                    if (data.code != 200) {
                        myApp.alert(data.msg,'错误');
                        return
                    }
                    localStorage.setItem('userName', data.userName);
                    $$('#change-name').text(data.userName);
                },
                error: function(data){
                    myApp.alert("服务器错误",'错误');
                }
           });
        });
    });
}
//register html
myApp.onPageInit('register', function (page) {
    $$("#btn-register").click(function(){
        var phone = $$("#register-form input[name=phone]").val();
        var password = $$("#register-form input[name=password]").val();
        var password2 = $$("#register-form input[name=password2]").val();
        if (phone.length == 0) {
            myApp.alert('手机号不能为空;','错误');
            return;
        }
        if (password.length == 0) {
            myApp.alert('密码不能为空;','错误');
            return;
        }
        if (password2.length == 0) {
            myApp.alert('密码确认不能为空;','错误');
            return;
        }
        //ajax post login
        myApp.showIndicator();
        $$.ajax({
            method:"post",
            url: dataUrl + "/register",
            dataType:"json",
            data: {"phone":phone,"password":password,"password2":password2},
            success: function(data){
                myApp.hideIndicator();
                if (data.code != 200){
                    myApp.alert(data.msg,'错误');
                    return;
                }
                localStorage.setItem('login', 1);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('userHeader', data.userHeader);
                localStorage.setItem('userId', data.userId);
                hasLoginHTML = Template7.templates.hasLoginTemplate({
                    'header': dataUrl + data.userHeader,
                    'name': data.userName,
                });
                mainView.router.loadPage('user.html');
            },
            error: function(data){
                myApp.hideIndicator();
                myApp.alert(data.textStatus,'错误');
            }
        });
    });
});

// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}
