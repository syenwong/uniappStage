/**
 * File Created by wangshuyan@cmhi.chinamobile.com at 2022/7/13.
 * Copyright 2022/7/13 CMCC Corporation Limited. * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * ZYHY Company. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license. *
 *
 * @Desc
 * @author wangshuyan@cmhi.chinamobile.com
 * @date 2022/7/13
 * @version */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const utils = require('./utils');
module.exports = function (config) {
    const webpackConfigEnties = {};
    const HtmlWebpackPlugins = [];
    const entry = (function () {
        const cwd = utils.getProjectResPath(config.projectSourcePath);
        const options = {
            cwd
        };
        let rootJs = 'index';
        let pages = 'pages';
        if (config.pages) {
            pages = config.pages.length > 1 ? `{${config.pages.join(',')}}` : config.pages[0];
        }
        if (config.rootHtml) {
            if (typeof config.rootHtml === 'string') {
                rootJs = config.rootHtml;
            } else if (Array.isArray(config.rootHtml)) {
                rootJs = `{${config.rootHtml.join(',')}}`;
            }
        }
        const files_pages = glob.sync(pages + '/**/index.js', options);
        const files_root = glob.sync(rootJs + '.js', options);
        const files = [...files_root, ...files_pages];
        const _entries = [];
        let entry;
        let dirname;
        let basename;
        for (let i = 0; i < files.length; i++) {
            entry = files[i];
            dirname = path.dirname(entry);
            basename = path.basename(entry, '.js');
            const entryContent = {
                content: [utils.getRootPath('common/index.js')],
                pathname: (dirname === '.' ? '' : dirname + '/') + basename,
                ejs: (glob.sync(dirname + '/' + basename + '.{ejs,html}', options))[0]
            };
            if (config.client === 'mobile') {
                entryContent.content.unshift(utils.getRootPath('common/clientMobile.js'));
            }
            if (config.serviceWorker) {
                entryContent.content.unshift(utils.getRootPath('common/installSw.js'));
            }
            if (fs.existsSync(`${cwd}/common/index.js`)) {
                entryContent.content.push(`${cwd}/common/index.js`);
            }
            entryContent.content.push(`${cwd}/${entry}`);
            _entries.push(entryContent);
        }
        return _entries;
    })();
    entry.forEach((e) => {
        if (e) {
            webpackConfigEnties[e.pathname] = e.content;
        }
        HtmlWebpackPlugins.push(new HtmlWebpackPlugin({
            /* main config */
            filename: `${e.pathname}.html`,
            template: e.ejs ? utils.getProjectResPath(config.projectSourcePath + '/' + e.ejs) : utils.getRootPath('/common/index.ejs'),
            /* paramters in ejs */
            title: config.title || '',
            eGuardName: config.eGuardName,
            /* other default config */
            publicPath: 'auto',
            inject: 'body',
            hash: config.resourceHash,//???????????? js ????????????????????? hash ??? <script type=text/javascript src=bundle.js?22b9692e22e7be37b57e></script>
            showErrors: true,//webpack ??????????????????
            minify: {//??? html ?????????????????????minify ??????????????????????????????????????? false ???????????????false, ??????????????? html ??????????????????
                removeComments: true, // ????????????
                collapseWhitespace: true //??????????????????
            },
            chunks: ['common', 'vendor', e.pathname], // ????????????????????????????????????
            chunksSortMode: 'auto'
        }));
    });
 
    return {
        webpackConfigEnties,
        HtmlWebpackPlugins
    };
};
