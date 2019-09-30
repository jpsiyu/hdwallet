<template>
  <div class="nt">
    <el-table :data="nodes" border>
      <el-table-column prop="index" label="index" width="80px"></el-table-column>
      <el-table-column prop="privateKey" label="privateKey"></el-table-column>
      <!--
      <el-table-column prop="publicKey" label="Public Key"></el-table-column>
      <el-table-column prop="chainCode" label="Chain Code"></el-table-column>
      -->
      <el-table-column prop="path" label="Path" width="180px"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: ['nodes'],
  data() {
    return {}
  }
}
</script>
