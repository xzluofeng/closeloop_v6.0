<!--
 * @Author: Jason Liu
 * @Date: 2022-03-14 15:18:40
 * @Desc: 同意登录
-->
<template>
  <div></div>
</template>
<script>
export default {
  created() {
    const sec = this.$route.query.sec;
  },
  methods: {
    go(path) {
      this.$router.push(path);
    },
    decodeParam(params) {},
    userLogin(parms) {},
  },
};
</script>
