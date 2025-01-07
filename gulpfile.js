const gulp = require("gulp");
const umd = require("gulp-umd");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const insert = require("gulp-insert");
const concat = require("gulp-concat");
const KarmaServer = require("karma").Server;
const path = require("path");
const filter = require("gulp-filter");
const webserver = require("gulp-webserver");

// Build: Dev Task
function buildDev() {
    const f = filter(['*', '!untar-worker.js'], { restore: true });

    return gulp.src(["src/untar.js"])
        .pipe(sourcemaps.init())
        .pipe(insert.append("\nworkerScriptUri = '/base/build/dev/untar-worker.js';"))
        .pipe(gulp.src(["src/ProgressivePromise.js", "src/untar-worker.js"]))
        .pipe(insert.prepend('"use strict";\n'))
        .pipe(f)
        .pipe(umd({
            dependencies: (file) => {
                if (path.basename(file.path) === "untar.js") {
                    return ["ProgressivePromise"];
                }
                return [];
            },
            exports: (file) => path.basename(file.path, path.extname(file.path)),
            namespace: (file) => path.basename(file.path, path.extname(file.path)),
        }))
        .pipe(f.restore)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("build/dev"));
}

// Build: Dist Task
function buildDist() {
    return gulp.src("src/untar-worker.js")
        .pipe(sourcemaps.init())
        .pipe(insert.prepend('"use strict";\n'))
        .pipe(uglify())
        .pipe(insert.transform((contents) => {
            const str = [
                '\nworkerScriptUri = (window||this).URL.createObjectURL(new Blob(["',
                contents.replace(/\\/g, "\\\\").replace(/"/g, '\\"'),
                '"]));'
            ];
            return str.join("");
        }))
        .pipe(gulp.src(["src/ProgressivePromise.js", "src/untar.js"]))
        .pipe(concat("untar.js"))
        .pipe(insert.prepend('"use strict";\n'))
        .pipe(umd({
            exports: () => "untar",
            namespace: () => "untar",
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("build/dist"));
}

// Test Task
function test(done) {
    new KarmaServer({
        configFile: __dirname + "/karma.conf.js",
        singleRun: true,
    }, done).start();
}

// Example Task
function example() {
    return gulp.src("./")
        .pipe(webserver({
            directoryListing: false,
            livereload: true,
            open: "example/",
            proxies: [{ source: "/base", target: "http://localhost:8000/" }],
            port: 8000,
        }));
}

// Default Task
gulp.task("default", gulp.series(buildDev, buildDist));

// Build Task
gulp.task("build", gulp.series(buildDev, buildDist));

// Test Task
gulp.task("test", gulp.series("build", test));

// Example Task
gulp.task("example", gulp.series(buildDev, example));

