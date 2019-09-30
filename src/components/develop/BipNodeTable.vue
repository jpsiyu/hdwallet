<template>
  <div class="nt">
    <el-table :data="nodes" border>
      <el-table-column prop="index" label="index" width="80px"></el-table-column>
      <el-table-column prop="depth" label="depth" width="100px"></el-table-column>
      <el-table-column label="Private Key">
        <template slot-scope="scope">
          <span>{{scope.row.privateKey.toString('hex')}}</span>
        </template>
      </el-table-column>
      <!--
      <el-table-column prop="publicKey" label="Public Key"></el-table-column>
      <el-table-column prop="chainCode" label="Chain Code"></el-table-column>
      -->
      <el-table-column label="parentFingerprint">
        <template slot-scope="scope">
          <span>{{scope.row.parentFingerprint }}</span>
        </template>
      </el-table-column>
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