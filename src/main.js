/*
 * @Author: Jason Liu
 * @Date: 2022-03-10 09:45:34
 * @Desc: 
 */
import Vue from 'vue'
import App from './App.vue'
import 'babel-polyfill'
import router from "./router"; //主路由文件引入
import store from "./store"; //本地缓存服务引入
import "./assets/style.less"
//水印导入
import './directive/watermark'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Antd);
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

const $api = require("./api")

Vue.use(VXETable);

Vue.config.productionTip = false;

window.$api = Vue.prototype.$api = $api;

// localstorage封装
window.$storage = Vue.prototype.$storage = {
    /**
     * @Author: Jason Liu
     * @description: 设置缓存对象
     */
    set(name, info) {
        try {
            // 设置缓存数据
            if (typeof info === 'object') {
                info = JSON.stringify(info)
            }
            localStorage.setItem(name, info ? escape(info) : undefined)
        } catch {

        }
    },
    /**
     * @Author: Jason Liu
     * @description: 获取缓存对象
     */
    get(name, isjson = false) {
        let result = ''
        const loca = localStorage.getItem(name)
        if (loca) {
            result = unescape(loca)
            if (isjson) {
                result = result.toJson();
            }
        }
        return result
    },
    /**
     * @Author: Jason Liu
     * @description: 删除缓存对象
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch {

        }
    }
};

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')