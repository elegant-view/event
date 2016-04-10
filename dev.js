var devServer = require('dev-server/lib/main');
devServer.start({
    rootPath: __dirname,
    babel: {
        include: [/^\/(test|src)\/.+\.js/],
        compileOptions: {
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-es2015-modules-amd']
        }
    }
});
