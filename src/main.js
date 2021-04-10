import Vue from 'vue'
import App from './App.vue'
import {BootstrapVue, IconsPlugin, DropdownPlugin, LayoutPlugin} from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(DropdownPlugin)
Vue.use(LayoutPlugin)
Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
