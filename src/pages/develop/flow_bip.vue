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
            <BipNode :nodes="bossNode | node2list " />
          </div>
        </el-step>
        <el-step title="派生节点" status="success">
          <div slot="description">
            <BipNode :nodes="financeNode | node2list" />
          </div>
        </el-step>
        <el-step title="财务节点M1" status="success">
          <div slot="description">
            <BipNode :nodes="financeMasterNode | node2list" />
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <h3>财务私钥拆分</h3>
    <el-row class="flow-form">
      <el-steps direction="vertical" style="height:600px">
        <el-step title="拆分: M1 = Split1 + Split2" status="finish">
          <div slot="description">
            <p v-if="financeMasterNode">{{financeMasterNode.privateKey | byte2hex}}</p>
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
            <BipNode :nodes="financeKeepNode | node2list" />
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <h3>财务私钥还原</h3>
    <el-row class="flow-form">
      <el-steps direction="vertical" style="height: 800px">
        <el-step title="财务输入助记词(15个)" status="finish">
          <div slot="description">
            <el-input
              v-if="financeKeepNode"
              class="flow-area__w"
              v-model="keepMnemonic"
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
        <el-step title="获取原始财务M1的ChainCode" status="finish">
          <div slot="description">
            <span>{{financeMasterChainCode}}</span>
          </div>
        </el-step>
        <el-step title="还原财务M1'" status="finish">
          <div slot="description">
            <BipNode :nodes="recoverNode | node2list" />
          </div>
        </el-step>
      </el-steps>
    </el-row>
    <h3>原始财务M1派生用户私钥</h3>
    <el-form class="flow-form" label-position="right" size="small" label-width="100px">
      <el-form-item label="派生路径">
        <el-input class="flow-input__w" v-model="derivePath" disabled></el-input>
      </el-form-item>
      <el-form-item label="派生用户节点">
        <BipNodeTable :nodes="userNodes" />
      </el-form-item>
    </el-form>
    <h3>还原财务M1派生用户私钥</h3>
    <el-form class="flow-form" label-position="right" size="small" label-width="100px">
      <el-form-item label="派生路径">
        <el-input class="flow-input__w" v-model="derivePath" disabled></el-input>
      </el-form-item>
      <el-form-item label="派生用户节点">
        <BipNodeTable :nodes="recoverUserNodes" />
      </el-form-item>
    </el-form>
    <div class="flow-chart">
      <img src="@/assets/images/flow.jpg" alt />
    </div>
  </div>
</template>

<script>
import BipNode from '@/components/develop/BipNode'
import BipNodeTable from '@/components/develop/BipNodeTable'
const bip32 = require('bip32')
const bip39 = require('bip39')

export default {
  components: { BipNode, BipNodeTable },
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
      keepMnemonic: '',
      financeKeepNode: null,
      derivePath: "m/44'/60'/0'/0",
      userNodes: [],
      recoverUserNodes: [],
      financeRecoverNode: null,
      entropy: '',
      recoverSplit1: '',
      recoverFinanceMasterKey: '',
      recoverNode: null,
    }
  },
  filters: {
    node2list(node) {
      if (!node) return []
      return [node]
    },
    byte2hex(val) {
      return val.toString('hex')
    }
  },
  computed: {
    financeMasterChainCode() {
      return this.financeMasterNode ? this.financeMasterNode.chainCode.toString('hex') : ''
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.mnemonic = bip39.generateMnemonic()
      this.password = this.randomStr(12)
      this.bossNode = this.createNode(this.mnemonic, this.password)
      this.index = this.randomIndex()

      this.financeNode = this.deriveNode(this.bossNode, this.index)
      this.financeMasterNode = this.createNode(this.mnemonic, '')

      this.splits = this.splitPrivKey(this.financeMasterNode.privateKey)
      this.salt = this.randomHex(8)
      this.split1salt = this.splits[0] + this.salt
      this.keepMnemonic = bip39.entropyToMnemonic(this.split1salt)
      this.financeKeepNode = this.createNode(this.keepMnemonic, '')

      this.entropy = bip39.mnemonicToEntropy(this.keepMnemonic).toString('hex')
      const len = this.entropy.length
      this.recoverSplit1 = this.entropy.substring(0, len - this.salt.length)
      this.recoverFinanceMasterKey = this.recoverSplit1 + this.splits[1]
      const keyBuffer = Buffer.from(this.recoverFinanceMasterKey, 'hex')
      this.recoverNode = bip32.fromPrivateKey(keyBuffer, this.financeMasterNode.chainCode)

      let tempList = []
      for (let i = 0; i < 10; i++) {
        const dpath = `${this.derivePath}/${i}`
        const node = this.deriveNode(this.financeMasterNode, dpath)
        tempList.push(node)
      }
      this.userNodes = tempList

      tempList = []
      for (let i = 0; i < 10; i++) {
        const dpath = `${this.derivePath}/${i}`
        const node = this.deriveNode(this.recoverNode, dpath)
        tempList.push(node)
      }
      this.recoverUserNodes = tempList

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
      const characters = '0123456789abcdef'
      const charactersLength = characters.length
      for (let i = 0; i < len; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
      }
      return result.join('')
    },
    createNode(mnemonic, password) {
      const seed = bip39.mnemonicToSeedSync(mnemonic, password)
      const node = bip32.fromSeed(seed)
      return node
    },
    deriveNode(node, index) {
      return node.derivePath(index.toString())
    },
    splitPrivKey(key) {
      key = key.toString('hex')
      const split1 = key.substring(0, 32)
      const split2 = key.substring(32, 64)
      return [split1, split2]
    },
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