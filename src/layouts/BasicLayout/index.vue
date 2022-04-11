<!--
 * @Author: Jason Liu
 * @Date: 2022-03-10 10:49:24
 * @Desc: 基础模板
-->
<template>
  <a-layout class="basic_layout">
    <a-spin :spinning="loading" size="large" tip="数据加载中...">
      <a-layout-header class="basic_header">
        <img :src="require('@/assets/icon/icon_closed_cycle.svg')" alt="" />
        闭环管理系统
      </a-layout-header>
      <a-row class="user_detail_info">
        <a-col class="user_panl">
          <a-avatar size="large" icon="user" />
          <span class="col_text"> {{ patientInfo.brxxkJz.hzxm }}</span>
          <span class="col_text">{{ patientInfo.brxxkJz.xbmc }}</span>
          <span class="col_text">{{ patientInfo.cycw || "-" }}床</span>
          <span class="col_text"
            >{{ GetAge(patientInfo.brxxkJz.birth) }}岁</span
          >
        </a-col>
        <!-- <a-col :span="4"> </a-col> -->
        <a-col class="diagnosis_panl">
          <span class="col_t">
            诊断：
            <span class="col_text">{{ patientInfo.zdmc || "-" }}</span>
          </span>
          <span class="col_t">
            主治医师：<span class="col_text">{{
              patientInfo.jzysmc || "-"
            }}</span>
          </span>
          <span class="col_t"
            >科室：<span class="col_text">{{ patientInfo.ksmc || "-" }}</span>
          </span>
          <span class="col_t"
            >住院号：<span class="col_text">{{
              patientInfo.brxxkJz.blh || "-"
            }}</span>
          </span>
          <span class="col_t"
            >入院日期：<span class="col_text">{{
              patientInfo.jzkssj || "-"
            }}</span>
          </span>
        </a-col>
      </a-row>
      <a-layout-content class="app_container">
        <router-view></router-view>
      </a-layout-content>
    </a-spin>
    <div v-watermark="{ text: watermark }"></div>
  </a-layout>
</template>

<script>
export default {
  data() {
    return {
      patientInfo: { brxxkJz: {} }, //患者信息
      loading: false,
      watermark: undefined,
    };
  },
  created() {
    //获取用户登录信息
    this.loading = true;
    $api
      .getToken({
        usercode: this.$route.query.usercode || this.$route.query.ysdm,
        yljgdm: this.$route.query.yljgdm,
      })
      .then((user) => {
        this.watermark = user.watermark;
        let param = this.$route.query;
        param.yexh = this.$route.query.yexh || "0";
        $api.getPatientInfo(param).then((req) => {
          this.patientInfo = req.data || { brxxkJz: {} };
        });
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    /**
     * @Author: Jason Liu
     * @description: 根据出身日期获取年龄
     */
    GetAge(strBirthday) {
      if (strBirthday) {
        var returnAge,
          strBirthdayArr = strBirthday.split("-"),
          birthYear = strBirthdayArr[0],
          birthMonth = strBirthdayArr[1],
          birthDay = strBirthdayArr[2],
          d = new Date(),
          nowYear = d.getFullYear(),
          nowMonth = d.getMonth() + 1,
          nowDay = d.getDate();
        if (nowYear == birthYear) {
          returnAge = 0; //同年 则为0周岁
        } else {
          var ageDiff = nowYear - birthYear; //年之差
          if (ageDiff > 0) {
            if (nowMonth == birthMonth) {
              var dayDiff = nowDay - birthDay; //日之差
              if (dayDiff < 0) {
                returnAge = ageDiff - 1;
              } else {
                returnAge = ageDiff;
              }
            } else {
              var monthDiff = nowMonth - birthMonth; //月之差
              if (monthDiff < 0) {
                returnAge = ageDiff - 1;
              } else {
                returnAge = ageDiff;
              }
            }
          } else {
            returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
          }
        }
        return returnAge; //返回周岁年龄 }
      } else {
        return "-";
      }
    },
  },
};
</script>

<style lang="less" scoped>
.basic_layout {
  background: #fff;
  min-width: 1000px;
  overflow: auto;
  .basic_header {
    height: 52px;
    line-height: 52px;
    background: linear-gradient(90deg, #003fc9 0%, #0e5dce 100%);
    padding: 0 24px;

    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
    img {
      width: 24px;
      height: 24px;
      margin-right: 3px;
      vertical-align: text-bottom;
    }
  }

  .user_detail_info {
    background: #fff;
    text-align: left;
    margin: 17px 20px;
    height: 56px;
    line-height: 56px;
    box-shadow: 0px 0px 18px 0px #e5e6e8;
    border-radius: 4px;
    padding: 0 20px 0 24px;
    white-space: nowrap; //超出强制不换行
    overflow: hidden; // 超出隐藏处理
    display: flex;
    justify-content: space-around;
    .ant-avatar-lg {
      width: 35px;
      height: 35px;
      line-height: 35px;
    }

    .user_panl {
      flex: 20%;
      text-align: left;
      span.col_text {
        font-weight: bold;
        font-size: 16px;
        font-weight: bold;
        color: #000000;
        margin-left: 16px;
      }
    }
    .diagnosis_panl {
      flex: 80%;
      text-align: right;
      // float: right;

      span.col_t {
        padding-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.6);
      }
      span.col_text {
        font-size: 14px;
        font-weight: 400;
        color: #000000;
      }
    }
  }
  .app_container {
    background: #fff;
    margin: 0 20px;
    float: left;
  }
}
</style>
