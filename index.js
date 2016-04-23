/*jslint nomen:true es5:true*/
/*global console, process*/
/*global __dirname*/
/**
 * 网站总入口
 * @author luoweiping
 * @version 1.4.0(2014-06-11)
 * @since 0.1.0(2014-03-11)
 */
//@formatter:off
var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    /*RedisStore = require('connect-redis')(session),
    redis = require('redis'),
    redisCfg = require('./config/redis'),
    redisClient = redis.createClient(redisCfg.port, redisCfg.host),*/
    
    bodyParser = require('body-parser'),
    compress = require('compression'),
    less = require('less-middleware'),
    debug = require('debug'),
    ejs = require('ejs'),
    config = require('./config/core'),
    routes = require('./routes'),
    socketio = require('socket.io'),
    http = require('http'),
    app = express(),
    server,
    io,
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    cpuIdx;
//@formatter:on

/*redisClient.auth(redisCfg.passwd, function (err) {
    //@formatter:off
    'use strict';
    //@formatter:on
    if (err) {
        // throw err;
        console.log(err);
    }
});*/

//设置视图文件路径
app.set('views', path.join(__dirname, 'views'));
//修改模板后缀
app.set('view engine', 'html');
//设置ejs分隔符
ejs.open = '{{';
ejs.close = '}}';
//设置模板引擎
app.engine('.php', ejs.__express);
app.engine('.html', ejs.__express);
app.engine('.shtml', ejs.__express);
//设置favicon.ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//在console中输出访问日志
app.use(logger(':date - :remote-addr - :method :status :url - :response-time ms'));
app.use(compress());
//通过req.cookies调用cookie
// app.use(cookieParser(config.authCookieName));
// app.use(session({store:new RedisStore({client:redisClient}), key:'jsid', secret:config.sessionSecret}));
app.use(bodyParser());
// LESS编译
app.use(less({
    src: path.join(__dirname, 'public/less'),
    dest: path.join(__dirname, 'public/css'),
    prefix: '/css',
    force: true,
    compress: true
}));
//设置全局响应头
app.use(function (req, res, next) {
    //@formatter:off
    'use strict';
    //@formatter:on
    res.setHeader('Server', config.name + '/' + config.version);
    res.setHeader('X-Powered-By', 'luoweiping@eetop.com');
    next();
});
//静态文件路径，须在响应头设置之后，否则仍将为默认值
app.use(express.static(path.join(__dirname, 'public')));
//即时刷新功能，结合grunt watch任务使用
if (config.liveReload) {
    var liveReload = require('./helper/livereload');
    app.use(liveReload());
}
routes(app);

if (cluster.isMaster) {
    for ( cpuIdx = 0; cpuIdx < numCPUs; cpuIdx += 1) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        //@formatter:off
        'use strict';
        //@formatter:on
        console.log('worker ' + worker.process.pid + ' exit');
        process.nextTick(function () {
            cluster.fork();
        });
    });

    // watch只需要执行一次，所以放在主进程中
    require('./helper/watch').init(config);
    
} else {
    server = http.createServer(app);
    io = socketio.listen(server);
    require('./controllers/socket').initSocket(io);

    server.listen(config.port, config.host, function () {
        //@formatter:off
        'use strict';
        //@formatter:on
        console.log('Server listening on: ' + config.host + ', port ' + config.port);
    });
}

module.exports = app;