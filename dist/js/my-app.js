const dataUrl = "http://localhost:8080/"
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
        var src = $$(this).attr('src');
        console.log("img");
        var myPhotoBrowser = myApp.photoBrowser({
            photos: [src]
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

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
        $$.get(dataUrl + 'test',function(data){
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