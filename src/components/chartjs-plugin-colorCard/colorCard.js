import Color from "color"
const plugin = {
  id: 'canvas_color_card',
  beforeDraw: (chart) => {
    if(!chart.data.colorCardOpenFlag) return
    const ctx = chart.canvas.getContext('2d');
    if(chart.data.datasets.length===0) return
    ctx.save();
    const xstart = chart.scales.x.left
    const ystart = chart.scales.y.bottom
    const xgap = chart.scales.x.width / (chart.scales.x.max - chart.scales.x.min)
    const ygap = chart.scales.y.height / (chart.scales.y.max - chart.scales.y.min)
    const H = chart.data.H
    if(!H) return
    for (let x = chart.scales.x.min;x<=chart.scales.x.max+1&&x<=100;x++){
      for (let y = chart.scales.y.min;y<=chart.scales.y.max+1&&y<=100;y++){
        ctx.fillStyle = Color.hsv(H,x,y).string();
        ctx.strokeStyle = Color.hsv(H,x,y).string();
        ctx.fillRect(xstart+xgap*(x-chart.scales.x.min)-xgap/2, ystart-ygap*(y-chart.scales.y.min)+ygap/2, xgap, ygap);
        ctx.strokeRect(xstart+xgap*(x-chart.scales.x.min)-xgap/2, ystart-ygap*(y-chart.scales.y.min)+ygap/2, xgap, ygap);
      }
    }
    ctx.clearRect(0,0,chart.scales.y.right,chart.height)
    ctx.clearRect(0,chart.scales.y.bottom,chart.width,chart.height)
    ctx.clearRect(0,0,chart.width,chart.scales.y.top)
    ctx.clearRect(chart.scales.x.right,0,chart.width,chart.height)
    ctx.restore();

  }
};
export default plugin