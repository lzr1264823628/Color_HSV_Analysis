<script>
import {Line, mixins} from './vue-chart'
import { Zoom } from 'chartjs-plugin-zoom';
const {reactiveProp} = mixins
export default {
  name: "chart",
  mixins: [reactiveProp],
  props: {
    options: {
      type: Object,
      default(){
        return {}
      }
    }
  },
  extends: Line,
  mounted() {
    Object.assign(this.options,{
      tension:0.1,
      responsive: true
    })
    this.addPlugin(Zoom)
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<style scoped>

</style>