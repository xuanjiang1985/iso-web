const dataUrl = "http://192.168.31.107:8080"
// Initialize your app
var myApp = new Framework7({
    cache: true
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
                console.log(data.status);
                mainView.router.loadPage("chat.html");
            },
            error: function(data){
                console.log(data);
            }
        })
    });
});


myApp.onPageInit('chat', function (page) {
    $$.get(dataUrl + '/msg?skip=0',function(data){
            //console.log(data)
            var obj = eval('(' + data + ')');
            //console.log(obj);
            var content = "";
            $$.each(obj.data,function(key,val){
            content += '<div class="img-block">' +
                            '<div class="msg-user">匿名用户 ' + val.created_at + '</div>' +
                            '<div>' + val.content +'</div>' +
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
                                '<div class="msg-user">匿名用户 ' + val.created_at + '</div>' +
                                '<div>' + val.content +'</div>' +
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
