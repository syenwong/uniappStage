/**
 * File Created by wangshuyan@cmhi.chinamobile.com at 2022/7/3.
 * Copyright 2022/7/3 CMCC Corporation Limited. * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * ZYHY Company. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license. *
 *
 * @Desc
 * @author wangshuyan@cmhi.chinamobile.com
 * @date 2022/7/3
 * @version */
const path = require('path');
exports.getProjectResPath = function (propath = '') {
    return path.resolve(__dirname, '../src/', propath);
};
exports.getRootResPath = function (propath = '') {
    return path.resolve(__dirname, propath);
};
