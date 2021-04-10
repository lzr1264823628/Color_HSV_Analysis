<script>
import {Line, mixins} from 'vue-chartjs'
import zoom from 'chartjs-plugin-zoom';


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
      tension:4,
      responsive: true,
      plugins: {
        zoom: {
          // Container for pan options
          pan: {
            enabled: true,
            mode: 'x',
            threshold: 0,
            sensitivity: 0,
            speed: 3
          },
          zoom: {
            enabled: true,
            speed: 10,
            mode: 'x',
            threshold: 0,
            sensitivity: 0,
          }
        }
      }
    })
    this.addPlugin(zoom)
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<style scoped>

</style>