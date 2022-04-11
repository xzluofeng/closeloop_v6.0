/*
 * @Author: Jason Liu
 * @Date: 2022-03-10 10:38:11
 * @Desc: 
 */
import Vue from "vue";
import Router from "vue-router";
import findLast from "lodash/findLast";
import { notification } from "ant-design-vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { check, isLogin } from "@/utils/auth";

Vue.use(Router);

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [{
            path: "/",
            meta: { authority: ["user", "admin"] },
            component: resolve => require(['@/layouts/BasicLayout'], resolve),
            children: [
                // dashboard
                {
                    path: "/",
                    redirect: "/index.html"
                },
                {
                    path: "/index.html",
                    name: "index",
                    meta: { title: "医嘱" },
                    component: resolve => require(['@/views/doctors'], resolve)

                },
            ]
        }, {
            path: "/403",
            name: "403",
            hideInMenu: true,
            component: resolve => require(['@/views/403'], resolve),
        }, {
            path: "/sso",
            name: "sso",
            hideInMenu: true,
            component: resolve => require(['@/views/sso'], resolve),
        },
        {
            path: "*",
            name: "404",
            hideInMenu: true,
            component: resolve => require(['@/views/404'], resolve),
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
        NProgress.start();
    }
    const record = findLast(to.matched, record => record.meta.authority);
    if (record && !check(record.meta.authority)) {
        if (!isLogin() && to.path !== "/user/login") {
            next({
                path: "/user/login"
            });
        } else if (to.path !== "/403") {
            notification.error({
                message: "403",
                description: "你没有权限访问，请联系管理员咨询。"
            });
            next({
                path: "/403"
            });
        }
        NProgress.done();
    }

    next();
});

router.afterEach(() => {
    NProgress.done();
});

export default router;