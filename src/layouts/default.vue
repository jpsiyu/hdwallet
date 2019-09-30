<template>
  <div class="page">
    <el-container>
      <el-aside>
        <el-menu @select="menuSelected" :default-active="defaultMenu.index">
          <el-menu-item v-for="(item, index) in config" :key="index" :index="item.index">
            <i class="el-icon-menu"></i>
            <span>{{item.name}}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <h1>{{defaultMenu.name}}</h1>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

const config = [
  { index: 'm-0', path: '/develop/flow_bip', name: '流程BIP' },
  { index: 'm-1', path: '/develop/flow', name: '流程ETH' },
]

export default {
  data() {
    return {
      config: [],
    }
  },
  created() {
    this.config = config
  },
  computed: {
    defaultMenu() {
      const cur = this.$route.path
      let menu = ''
      for (let i = 0; i < config.length; i++) {
        const item = config[i]
        if (cur.startsWith(item.path)) {
          menu = item
          break
        }
      }
      return menu
    }
  },
  methods: {
    menuSelected(index) {
      switch (index) {
        case 'm-0':
          this.$router.push({ path: '/develop/flow_bip' }).catch(_ => { })
          break
        case 'm-1':
          this.$router.push({ path: '/develop/flow' }).catch(_ => { })
          break
      }
    }
  }
}
</script>

<style>
.page {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.el-container {
  height: 100%;
}

.el-main {
  background-color: #fafafa;
}

.el-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.el-aside {
  width: 200px !important;
}
</style>
