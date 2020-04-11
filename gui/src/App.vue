<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import ClientUserAppSocketCommunication from "./mixins/ClientUserAppSocketCommunication";
export default {
  name: "CreateRoom",
  mixins: [ClientUserAppSocketCommunication],
  created() {
    this.initClientSocket();
  }
};
</script>

<style lang="css"></style>
