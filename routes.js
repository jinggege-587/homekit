/*global console*/
/**
 * 路由，含错误路由
 * @author luoweiping
 * @version 1.4.0(2014-04-28)
 * @since 0.1.0(2014-03-17)
 */
var main = require('./controllers/index'), mockup = require('./controllers/mockup'), util = require('./helper/util'), moment = require('moment');

/**
 * 路由，含错误路由
 * @param {Object} app Server对象
 * @return {void}
 * @author luoweiping
 * @version 1.4.0(2014-04-28)
 * @since 0.1.0(2014-03-17)
 */
module.exports = function (app) {
    //@formatter:off
    'use strict';
    //@formatter:on
    // app.get('*', function(req, res, next){
    // console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + ':' + util.getRemoteIp(req));
    // next();
    // });
    app.get('/', main.listFiles);
    //匹配mockup[/json]/xxx.json
    app.post(/\/mockup\/(json\/)?([\w\-]+\.json)/i, mockup.sendJson);
    app.get(/\/mockup\/(json\/)?([\w\-]+\.json)/i, mockup.sendJson);
    //匹配mockup/?q=xxx
    app.post('/mockup', mockup.sendData);
    app.get('/mockup', mockup.sendData);
    app.get(/\/([\w\W]+)(\.[shtml|html])?/i, main.getHtml);
    app.get(/\/([\w\-]+\.php)/i, main.getPhp);
    app.get('/build', main.build);
    app.get('/archive', main.listZip);
    app.get('/archive/:zipfile', main.downloadZip);
    app.get('/jslint', main.jslint);
    app.get('/jslint/data/errors/:jsonfile', main.jslintErrors);
    app.get('/jslint/data/source/:jsfile', main.jslintSource);
    app.get('/stat', main.listSloc);
    app.get('/stat/:version', main.showSloc);

    //错误路由:404
    app.use(function (req, res, next) {
        var err = new Error ('Not Found');
        err.status = 404;
        // console.log(moment(new Date ()).format('YYYY-MM-DD HH:mm:ss') + ' - ' + util.getRemoteIp(req) + ' - ' + req.method + ' 404 ' + decodeURIComponent(req.originalUrl || req.url) + ' - [Error]');
        next(err);
    });

    //错误路由:app.get('env') === 'development'
    app.use(function (err, req, res, next) {
        if (req.xhr) {
            res.status(err.status || 404).set('Content-type', 'application/json');
            res.send({
                status: err.status || 404,
                code: 1,
                message: err.message || 'Not Found'
            });
        } else {
            res.status(err.status || 404).set('Content-type', 'text/html');
            res.render('main/error.html', {
                status: err.status || 404,
                message: err.message || 'Not Found'
            });
        }
    });
};
