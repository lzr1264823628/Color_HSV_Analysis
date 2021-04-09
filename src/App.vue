<template>
  <div id="app">
    <b-container>
      <b-row>
        <b-col style="max-width:90vh">
          <b-form-file v-model="file"
                       :state="Boolean(file)"
                       drop-placeholder="拖动文件"
                       placeholder="打开文件或者拖动文件"
                       accept="image/*"
          ></b-form-file>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="8">
          <canvas id="canvas" @mousedown.prevent="drag" @wheel.prevent="scaleEvent" @mouseup="dot"></canvas>
        </b-col>
        <b-col cols="4">
          <ul>
            <li v-for="(item,index) in linesList" :key="index">{{ item }}</li>
          </ul>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.canvas = document.getElementById("canvas")
    this.canvas.width = this.size[0]
    this.canvas.height = this.size[1]
    this.ctx = this.canvas.getContext("2d")
    this.ctx.height = this.size[0]
    this.ctx.width = this.size[1]
  },
  data() {
    return {
      path: '',
      file: undefined,
      canvas: '',
      ctx: '',
      size: [400, 400],
      imgData: undefined,
      dragFlag: false,
      x: 0,
      y: 0,
      scale: 1000,
      dotsList: [],
      linesList: []
    }
  },
  methods: {
    drag(e) {
      //算出鼠标相对元素的位置
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
        this.scale += v / (1000 + Math.abs(this.scale - 1000)) * 1000
        this.scale = this.scale < 0 ? 0 : this.scale
        // let offset_x = e.offsetX
        // let offset_y = e.offsetY
        console.log(this.scale)
        this.flush()
      }
    },
    dot(e) {
      if (this.imgData && !this.dragFlag && e.button === 0) {
        console.log(e)
        let scale = this.scale / 1000
        let o_x = e.offsetX - this.x
        let o_y = e.offsetY - this.y
        this.dotsList.push([o_x / scale, o_y / scale])
        let len = this.dotsList.length - this.dotsList.length % 2
        this.linesList.splice(0, this.linesList.length)
        for (let i = 0; i < len; i += 2) {
          this.linesList.push([i, i + 1])
        }
        this.flush()
      }
    },
    deleteLine(index) {
      let temp = this.linesList.splice(index, 1)
      this.dotsList.splice(temp[0], 2)
    },
    flush() {
      this.ctx.clearRect(0, 0, 4000, 4000);
      this.ctx.drawImage(this.imgData, this.x, this.y, this.imgData.width * this.scale / 1000, this.imgData.height * this.scale / 1000)
      let ctx = this.ctx
      let scale = this.scale / 1000
      this.dotsList.forEach((item) => {
        if (item) {
          ctx.beginPath()
          ctx.globalAlpha = 0.5;
          ctx.arc(item[0] * scale + this.x, item[1] * scale + this.y, 10, 0, Math.PI * 4)
          ctx.closePath()
          ctx.fillStyle = '#dedede'
          ctx.fill()
          ctx.globalAlpha = 1;
        }
      })
      let lines = this.dotsList.length - this.dotsList.length % 2
      for (let i = 0; i < lines; i += 2) {
        ctx.beginPath()
        ctx.globalAlpha = 0.5;
        ctx.moveTo(this.dotsList[i][0] * scale + this.x, this.dotsList[i][1] * scale + this.y)
        ctx.lineTo(this.dotsList[i + 1][0] * scale + this.x, this.dotsList[i + 1][1] * scale + this.y)
        ctx.closePath()
        ctx.strokeStyle = '#dedede'
        ctx.stroke()
        ctx.globalAlpha = 1;
      }
    }
  },
  watch: {
    file(newValue) {
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
          this.dotsList.splice(0, this.dotsList.length)
          this.linesList.splice(0, this.linesList.length)
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          createImageBitmap(img).then((res) => {
            this.imgData = res
          })
          img.onload = null
        }
      }
    }
  },
  components: {}
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
  box-shadow: 0 0 10px #929291;
}

li {
  margin: 2px 0 2px 0;
  list-style-type: none;
  border: 2px solid #ded6d6;
}
.row{
  margin: 10px;
}
</style>
