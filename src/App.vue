<template>
  <div id="app">
    <b-container fluid>
      <b-row style="justify-content: center">
        <b-col style="width: 100%">
          <b-form-file v-model="file"
                       :state="Boolean(file)"
                       drop-placeholder="拖动文件"
                       placeholder="打开文件或者拖动文件"
                       accept="image/*"
          ></b-form-file>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12" sm="12" md="9" lg="8" xl="9" id="can_col">
          <canvas id="canvas" @mousedown.prevent="drag" @wheel.prevent="scaleEvent" @mousedown="dot"></canvas>
        </b-col>
        <b-col cols="12" sm="12" md="3" lg="4" xl="3">
          <b-container style="height: 400px">
            <b-row style="min-height:calc(30% - 20px)" class="flex-column">
              <b-col>
                <b-input-group>
                  <b-input type="range" v-model="R" min="5" max="20"></b-input>
                  <b-input-group-append>
                    <b-input type="color" style="min-width: calc(1.5em + 0.75rem + 2px)" v-model="fillStyle"></b-input>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
              <b-col>
                <b-input-group>
                  <b-input type="range" v-model="lineWidth" min="1" max="5"></b-input>
                  <b-input-group-append>
                    <b-input type="color" style="min-width: calc(1.5em + 0.75rem + 2px)"
                             v-model="strokeStyle"></b-input>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
            </b-row>
            <b-row style="max-height:calc(70% - 10px);margin-bottom: 0">
              <b-col style="max-height: 100%">
                <ul>
                  <li v-for="(item,index) in dotsList" :key="index"
                  >
                    <b-button-group size="sm">
                      <b-button
                          :style="backgroundStyle(index)"
                          variant="outline-dark" :pressed="index===selectLine" @click="selectLineMethod(index)">
                        {{ item[0].map((it) => Math.round(it)) + " > " + item[1].map((it) => Math.round(it)) }}
                      </b-button>
                      <b-button variant="danger" @click="deleteLine(index)">
                        <b-icon icon="x-circle"></b-icon>
                      </b-button>
                    </b-button-group>
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
      <b-row style="position: sticky;top:10px;z-index:10">
        <b-col class="d-inline-flex colorBar">
          <div v-for="(it,index) in dotsList.length!==0&&selectLine!==null?ColorData[selectLine].color:[]" :key="index"
               :style="{background:it.rgb().string()}"
               :class="{colorCardActive:index === colorCardActive}"></div>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <chart :chartData="chartData" :options="options" ref="chart"
          ></chart>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import chart from "@/components/chart";
import Color from "color"
import Vue from 'vue'


export default {
  name: 'App',
  mounted() {
    this.canvas = document.getElementById("canvas")
    this.canvas.width = document.getElementById("can_col").clientWidth
    this.canvas.height = this.size[1]
    this.ctx = this.canvas.getContext("2d")
    this.ctx.height = this.size[0]
    this.ctx.width = this.size[1]
    window.onresize = this.changeCanvas
  },
  data() {
    return {
      path: '',
      file: undefined,
      canvas: '',
      ctx: '',
      size: [800, 400],
      imgData: null,
      imgColorData: null,
      dragFlag: false,
      x: 0,
      y: 0,
      selectLine: null,
      scale: 1000,
      dotsList: [],
      chartData: {
        labels: [],
        datasets: [{label: 'H', backgroundColor: 'rgba(255,0,0,0.5)'},
          {label: 'S', backgroundColor: 'rgba(0,255,0,0.5)'},
          {label: 'V', backgroundColor: 'rgba(0,0,255,0.5)'}]
      },
      fillStyle: '#dedede',
      strokeStyle: '#a9a9a9',
      R: 10,
      lineWidth: 4,
      colorCardActive: null,
      options: {
        onHover: (e) => {
          let active_list = this.$refs.chart.$data._chart.getElementsAtXAxis(e)
          if(active_list){
            this.colorCardActive = active_list[0]._index
          }
        }
      }
    }
  },
  methods: {
    drag(e) {
      if (this.imgData && e.button === 1) {
        let disX = e.clientX;
        let disY = e.clientY;
        let last_x = this.x;
        let last_y = this.y;
        document.getElementsByTagName("body")[0].style.cursor = "move"
        document.onmousemove = (e) => {
          this.x = last_x + (e.clientX - disX);
          this.y = last_y + (e.clientY - disY);
          this.dragFlag = true;
          this.flush()
        };
        document.onmouseup = () => {
          document.onmousemove = null;
          this.dragFlag = false;
          document.onmouseup = null;
          document.getElementsByTagName("body")[0].style.cursor = "default"
        };
      }
    },
    scaleEvent(e) {
      if (this.imgData) {
        let v = e.deltaY
        let s1 = this.scale
        // this.scale += v / (1000 + Math.abs(this.scale - 1000)) * 1000
        this.scale += v
        this.scale = this.scale < 100 ? 100 : this.scale
        let s = this.scale
        let dx = (1 - s / s1) * (e.offsetX - this.x)
        let dy = (1 - s / s1) * (e.offsetY - this.y)
        // console.log(e,e.clientX,e.clientY,dx,dy)
        this.x += dx
        this.y += dy
        this.flush()
      }
    },
    selectLineMethod(index) {
      this.selectLine = index
    },
    dot(e) {
      if (this.imgData && !this.dragFlag && e.button === 0) {
        let scale = this.scale / 1000
        let begin_x = e.offsetX
        let begin_y = e.offsetY
        let getOrigin = (xy) => {
          // console.log(xy, this.x, this.y)
          return [(xy[0] - this.x) / scale, (xy[1] - this.y) / scale]
        }
        let ctx = this.ctx
        document.onmousemove = (e) => {
          this.flush()
          ctx.beginPath()
          ctx.globalAlpha = 0.5;
          ctx.arc(begin_x, begin_y, this.R, 0, Math.PI * 4)
          ctx.closePath()
          ctx.fillStyle = this.fillStyle
          ctx.fill()
          ctx.beginPath()
          ctx.arc(e.offsetX, e.offsetY, this.R, 0, Math.PI * 4)
          ctx.closePath()
          ctx.fillStyle = this.fillStyle
          ctx.fill()
          ctx.beginPath()
          ctx.lineWidth = this.lineWidth
          ctx.moveTo(e.offsetX, e.offsetY)
          ctx.lineTo(begin_x, begin_y)
          ctx.strokeStyle = this.strokeStyle
          ctx.stroke()
          ctx.globalAlpha = 1;
          ctx.closePath()

        };
        document.onmouseup = (e) => {
          this.dotsList.push([getOrigin([begin_x, begin_y]), getOrigin([e.offsetX, e.offsetY])])
          document.onmousemove = null;
          document.onmouseup = null;
        };
        this.flush()
      }
    },
    deleteLine(index) {
      if (this.selectLine === index) this.selectLine = null
      if(index < this.selectLine) this.selectLine--
      this.dotsList.splice(index, 1)
      this.flush()
    },
    backgroundStyle(index){
      return {background: 'linear-gradient(to right,'+this.ColorData[index].color[0].rgb().string()+','+this.ColorData[index].color[this.ColorData[index].color.length-1].rgb().string()+')'}
    },
    changeCanvas() {
      this.canvas.width = document.getElementById('can_col').clientWidth
      this.flush()
    },
    drawLine(dotsList, ctx, scale) {
      ctx.globalAlpha = 0.5;
      dotsList.forEach((it, index) => {
        if (it) {
          it.forEach((item) => {
            ctx.beginPath()
            ctx.arc(item[0] * scale + this.x, item[1] * scale + this.y, this.R, 0, Math.PI * 4)
            ctx.closePath()
            ctx.fillStyle = this.fillStyle
            ctx.fill()
            if (index === this.selectLine) {
              ctx.beginPath()
              ctx.arc(item[0] * scale + this.x, item[1] * scale + this.y, this.R + 0.1, 0, Math.PI * 4)
              ctx.strokeStyle = this.strokeStyle
              ctx.stroke()
            }
          })
        }
      })
      dotsList.forEach((it) => {
        if (it) {
          ctx.beginPath()
          ctx.lineWidth = this.lineWidth
          ctx.moveTo(it[0][0] * scale + this.x, it[0][1] * scale + this.y)
          ctx.lineTo(it[1][0] * scale + this.x, it[1][1] * scale + this.y)
          ctx.strokeStyle = this.strokeStyle
          ctx.stroke()
        }
      })
      ctx.globalAlpha = 1;
    },
    flush() {
      if (this.imgData) {
        this.ctx.clearRect(0, 0, 8000, 8000);
        let scale = this.scale / 1000
        this.ctx.drawImage(this.imgData, this.x, this.y, this.imgData.width * scale, this.imgData.height * scale)
        let ctx = this.ctx
        this.drawLine(this.dotsList, ctx, scale)
      }
    },
    getImageColor(index) {
      return index[1] * this.imgData.width * 4 + index[0] * 4
    },
    setDatasets(n) {
      // console.log(this.lineDotsData)
      // console.log(this.imgColorData)
      // console.log(this.ColorData)
      Vue.set(this, 'chartData', {
        labels: this.ColorData.length ? this.ColorData[n].H.map((it) => it.x) : [],
        datasets: [
          {
            label: 'H',
            borderColor: 'rgba(255,0,0,0.5)',
            data: this.ColorData.length ? this.ColorData[n].H : [],
            fill: false,
          },
          {
            label: 'S',
            borderColor: 'rgba(0,255,0,0.5)',
            data: this.ColorData.length ? this.ColorData[n].S : [],
            fill: false,
          },
          {
            label: 'V',
            borderColor: 'rgba(0,0,255,0.5)',
            data: this.ColorData.length ? this.ColorData[n].V : [],
            fill: false,
          }]
      })
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    lineDotsData() {
      // 直线点
      if (this.dotsList) {
        let data = []
        this.dotsList.forEach((it) => {
          let temp1 = it[1][0] - it[0][0]
          let temp2 = it[1][1] - it[0][1]
          let t
          if (Math.abs(temp1) > Math.abs(temp2)) t = temp1
          else t = temp2
          let t_x = (it[1][0] - it[0][0]) / Math.abs(t)
          let t_y = (it[1][1] - it[0][1]) / Math.abs(t)
          let temp = []
          let x = Math.round(it[0][0])
          let y = Math.round(it[0][1])
          let i = Math.abs(t)
          while (i >= 0) {
            temp.push([Math.round(x), Math.round(y)])
            x += t_x
            y += t_y
            i -= 1
          }
          // 填入对应每个线的点的数组
          data.push(temp)
        })
        return data
      } else {
        return []
      }

    },
    ColorData() {
      if (this.dotsList) {
        let t = this.lineDotsData
        // console.log('linedata',t)
        // console.log(this.imgColorData)
        let data = []
        t.forEach((it) => {
          let H = []
          let S = []
          let V = []
          let i = 0;
          let c = []
          it.forEach((xy) => {
            // console.log(this.getImageColor(xy))
            let color = Color.rgb(
                this.imgColorData.data[this.getImageColor(xy)],
                this.imgColorData.data[this.getImageColor(xy) + 1],
                this.imgColorData.data[this.getImageColor(xy) + 2])
            let hsv = color.hsv().array()
            H.push({x: i, y: hsv[0]})
            S.push({x: i, y: hsv[1]})
            V.push({x: i, y: hsv[2]})
            c.push(color)
            i += 1
          })
          data.push({H: H, S: S, V: V, color: c})
        })
        return data
      } else {
        return []
      }
    }
  },
  watch: {
    file(newValue) {
      if (!newValue) return
      let reader = new FileReader();
      reader.readAsDataURL(newValue);
      let ctx = this.ctx;
      let size = this.size;
      reader.onloadend = () => {
        let img = new Image();
        img.src = reader.result
        img.onload = () => {
          ctx.clearRect(0, 0, size[0], size[1]);
          this.x = 0
          this.y = 0
          this.scale = 1000
          // 清除
          this.dotsList.splice(0, this.dotsList.length)
          this.selectLine = null
          this.scale = 1000

          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);

          // 获取图片数据
          let panel = document.createElement("canvas")
          panel.width = img.width
          panel.height = img.height
          let panel_ctx = panel.getContext("2d")
          panel_ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          this.imgColorData = panel_ctx.getImageData(0, 0, img.width, img.height)

          createImageBitmap(img).then((res) => {
            this.imgData = res
          })
        }
      }
    },
    // dotsList() {
    //   if (this.imgData && this.) {
    //     this.setDatasets(this.selectLine)
    //   }
    // },
    selectLine(n) {
      if (n === null) return
      this.setDatasets(n)
      this.flush()
    },
    fillStyle() {
      this.flush()
    },
    strokeStyle() {
      this.flush()
    },
    R() {
      this.flush()
    },
    lineWidth() {
      this.flush()
    }
  },
  components: {
    chart
  }
}


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#canvas {
  border: 1px solid blue;
  border-radius: 10px;
//box-shadow: 0 0 10px #929291;

}

ul {
  border: 0;
  height: 100%;
  border-radius: 10px;
  margin-left: 3px;
  padding-left: 1px;
  overflow-x: hidden;
}

li {
  margin: 2px 0 2px 0;
  list-style-type: none;
  cursor: pointer;
}

.row {
  margin: 10px;
}


.colorBar {
  justify-content: center;
  align-content: center;
  box-shadow: #929291 0 0 10px;
  background: white;

}

.colorBar > div {
  width: 100%;
  height: 10px;
}

.colorBar .colorCardActive {
  border: 2px #c4c1c1 solid;
  border-radius: 10%;
  //border-right: 1px #000000 solid;
  //box-shadow: 0 1px 10px #7c7c7c;
  transform: scale(2);
}
</style>
