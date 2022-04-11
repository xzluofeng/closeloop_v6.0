/*
 * @Author: Jason Liu
 * @Date: 2022-03-15 10:30:29
 * @Desc: 
 */

const $axios = require("./axios").default;

/**
 * @Author: Jason Liu
 * @description: 获取用户token
 * @mock: usercode:winningTest yljgdm:0002
 */
export function getToken(params = {
    usercode: undefined, //用户工号
    yljgdm: undefined //医疗机构代码
}) {
    return $axios({
        url: `/token/getToken`,
        method: 'post',
        params: params
    }).then((req) => {
        $storage.set("Bearer", req.data.token);
        return req.data;
    });
}

/**
 * @Author: Jason Liu
 * @description: 获取患者信息
 */
export function getPatientInfo(params = {
    jzlsh: undefined, //就诊流水号
    yljgdm: undefined, //医疗机构代码
    jzlb: undefined, //就诊类别,
    yexh: undefined, //婴儿序号（0=大人，1=小孩)
    isCdr: undefined, //传0
    patid: undefined //患者ID
}) {

    return $axios({
        url: `/zyjzdjk/getPatientByJzlsh`,
        method: 'post',
        params: Object.assign({
            isCdr: 0
        }, params)
    })
}

/**
 * @Author: Jason Liu
 * @description: 获取闭环标题
 * http://localhost:8081/index?usercode=winningTest&yljgdm=0002&type=single&jzlsh=10197451&jzlb=1&yexh=0&syxh=10197451&xh=100001&cqlsbz=-1
 */
export function getTitle(params) {
    return $axios({
        url: `/cycle/getTitle`,
        method: 'post',
        params: Object.assign({
            yljgdm: undefined, //医疗机构代码
            syxh: undefined, //就诊流水号
            jzlb: undefined, //就诊类别
            yzxh: undefined, //闭环主键
            xh_type: 'lsh', //lsh或his_yzxh或his_cfmxxh或his_sqdxh
            cqlsbz: -1, //长期临时标志，-1=非医嘱，1=长期,0=临时
            patid: undefined, //患者ID
            type: undefined, //非医嘱传：  fyz@闭环类别代码  医嘱传：闭环类别代码，可不传
        }, params)
    })
}

/**
 * @Author: Jason Liu
 * @description: 获取闭环节点
 */
export function getNodeList(params) {
    return $axios({
        url: `/cycle/getNodeList`,
        method: 'post',
        params: Object.assign({
            yljgdm: undefined, //医疗机构代码
            syxh: undefined, //就诊流水号
            jzlb: undefined, //就诊类别
            yzxh: undefined, //闭环主键
            xh_type: 'lsh', //lsh或his_yzxh或his_cfmxxh或his_sqdxh
            cqlsbz: -1, //长期临时标志，-1=非医嘱，1=长期,0=临时
            patid: undefined, //患者ID
            type: undefined, //非医嘱传：  fyz@闭环类别代码  医嘱传：闭环类别代码，可不传
        }, params)
    })
}

/**
 * @Author: Jason Liu
 * @description: 集成调阅业务域菜单
 */
export function getBusinessDomains(params) {
    return $axios({
        url: `/cycle/getBusinessDomains`,
        method: 'post',
        params: Object.assign({
            yljgdm: undefined, //医疗机构代码
            jzlb: undefined, //就诊类别
            jzlsh: undefined, //就诊流水号
        }, params)
    })
}

/**
 * @Author: Jason Liu
 * @description: 
 */
export function getCyclePage(params) {
    return $axios({
        url: `/cycle/getCyclePage`,
        method: 'post',
        params: Object.assign({
            yljgdm: undefined, //医疗机构代码
            jzlb: undefined, //就诊类别
            jzlsh: undefined, //就诊流水号
            domainCode: undefined, //业务域编码
            modeTypes: undefined, //数据模型类型
            searchKey: undefined, //医嘱过滤条件
            start: 0, //页码（第一页从0开始）
            size: 10, //分页大小（例如：10、20）
        }, params)
    })
}