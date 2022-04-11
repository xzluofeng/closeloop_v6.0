/*
 * @Author: Jason Liu
 * @Date: 2022-03-15 10:31:27
 * @Desc: 
 */


import axios from 'axios'
import modal from 'ant-design-vue/es/message'


axios.defaults.withCredentials = true;
// 创建 axios 实例
const service = axios.create({
    timeout: 6000000, // 请求超时时间
    baseURL: appService.base,
    headers: { "content-type": "multipart/form-data;" }
})

const err = error => {
    if (error.response) {
        const data = error.response.data;
        if (error.response.status === 403) {
            modal.error({
                content: data.message,
                centered: true
            })
        }
        if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
            modal.error({
                    content: "Authorization verification failed",
                    centered: true
                })
                //TODO:没有登录权限的操作
        }
    }
    return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
    const token = $storage.get("Bearer");
    if (token) {
        config.headers['Authorization'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
    }
    return config
}, err)

// response interceptor
service.interceptors.response.use(response => {
    if (response.data instanceof Blob) {
        return response.data
    } else {
        try {
            const message = response.data.message;
            switch (`${response.data.status}`) {
                case '200':
                    return response.data
                case '401':
                    //TODO:没有权限的操作
                    return Promise.resolve(message || response)
                case '500':
                    // modal.error({
                    //     content: message,
                    //     centered: true
                    // })
                    return Promise.reject(message || response)
                default:
                    modal.error({
                        content: message,
                        centered: true
                    })
                    return Promise.reject(message || response)
            }
        } catch (err) {
            return Promise.reject(err.message)
        }
    }
}, err => {
    // notification.error({ message: 'system hint', description: err.message })
    return Promise.reject(err)
})

export default service;