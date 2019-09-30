<template>
  <div class="node">
    <div class="node-item" v-for="(item, index) in nodes" :key="index">
      <div class="node-row">
        <span>address</span>
        <span>{{item.address}}</span>
      </div>
      <div class="node-row">
        <span>chainCode</span>
        <span>{{item.chainCode}}</span>
      </div>
      <div class="node-row">
        <span>depth</span>
        <span>{{item.depth}}</span>
      </div>
      <div class="node-row">
        <span>fingerprint</span>
        <span>{{item.fingerprint}}</span>
      </div>
      <div class="node-row">
        <span>parentFingerprint</span>
        <span>{{item.parentFingerprint}}</span>
      </div>
      <div class="node-row">
        <span>index</span>
        <span>{{item.index}}</span>
      </div>
      <div class="node-row">
        <span>mnemonic</span>
        <span class="green">{{item.mnemonic}}</span>
      </div>
      <div class="node-row">
        <span>path</span>
        <span class="node-row__path">{{item.path}}</span>
      </div>
      <div class="node-row">
        <span>privateKey</span>
        <span class="green">{{item.privateKey}}</span>
      </div>
      <div class="node-row">
        <span>publicKey</span>
        <span>{{item.publicKey}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['nodes', "short"],
  data() {
    return {}
  }
}
</script>

.<style scoped>
.node {
  color: #606266;
}

.node-item{
  margin: 10px 0;
  border: 1px solid #E4E7ED;
  padding: 10px;
  width: 750px;
}

.node-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #E4E7ED;
}

.node-row:last-child{
  border-bottom: none;
}

.node-row__path{
  border: 1px solid red;
  padding: 0 20px;
  border-radius: 10px;
}

.green{
  color: #67C23A;
}
</style>
 No newline at end of file
