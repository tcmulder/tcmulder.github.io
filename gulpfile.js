/*------------------------------------*\
    ::Zen Build
    -----------------------------------*
    ::version 2.0.9
\*------------------------------------*/

/*------------------------------------*\
    ::Plugins
\*------------------------------------*/
// initial
var gulp = require('gulp');

/*------------------------------------*\
    ::Configuration
\*------------------------------------*/
var config = require('./zen-config.js');

/*------------------------------------*\
    ::Task Definitions
\*------------------------------------*/

//css
gulp.task('css', function() {
    var stops = require('pipe-error-stop');
    var compass = require('gulp-compass');
    var sourcemaps = require('gulp-sourcemaps');
    var prefix = require('gulp-autoprefixer');
    var browserSync = require('browser-sync');

    gulp.src(config.sass.src+'*.scss')
        .pipe(stops(compass({
            sourcemap: true,
            quiet: true,
            css: config.sass.dest,
            sass: config.sass.src,
            image: config.sass.src+'../images',
            style: 'compressed',
            require: ['sass-globbing']
        }), {
            eachErrorCallback: function(){
                console.log('css task failure');
                browserSync.notify("SASS Compilation Error");
                browserSync.reload();
            }
        }))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(prefix('last 2 version', 'ie 10', 'ie 9'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('_site/css'))
        .pipe(gulp.dest(config.sass.dest+'css/'));
});

//js
for(var key in config.js) {
   gulp.task('js-'+key, function() {
        var stops = require('pipe-error-stop');
        var uglify = require('gulp-uglifyjs');
        var browserSync = require('browser-sync');

        var key = this.seq[0].split('-')[1];
        var destParts = config.js[key].dest.split('/');
        var destFile = destParts.pop();
        var destPath = destParts.join('/') + '/';

        gulp.src(config.js[key].src)
            .pipe(stops(uglify(destFile, {
                sourceRoot: config.url.root,
                outSourceMap: true
            }), {
                eachErrorCallback: function(){
                    browserSync.notify("JavaScript Compilation Error");
                    console.log('js task failure');
                }
            }))
            .pipe(gulp.dest(destPath))
            .pipe(browserSync.reload({stream:true}));
   });
}

//svg
for(var key in config.svg) {
    gulp.task('svg-'+key, function() {
        var svg = require('gulp-svg-sprite');
        var symlink = require('gulp-symlink');
        var gulpif = require('gulp-if');

        var key = this.seq[0].split('-')[1];
        var destParts = config.svg[key].dest.split('/');
        var destFile = destParts.pop();
        var destPath = destParts.join('/') + '/';
        if(destFile != ''){
            destPath = destPath + key + '-sprite/';
        }
        gulp.src(config.svg[key].src)
            .pipe(svg({
                mode: {
                    inline: true,
                    symbol: true
                },
                svg: {
                    xmlDeclaration: false
                }
            }))
            .pipe(gulp.dest(destPath))
            .pipe(gulpif(destFile != '', symlink(destPath + '../' + destFile, { force: true })));
    });
}

//jekyll
gulp.task('jekyll-build', function (done) {
    var cp = require('child_process');
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    var browserSync = require('browser-sync');
    browserSync.reload();
});

//db
// gulp.task('db-exp', function () {
//     var shell = require('gulp-shell');
//     return gulp.src('')
//         .pipe(shell([
//             'echo "database export called"',
//             'test -d '+config.db.local.dumpDir+' || mkdir '+config.db.local.dumpDir+'',
//             'mysqldump -h'+config.db.local.host+' -u'+config.db.local.user+' -p\''+config.db.local.pass+'\' '+config.db.local.name+' > '+config.db.local.dumpDir+config.db.local.dumpFile,
//             'ls -lah '+config.db.local.dumpDir+config.db.local.dumpFile+' | awk \'{ print "export ran: "$9" is "$5}\''
//         ].join('&&')));
// });
// gulp.task('db-drop-and-import', function () {
//     var shell = require('gulp-shell');
//     return gulp.src('')
//         .pipe(shell([
//             'echo "database import called"',
//             'mysqldump -h'+config.db.local.host+' -u'+config.db.local.user+' -p\''+config.db.local.pass+'\' --no-data '+config.db.local.name+' | grep ^DROP | mysql -h'+config.db.local.host+' -u'+config.db.local.user+' -p\''+config.db.local.pass+'\' '+config.db.local.name+'',
//             'mysql -h'+config.db.local.host+' -u'+config.db.local.user+' -p'+config.db.local.pass+' '+config.db.local.name+' < '+config.db.local.dumpDir+config.db.local.dumpFile,
//             'echo "import ran:"',
//             'mysql -h'+config.db.local.host+' -u'+config.db.local.user+' -p'+config.db.local.pass+' '+config.db.local.name+' -e \'SHOW TABLES\''
//         ].join('&&')));
// });
// gulp.task('db-far', ['db-drop-and-import'], function () {
//     var shell = require('gulp-shell');
//     var farCommand = '/Applications/MAMP/htdocs/_far/srdb.cli.php ';
//         farCommand += '-h\''+config.db.local.host+'\' ';
//         farCommand += '-u\''+config.db.local.user+'\' ';
//         farCommand += '-p\''+config.db.local.pass+'\' ';
//         farCommand += '-n\''+config.db.local.name+'\' ';
//         farCommand += '-s"'+'`mysql -h'+config.db.local.host+' -u'+config.db.local.user+' -p'+config.db.local.pass+' '+config.db.local.name+' -e "SELECT option_value FROM '+config.db.local.prefix+'options WHERE option_name=\'siteurl\'" | grep ^http`'+'" ';
//         farCommand += '-r\''+config.url.root+'\'';
//     return gulp.src('')
//         .pipe(shell([
//             'echo "database find and replaced called"',
//             farCommand
//         ].join('&&')));
// });
// gulp.task('db-imp', ['db-far']);

/*------------------------------------*\
    ::Watch
\*------------------------------------*/
gulp.task('watch', function(gulpCallback) {

    var isVagrant =  false;
    var browserSync = require('browser-sync');
    var os = require('os');
    var url = config.url.root;

    // add the IP address from vagrant since host detection seems faulty
    // see https://www.browsersync.io/docs/options/#option-host
    var theIP = os.networkInterfaces()["eth1"];
    if(theIP !== undefined){
        isVagrant = true;
        var url = 'http://'+theIP[0].address+'/sites/'+config.site.client+'/'+config.site.proj;
    }

    // start jekyll's server
    var shell = require('gulp-shell');
    gulp.src('').pipe(shell('jekyll serve --detach --no-watch'));

    browserSync.init({
        proxy: url,
        open: false,
        https: false//,
        // snippetOptions: {
        //     whitelist: ['/sites/'+config.site.client+'/'+config.site.proj+'/wp-admin/admin-ajax.php'], // whitelist checked first
        //     blacklist: ['/sites/'+config.site.client+'/'+config.site.proj+'/wp-admin/**']
        // }
    }, function callback() {

        // make watch slower for vagrant performance
        var intervalIncrease = 0;
        if(isVagrant){
            intervalIncrease = 1000;
        }

        //js watches
        for(var key in config.js){
           gulp.watch(config.js[key].src, {
                interval: 100 + intervalIncrease, // default 100
                debounceDelay: 500 + intervalIncrease, // default 500
                mode: 'poll'
            }, ['js-'+key]);
        }

        // general file changes
        // gulp.watch(config.watch.src, {
        //     interval: 100 + intervalIncrease, // default 100
        //     debounceDelay: 500 + intervalIncrease, // default 500
        //     mode: 'poll'
        // },['html']);
        // .on(
        //     'change',
        //     browserSync.reload
        // );

        gulp.watch(['index.html', '_includes/*.html', '_layouts/*.html', '*.md', '_posts/*'], ['jekyll-rebuild']);

        //css watch
        gulp.watch(config.sass.src+'**/*.scss',{
            interval: 100 + intervalIncrease, // default 100
            debounceDelay: 500 + intervalIncrease, // default 500
            mode: 'poll'
        },['css']);

        gulp.watch(config.sass.dest+'/_site/css/style.css', function() {
        gulp.src(config.sass.dest+'/_site/css/style.css')
            .pipe(browserSync.stream());
        });

        gulpCallback();

    });

});

/*------------------------------------*\
    ::Task Combinations
\*------------------------------------*/
gulp.task('default', ['watch']);

/*------------------------------------*\
    ::Exit
\*------------------------------------*/
function exitHandler(options, err) {
    console.log('Attempting to close Jekyll server');
    var shell = require('gulp-shell');
    gulp.src('').pipe(shell('ps aux | grep jekyll | grep -v grep | awk "{print $2}" | xargs kill -9'));
    process.exit();
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler); //catches ctrl+c event
