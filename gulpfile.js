var gulp        = require('gulp');         // Подключаем Gulp
    sass        = require('gulp-sass');    //Подключаем Sass пакет,
    browserSync = require('browser-sync'); // Подключаем Browser Sync
    concat      = require('gulp-concat'); // Подключаем gulp-concat (для конкатенации файлов)
    uglify      = require('gulp-uglifyjs');// Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano     = require('gulp-cssnano'); // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'); // Подключаем библиотеку для переименования файлов
    del         = require('del'); // Подключаем библиотеку для удаления файлов и папок
    imagemin    = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
    cache       = require('gulp-cache'); // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
    htmlmin      = require('gulp-htmlmin');//Подключаем пакет для минификации HTML
    Promise     = require('es6-promise').Promise; // Подключаем библиотеку PostCSS нужна для работы с Node.js 0.10 
	 
gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('app/sass/**/*.+(scss|sass)')
        .pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('app/css')) // Выгружаем результат в папку app/css
        .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('scripts', function() {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',  // jQuery
        'app/libs/jquery-knob/dist/jquery.knob.min.js'  // Knob

        ])
        .pipe(concat('libs.min.js'))  // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js'));  // Выгружаем в папку app/js
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('clear', function() {
    return cache.clearAll(); // Чистим Cache
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('app/css/main.css')  // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('minify', function() { //Минифицируем  Html и переносим  в продакшен
  return gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('watch', ['browser-sync','css-libs','scripts'], function() {
    gulp.watch('app/sass/**/*.+(scss|sass)',['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('build', ['clean','minify','img','sass', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/*.min.css'
         ])
    .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

});
gulp.task('default', ['watch']);