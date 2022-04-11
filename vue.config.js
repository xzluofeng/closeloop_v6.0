/*
 * @Author: Jason Liu
 * @Date: 2021-03-09 13:39:48
 * @Desc: 脚手架初始化
 */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const CompressionPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

function resolve(dir) {
    return path.join(__dirname, dir);
}

const projectName = 'closedCycle'
// vue.config.js
const vueConfig = {
    publicPath: process.env.NODE_ENV == "development" ? "/" : `/${projectName}/`,
    // pages: platform.appPage,
    configureWebpack: {
        performance: { hints: false },
        plugins: [
            // Ignore all locale files of moment.js
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            // 复制自定义的静态资源
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, "./static"),
                to: "./static",
                ignore: [".*"]
            }]),
            new webpack.ProvidePlugin({})
        ]
    },
    chainWebpack: config => {
        config.resolve.alias
            .set("@$", resolve("src"))
            .set("@api", path.resolve(__dirname, "./src/api"));
        // if (process.env.NODE_ENV === 'production') {
        //     config.plugin('compression-webpack-plugin')
        //         .use(new CompressionPlugin({
        //             filename: '[path].gz[query]',
        //             //algorithm: 'gzip',
        //             test: productionGzipExtensions,
        //             threshold: 10240, //对超过10k的数据进行压缩
        //             minRatio: 0.8,
        //             deleteOriginalAssets: true //删除源文件
        //         })).end();
        // }
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true
            }
        }
    },
    devServer: {
        // development server port 8000
        port: 8081,
        open: true,
        // If you want to turn on the proxy
        // mock service添加的服务,通过run_service.bat启动，启动前注意安全相关依赖包
        proxy: {
            "/winning": {
                target: "http://127.0.0.1:8765/api/v1/",
                changeOrigin: true,
                pathRewrite: {
                    '^/winning': ""
                },
            },
        }

    },
    // disable source map in production，是否源代码压缩映射map文件
    productionSourceMap: process.env.NODE_ENV === 'development',
    lintOnSave: false,
    outputDir: "closedCycle",
    // babel-loader no-ignore node_modules/*
    transpileDependencies: [],
    // Solution For Issue:You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
    // zhengkai.blog.csdn.net
    runtimeCompiler: true,
    filenameHashing: true
};

module.exports = {
    ...vueConfig
};