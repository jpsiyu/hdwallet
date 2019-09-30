<template>
  <div class="flow">
    <h3>老板的输入</h3>
    <el-form class="flow-form" label-position="right" size="small" label-width="100px">
      <el-form-item label="助记词">
        <el-input
          class="flow-area__w"
          v-model="mnemonic"
          type="textarea"
          :rows="3"
          placeholder="请输入助记词"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input class="flow-input__w" v-model="password" placeholder="请输入助记词密码"></el-input>
      </el-form-item>
      <el-form-item label="财务序号">
        <el-input class="flow-input__w" v-model="index"></el-input>
      </el-form-item>
    </el-form>
    <h3>生成财务节点M1</h3>
    <el-row class="flow-form">
      <el-steps direction="vertical" style="height:1000px">
        <el-step title="节点M0" status="success">
          <div slot="description">
            <Node :nodes="bossNode | node2list " />
          </div>
        </el-step>
        <el-step title="派生节点" status="success">
          <div slot="description">
            <Node :nodes="financeNode | node2list" />
          </div>
        </el-step>
        <el-step title="财务节点M1" status="success">
          <div slot="description">
            <Node :nodes="financeMasterNode | node2list" />
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <h3>财务私钥拆分</h3>
    <el-row class="flow-form">
      <el-steps direction="vertical" style="height:600px">
        <el-step title="拆分: M1 = Split1 + Split2" status="finish">
          <div slot="description">
            <p v-if="financeMasterNode">{{financeMasterNode.privateKey}}</p>
            <p>= {{splits[0]}} + {{splits[1]}}</p>
          </div>
        </el-step>
        <el-step title="生成盐，32位随机数" status="finish">
          <div slot="description">{{salt}}</div>
        </el-step>
        <el-step title="Split1 + Salt, 合并为160位的熵" status="finish">
          <div slot="description">{{split1salt}}</div>
        </el-step>
        <el-step title="财务保管的节点M1'" status="finish">
          <div slot="description">
            <Node :nodes="financeKeepNode | node2list" />
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <h3>用户私钥派生</h3>
    <el-form class="flow-form" label-position="right" size="small" label-width="100px">
      <el-form-item label="派生路径">
        <el-input class="flow-input__w" v-model="derivePath" disabled></el-input>
      </el-form-item>
      <el-form-item label="派生用户节点">
        <NodeTable :nodes="userNodes" />
      </el-form-item>
    </el-form>
    <h3>财务私钥还原</h3>
    <el-row class="flow-form">
      <el-steps direction="vertical" style="height: 500px">
        <el-step title="财务输入助记词(15个)" status="finish">
          <div slot="description">
            <el-input
              v-if="financeKeepNode"
              class="flow-area__w"
              v-model="financeKeepNode.mnemonic"
              type="textarea"
              :rows="3"
              placeholder="请输入助记词"
            ></el-input>
          </div>
        </el-step>
        <el-step title="助记词转为熵" status="finish">
          <div slot="description">
            <span>{{entropy}}</span>
          </div>
        </el-step>
        <el-step title="160位的熵去掉末尾32位的盐，得到 Split1" status="finish">
          <div slot="description">
            <span>{{recoverSplit1}}</span>
          </div>
        </el-step>
        <el-step title="Split1 + Split2 = 财务私钥M1" status="finish">
          <div slot="description">
            <span>{{recoverFinanceMasterKey}}</span>
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <div class="flow-chart">
      <img src="@/assets/images/flow.jpg" alt />
    </div>
  </div>
</template>

<script>
import Node from '@/components/develop/Node'
import NodeTable from '@/components/develop/NodeTable'
const ethers = require('ethers')
const HDNode = ethers.utils.HDNode

export default {
  components: { Node, NodeTable },
  data() {
    return {
      mnemonic: '',
      password: '',
      path: '',
      index: 0,
      bossNode: null,
      financeNode: null,
      financeMasterNode: null,
      splits: ['', ''],
      salt: '',
      split1salt: '',
      financeKeepNode: null,
      derivePath: "m/44'/60'/0'/0",
      userNodes: [],
      financeRecoverNode: null,
      entropy: '',
      recoverSplit1: '',
      recoverFinanceMasterKey: ''
    }
  },
  filters: {
    node2list(node) {
      if (!node) return []
      return [node]
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.mnemonic = this.randomMnemonic()
      this.password = this.randomStr(12)
      this.bossNode = this.createNode(this.mnemonic, this.password)
      this.index = this.randomIndex()
      this.financeNode = this.deriveNode(this.bossNode, this.index)
      this.financeMasterNode = this.createNode(this.financeNode.mnemonic, '')
      this.splits = this.splitPrivKey(this.financeMasterNode.privateKey)
      this.salt = this.randomHex(8)
      this.split1salt = '0x' + this.splits[0].substring(2) + this.salt.substring(2)
      this.financeKeepNode = HDNode.fromMnemonic(HDNode.entropyToMnemonic(this.split1salt))

      this.entropy = HDNode.mnemonicToEntropy(this.financeKeepNode.mnemonic)
      const len = this.entropy.length
      this.recoverSplit1 = this.entropy.substring(0, len - 8)
      this.recoverFinanceMasterKey = '0x' + this.recoverSplit1.substring(2) + this.splits[1].substring(2)

      const tempList = []
      for (let i = 0; i < 10; i++) {
        const dpath = `${this.derivePath}/${i}`
        const node = this.deriveNode(this.financeMasterNode, dpath)
        tempList.push(node)
      }
      this.userNodes = tempList
    },
    randomMnemonic() {
      const wallet = ethers.Wallet.createRandom()
      return wallet.mnemonic
    },
    randomStr(len) {
      let result = []
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < len; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
      }
      return result.join('')
    },
    randomIndex() {
      return Math.floor(Math.random() * 10000)
    },
    randomHex(len) {
      let result = []
      const characters = '0123456789ABCDEFabcdef'
      const charactersLength = characters.length
      for (let i = 0; i < len; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
      }
      return '0x' + result.join('')
    },
    createNode(mnemonic, password) {
      return HDNode.fromMnemonic(mnemonic, ethers.wordlists.en, password)
    },
    deriveNode(node, index) {
      return node.derivePath(index.toString())
    },
    splitPrivKey(key) {
      const split1 = '0x' + key.substring(2, 34)
      const split2 = '0x' + key.substring(34, 66)
      return [split1, split2]
    }
  }
}
</script>

<style scoped>
.flow {
  color: #606266;
  background-color: #fff;
  padding: 20px 0;
}

.flow h3 {
  width: 960px;
  margin: auto;
}

.flow-form {
  margin: 20px auto 50px auto;
  padding: 20px 10px;
  width: 960px;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
}

.flow-nodeBtn {
  width: 100%;
}

.flow-row {
  display: flex;
}

.flow-index {
  display: flex;
  align-items: center;
  margin-bottom: 50px;
}

.flow-index .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.flow-index span {
  display: inline-block;
  width: 40px;
  font-size: 14px;
}

.flow-split span {
  text-decoration: underline;
  margin-right: 20px;
}

.flow-chart img {
  width: 100%;
}

.flow >>> .el-button,
.flow >>> .el-input__inner,
.flow >>> .el-textarea__inner {
  border-radius: 0;
}

.flow-area__w {
  width: 300px;
}

.flow-input__w {
  width: 300px;
}
</style>
 No newline at end of file
