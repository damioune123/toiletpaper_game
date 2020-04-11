<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import ClientUserAppMixin from "./mixins/ClientUserAppMixin";
export default {
  name: "CreateRoom",
  mixins: [ClientUserAppMixin],
  created() {
    this.initClientSocket();
  }
};
</script>

<style lang="css"></style>
