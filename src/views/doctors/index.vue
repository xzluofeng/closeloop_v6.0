<!--
 * @Author: Jason Liu
 * @Date: 2022-03-10 10:57:41
 * @Desc: 医嘱页面
-->
<template>
  <a-layout class="doctors_container">
    <a-layout-sider width="360px" v-if="pageType === 'hz'">
      <a-card class="doctor_ordered_container">
        <template slot="title">
          <a-radio-group
            v-model="domained.domainCode"
            @change="changeDomained"
            button-style="solid"
          >
            <a-radio-button
              v-for="(item, i) in domains"
              :key="i"
              :value="item.domainCode"
            >
              {{ item.domainName }}
            </a-radio-button>
          </a-radio-group>
        </template>
        <a-row class="title_header">
          <a-col :span="12"> <span class="title"> 医嘱列表：</span></a-col>
          <a-col :span="12">
            <a-input-search
              placeholder="请输入医嘱内容"
              v-model="pager.searchKey"
              @search="searchSoctor"
            />
          </a-col>
        </a-row>
        <vxe-table
          resizable
          show-overflow
          align="center"
          stripe
          :row-config="{ isCurrent: true, isHover: true }"
          :radio-config="{ labelField: 'yzxh', trigger: 'row' }"
          :data="orderedList"
          class="doctor_ordered_List"
          :loading="pager.loading"
          @cell-click="setCheckOrdered"
          :row-class-name="rowClassName"
        >
          <vxe-column field="yznr" title="医嘱内容"></vxe-column>
          <vxe-column field="startTime" title="开立时间"></vxe-column>
          <vxe-column field="type" title="类型" width="60">
            <template #default="{ row }">
              {{ row.cqlsbz === 1 ? "长期" : "临时" }}
            </template>
          </vxe-column>
        </vxe-table>
        <vxe-pager
          :layouts="['Total', 'PrevPage', 'Number', 'NextPage']"
          border
          :current-page="pager.page_no"
          :page-size="pager.page_size"
          :total="pager.total"
          @page-change="getOrderedList"
        >
        </vxe-pager>
      </a-card>
    </a-layout-sider>
    <a-layout-content>
      <a-spin :spinning="nodeLoading" size="large" tip="数据加载中...">
        <a-row class="title_header">
          <a-col :span="24">
            <span class="title">{{ titleInfo.cycleTypeName }}</span>
            <span>闭环</span>
            <span>当前</span>
            <span :class="theResultColor ? 'result_blue':'result_red'">【{{ node.debugStatus === 0?theResult:'-' }}】</span>
            <span>(开始时间：{{ titleInfo.cycleStartTime }})</span>
          </a-col>
        </a-row>
        <a-row class="title_info">
          <a-col :span="24">
            <span>
              {{ titleInfo.cycleTitle }}
            </span>
          </a-col>
        </a-row>
        <div class="doctors_process_body">
          <template v-if="node.debugStatus == 0">
            <div class="doctors_process">
              <template v-for="(item, i) in node.nodes">
                <div class="doctors_process_step" :key="i">
                  <a-timeline>
                    <template v-for="(node, j) in item">
                      <a-timeline-item :class="stepClassName(node)" :key="j">
                        <div slot="dot" class="i_step">{{ node.setp }}</div>
                        <p class="title">
                          {{ node.nodeName }}
                          <a-popover v-if="node.reverse" placement="bottom">
                            <template slot="title">
                              <div class="node_stop">
                                <p>{{ node.stop.nodeName }}</p>
                              </div>
                            </template>
                            <template slot="content">
                              <div class="node_stop">
                                <p>{{ node.stop.executeTime }}</p>
                                <p>
                                  {{
                                    node.stop.userName
                                  }}&nbsp;&nbsp;&nbsp;&nbsp;
                                  {{ node.stop.departmentName }}
                                </p>
                              </div>
                            </template>
                            <a-icon type="info-circle" class="i_warn" />
                          </a-popover>
                          <a-popover
                            v-if="node.subset.length > 1"
                            placement="bottom"
                          >
                            <template slot="content">
                              <div class="subset_list">
                                <a-row
                                  v-for="(sub, z) in node.subset"
                                  :key="z"
                                >
                                  <a-col :span="4" class="sub_no"
                                    >第{{ node.subset.length - z }}次</a-col
                                  >
                                  <a-col :span="10" class="sub_time">{{
                                    sub.executeTime || "-"
                                  }}</a-col>
                                  <a-col :span="4">{{
                                    sub.userName || "-"
                                  }}</a-col>
                                  <a-col :span="6">{{
                                    sub.departmentName || "-"
                                  }}</a-col>
                                </a-row>
                              </div>
                            </template>
                            <a>({{ node.subset.length }}次)</a>
                          </a-popover>
                        </p>
                        <p>{{ node.executeTime || "&nbsp;" }}</p>
                        <p>{{ node.userName || "&nbsp;" }}</p>
                        <p class="desc">
                          {{ node.departmentName || "&nbsp;" }}
                        </p>
                      </a-timeline-item>
                    </template>
                  </a-timeline>
                </div>
              </template>
            </div>
          </template>
          <template v-else>
            <a-result status="500" sub-title="该闭环正在调试中!">
              <template #extra> </template>
            </a-result>
          </template>
        </div>
      </a-spin>
    </a-layout-content>
  </a-layout>
</template>

<script>
export default {
  data() {
    return {
      pageType: "single",
      pager: {
        page_size: 10,
        page_no: 1,
        total: 0,
        searchKey: undefined,
        loading: false,
      },
      domained: {
        domainCode: undefined,
        domainName: undefined,
        modeTypes: [],
      },
      domains: [],
      orderedList: [],
      ordered: undefined, //选择的医嘱
      //标题信息
      titleInfo: {},
      nodeLoading: false,
      //闭环节点
      node: {
        debugStatus: 0, //调试状态， 0 ，正常展示，  1或者2， 不展示闭环的节点内容了，展示一个提示：  该闭环正在调试中!
        nodes: [], //流程节点
      },
      theResult: "-", //执行结果
      theResultColor: true
    };
  },
  created() {
    this.pageType = this.$route.query.type; //确认页面显示格式
    $api
        .getToken({
          usercode: this.$route.query.usercode||this.$route.query.ysdm,
          yljgdm: this.$route.query.yljgdm,
        })
        .then(() => {
          if (this.pageType === "hz") {
            //集成调阅模式
            this.getBusinessDomains(this.$route.query);
          } else {
            this.setCheckOrdered({ row: this.$route.query });
          }
        })
        .finally(() => {
          this.loading = false;
        });

  },
  methods: {
    /**
     * @Author: Jason Liu
     * @description: 获取闭环标题内容
     */
    getTitle(param) {
      return $api
        .getTitle(
          Object.assign(param, {
            cqlsbz: this.ordered.cqlsbz,
            jzlb: this.ordered.jzlb,
            jzlsh: this.ordered.jzlsh,
            syxh :this.ordered.jzlsh,
            type: this.ordered.type,
            xh_type: this.ordered.xhType||this.ordered.xh_type,
            yzxh: this.ordered.yzxh||this.ordered.xh,
          })
        )
        .then((req) => {
          return (this.titleInfo = req.data);
        });
    },
    /**
     * @Author: Jason Liu
     * @description: 获取闭环节点
     */
    getNodeList(param) {
      return $api
        .getNodeList(
          Object.assign(param, {
            cqlsbz: this.ordered.cqlsbz,
            jzlb: this.ordered.jzlb,
            jzlsh: this.ordered.jzlsh,
            type: this.ordered.type,
            xh_type: this.ordered.xhType||this.ordered.xh_type,
            yzxh: this.ordered.yzxh||this.ordered.xh,
          })
        )
        .then((req) => {
          if (req && req.data && req.data.nodes.length > 0 && req.data.debugStatus === 0) {
            //1、获取所有数据内容，同时将数据排序
            let nodes = req.data.nodes.sort((o, l) => {
              return o.sort - l.sort;
            });

            //2、规整数据，将重复的数据合并、同时需要对数据关闭节点做出处理
            let setp = 0;
            let groupNodes = [];
            let hasReverse = false; //是否存在差异节点
            nodes.forEach((node, i) => {
              let lastNode = groupNodes.find((lnode) => {
                return lnode.nodeId === node.nodeId;
              });

              if (lastNode) {
                //存在相同数据
                lastNode.subset.unshift(node);
              } else {
                //寻找异常节点
                if (node.reverseNodeId) {
                  hasReverse = true;
                  groupNodes.forEach((item) => {
                    if (item.nodeId === node.reverseNodeId) {
                      item.reverse = true;
                      item.stop = node;
                      item.defTime = this.getTimeDifference(
                        item.executeTime,
                        node.executeTime
                      );

                      this.theResult = node.nodeName;
                      this.theResultColor = false
                    }
                  });
                } else {
                  setp++;
                  groupNodes.push({
                    setp: setp,
                    ...node,
                    subset: [node],
                  });
                }
              }
            });

            if (!hasReverse) {
              //不存在异常的节点
              for (var i = groupNodes.length - 1; i >= 0; i--) {
                let node = groupNodes[i];
                if (node.status === 1) {
                  this.theResult = node.nodeName;
                  this.theResultColor = true;
                  break;
                }
              }
            }

            //3、获取到数据的最后正在执行的节点，并在页面上展示
            let newNode = [];
            for (var i = 0; i < groupNodes.length; i += 3) {
              newNode.push(groupNodes.slice(i, i + 3));
            }

            return (this.node = {
              debugStatus: 0,
              nodes: newNode, //流程节点
            });
          }else {
            return (this.node = {
              debugStatus: 1,
              nodes: []
            });
          }
        });
    },
    /**
     * @Author: Jason Liu
     * @description:获取 集成调阅业务域菜单
     */
    getBusinessDomains(param) {
      $api.getBusinessDomains(param).then((req) => {
        this.domains = req.data || [];
        if (this.domains.length > 0) {
          this.domained.domainCode = this.domains[0].domainCode;
          this.changeDomained();
        }
      });
    },
    /**
     * @Author: Jason Liu
     * @description: 修改业务域菜单事件
     */
    changeDomained() {
      const domained = this.domains.find((item) => {
        return item.domainCode === this.domained.domainCode;
      });
      this.domained.modeTypes = domained.modeTypes;

      this.searchSoctor();
    },
    /**
     * @Author: Jason Liu
     * @description: 检索医嘱信息
     */
    searchSoctor() {
      this.getOrderedList({
        currentPage: 1,
        pageSize: 10,
      });
    },
    /**
     * @Author: Jason Liu
     * @description:
     * @param {*}
     * @return {*}
     */
    getOrderedList({ type, currentPage, pageSize, $event }) {
      this.pager.page_no = currentPage;
      this.pager.loading = true;
      $api
        .getCyclePage({
          yljgdm: this.$route.query.yljgdm,
          jzlsh: this.$route.query.jzlsh,
          jzlb: this.$route.query.jzlb,
          domainCode: this.domained.domainCode, //业务域编码
          modeTypes: this.domained.modeTypes[0], //数据模型类型
          searchKey: this.pager.searchKey,
          start: this.pager.page_no - 1, //页码（第一页从0开始）
          size: pageSize, //分页大小（例如：10、20）
        })
        .then((req) => {
          this.orderedList = req.data.content;
          this.pager.total = req.data.totalElements;
          if (this.orderedList.length > 0) {
            this.setCheckOrdered({ row: req.data.content[0] });
          }
        })
        .finally(() => {
          this.pager.loading = false;
        });
    },
    /**
     * @Author: Jason Liu
     * @description: 设置选择的医嘱
     */
    setCheckOrdered({ row }) {
      this.nodeLoading = true;
      this.ordered = row;
      Promise.all([
        this.getTitle(this.$route.query),
        this.getNodeList(this.$route.query),
      ]).finally(() => {
        this.nodeLoading = false;
      });
    },
    /**
     * @Author: Jason Liu
     * @description: 医嘱行样式名称
     */
    rowClassName({ row, column }) {
      return row.yzxh == this.ordered.yzxh ? "row_active" : "";
    },
    /**
     * @Author: Jason Liu
     * @description: 流程节点样式名称
     */
    stepClassName(node) {
      let name = "not_started"; //默认未执行
      if (node.status == 1) {
        name = "finish_step";
      } else if (node.status == 2) {
        //当前步骤
        name = "be_faced";
      }
      return name;
    },
    getTimeDifference(date1, date2) {
      const newDate = new Date(date2).getTime() - new Date(date1).getTime(); //时间差的毫秒数
      //计算出相差天数
      const days = Math.floor(newDate / (24 * 3600 * 1000));

      //计算出小时数
      const leave1 = newDate % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      const hours = Math.floor(leave1 / (3600 * 1000));
      //计算相差分钟数
      const leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      const minutes = Math.floor(leave2 / (60 * 1000));
      //计算相差秒数
      const leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      const seconds = Math.round(leave3 / 1000);

      return `${days > 0 ? days + "天" : ""} ${
        hours > 0 ? hours.toString().padStart(2, "0") + ":" : ""
      } ${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
  },
};
</script>

<style lang="less" scoped>
.doctors_container {
  min-height: 80vh;
  background: #fff;
  .ant-layout-sider {
    background: #fff;
    padding-right: 10px;
    .doctor_ordered_container {
      border: none;
      /deep/.ant-card-head {
        padding: 0;
        font-weight: 400;
        border: none;
        min-height: auto;
        .ant-card-head-title {
          padding: 0;
        }
      }

      /deep/.ant-card-body {
        padding: 10px 0;
      }
    }

    .doctor_ordered_List {
      /deep/.vxe-header--row {
        background-color: var(--COLOR-NORMAL-BG, #eaeefe);
        font-size: 14px;
        color: var(--FONT-COLOR-NORMAL, #000);

        .vxe-header--column {
          padding: 0;
          :not(.col--ellipsis) {
            padding: 8px 0;
          }
          &.vxe-resizable.is--line:before {
            height: 70%;
          }
        }
      }

      /deep/.vxe-body--column {
        height: 40px;
      }

      /deep/.row_active {
        background: #ebffde;
      }
    }

    .vxe-pager {
      font-size: 12px;
      /deep/.vxe-pager--prev-btn.is--disabled {
        background-color: #e8e8e8;
      }
      /deep/.vxe-pager--num-btn {
        &.is--active {
          color: #fff;
          border-color: var(--COLOR-NORMAL, #2d5afa);
          background: var(--COLOR-NORMAL, #2d5afa);
        }
        border: 1px solid #c9c9c9;
        color: var(--FONT-COLOR-NORMAL, #000);
        line-height: 20px;
      }
    }
  }

  .title_header {
    padding: 5px 5px 5px 10px;
    position: relative;

    span {
      padding-left: 8px;

      font-size: 14px;
      font-weight: 400;
      color: #666666;
    }

    span.result_blue {
      color: blue;
    }
    span.result_red {
      color: red;
    }
    span.title {
      padding-left: 0;
      font-size: 14px;
      font-weight: bold;
      color: #000000;
    }
    &::before {
      content: "";
      z-index: 1;
      position: absolute;
      left: 0;
      top: 9px;
      width: 3px;
      height: 12px;
      background: #1379eb;
      display: initial;
    }
  }
  .ant-layout-content {
    overflow: auto;
    .title_info {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      font-weight: bold;
      color: #3cbfa7;
    }

    .doctors_process_body {
      padding: 20px 10px;
      width: 100%;
      .doctors_process {
        width: 100%;
        .doctors_process_step {
          float: left;
          width: 166px;
          margin-top: 20px;
          margin-right: 30px;
          height: 400px;
          &:last-child {
            margin-right: 10px;
          }
        }
        .ant-timeline {
          padding: 50px 10px;
          box-shadow: 0px 0px 7px 0px #e5e6e8;
          p {
            margin: 0;
            font-size: 12px;
            font-weight: 400;
            color: #000000;

            &.title {
              font-size: 14px;
              font-weight: bold;
              color: #000000;
            }

            &.desc {
              color: #717171;
            }

            a {
              transform: scale(0.4, 0.4);
              margin-left: 4px;
            }
          }

          .i_step {
            border-radius: 50%;
            font-size: 12px;
            text-align: center;
            font-weight: 400;
            width: 22px;
            height: 22px;
            line-height: 20px;
            transform: scale(0.6, 0.6);
            color: rgba(163, 163, 163, 1);
            background: #ffffff;
            border: 2px solid rgba(163, 163, 163, 1);
          }
          /deep/.ant-timeline-item-tail {
            top: 12px;
            height: calc(100% - 13px);
            z-index: 1;
            border-left: 2px solid #f0f0f0;
          }

          .finish_step {
            .i_step {
              color: #1275e7;
              border: 2px solid #1275e7;
            }

            /deep/.ant-timeline-item-tail {
              border-left: 2px solid #1275e7;
            }
          }

          .be_faced {
            .i_step {
              background: orange;
              color: #fff;
              border: 1px solid orange;
            }
          }
          .i_warn {
            background: rgba(255, 87, 87, 1);
            color: #fff;
            border-radius: 50%;
            font-size: 14px;
            border: none;
          }
        }
      }
    }
  }
  .ant-radio-group-solid {
    .ant-radio-button-wrapper-checked {
      &::before {
        background-color: #003fc9;
      }
      &:not(.ant-radio-button-wrapper-disabled) {
        color: #fff;
        background: #003fc9;
        border-color: #003fc9;
      }
    }
  }
}

.subset_list {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  .ant-row {
    width: 360px;
    height: 44px;
    line-height: 44px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border: thin solid #c9c9c9;
      width: 100%;
    }

    &:last-child {
      &::before {
        display: none;
      }
    }

    .sub_no {
      font-weight: bold;
      text-align: center;
    }

    .sub_time {
      font-size: 14px;
      color: #666666;
    }
  }
}

.ant-popover {
  .ant-popover-title {
    .node_stop {
      /deep/p {
        height: 40px;
        font-size: 22px;
        font-weight: 500;
        color: #ec0000;
        line-height: 40px;
        margin-bottom: 0;
        position: relative;
        &::before {
          position: absolute;
          content: "";
          bottom: -5px;
          left: -5px;
          width: 100%;
          border: 2px solid #ec0000;
        }
      }
    }
  }
  .ant-popover-inner-content {
    .node_stop {
      /deep/p {
        height: 32px;
        line-height: 32px;
        font-weight: 400;
        color: #000000;
        margin-bottom: 0;
        position: relative;
        margin-bottom: 0;
      }
      .red {
        color: #ec0000;
      }
    }
  }
}
</style>
