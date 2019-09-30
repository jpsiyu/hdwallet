<template>
  <div class="node">
    <div class="node-item" v-for="(item, index) in nodes" :key="index">
      <div class="node-row">
        <span>chainCode</span>
        <span>{{item.chainCode | byte2hex}}</span>
      </div>
      <div class="node-row">
        <span>depth</span>
        <span>{{item.depth}}</span>
      </div>
      <div class="node-row">
        <span>fingerprint</span>
        <span>{{item.fingerprint | fingerprintNum}}</span>
      </div>
      <div class="node-row">
        <span>parentFingerprint</span>
        <span>{{item.parentFingerprint }}</span>
      </div>
      <div class="node-row">
        <span>index</span>
        <span>{{item.index}}</span>
      </div>
      <div class="node-row">
        <span>privateKey</span>
        <span class="green">{{item.privateKey | byte2hex}}</span>
      </div>
      <div class="node-row">
        <span>publicKey</span>
        <span>{{item.publicKey | byte2hex}}</span>
      </div>
      <!--
      <div class="node-row">
        <span>xprv</span>
        <span>{{item | xprv}}</span>
      </div>
      -->
      <div class="node-row">
        <span>p2pkh address</span>
        <span>{{item.publicKey | p2pkhAddr}}</span>
      </div>
      <div class="node-row">
        <span>eth address</span>
        <span>{{item| ethAddr}}</span>
      </div>
    </div>
  </div>
</template>

<script>
const bitcoin = require('bitcoinjs-lib')
const ethWallet = require('ethereumjs-wallet')
export default {
  props: ['nodes', "short"],
  data() {
    return {}
  },
  filters: {
    byte2hex(val) {
      if (val == 0) return 0
      return val.toString('hex')
    },
    fingerprintNum(val) {
      return val.readUInt32BE(0)
    },
    p2pkhAddr(pubkey) {
      return bitcoin.payments.p2pkh({ pubkey }).address
    },
    xprv(node) {
      return node.toBase58()
    },
    ethAddr(node) {
      const enode = ethWallet.fromPrivateKey(node.privateKey)
      return enode.getAddressString()
    }
  }
}
</script>

.<style scoped>
.node {
  color: #606266;
}

.node-item {
  margin: 10px 0;
  border: 1px solid #e4e7ed;
  padding: 10px;
  width: 750px;
}

.node-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
}

.node-row:last-child {
  border-bottom: none;
}

.node-row__path {
  border: 1px solid red;
  padding: 0 20px;
  border-radius: 10px;
}

.green {
  color: #67c23a;
}
</style>