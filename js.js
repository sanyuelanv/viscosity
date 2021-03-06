// 1.获取当前页面宽高
var WIDTH = document.body.offsetWidth
var HEIGHT = document.body.offsetHeight
var MAXDIST = 200
// 2.获取canvas实例，设置宽高，获取context
var canvas = document.getElementById( 'canvas' )
canvas.width = WIDTH
canvas.height = HEIGHT
var ctx = canvas.getContext( '2d' )
/*
   获取两个点之间的距离
   param1: pot: 第一个点坐标{x:0,y:0}
   param2: pot2: 第二个点坐标{x:0,y:0}
   return: double
 */
var potToPot = function( pot, pot2 ) {
  var d_x = Math.abs( pot.x - pot2.x )
  var d_y = Math.abs( pot.y - pot2.y )
  var dist = Math.sqrt( ( d_x * d_x ) + ( d_y * d_y ) )
  return dist
}
/*
   检测点是否在圆内
   param1: pot: 点坐标{x:0,y:0}
   param2: circle: frame{x:0,y:0,r:0}
   return: bool
 */
var isPotInCircle = function( pot, circle ) {
  var dist = potToPot( pot, circle )
  if ( dist - circle.r > 0 ) {
    return false
  } else {
    return true
  }
}
// 圆圈类
var Bubble = function() {
  this.frame = {
    x: 0,
    y: 0,
    r: 0,
  }
  this.color = '#000'
  this.text = null
  this.textProp = null
}
Bubble.prototype.drawRect = function( ctx ) {
  var x = this.frame.x
  var y = this.frame.y
  var r = this.frame.r
  var color = this.color
  var text = this.text
  var startAngle = 0
  var endAngle = 2 * Math.PI
  // console.log(this);
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc( x, y, r, startAngle, endAngle )
  ctx.fill()
  if ( text ) {
    ctx.fillStyle = this.textProp.color
    ctx.font = this.textProp.size + "px serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText( text, x, y );
  }
  ctx.restore()
}
// 曲线类
var Curve = function() {
  this.circle_1 = null
  this.circle_2 = null
  this.dist = 0
  this.color = '#000'
}
Curve.prototype.drawRect = function( ctx ) {
  var x_1 = this.circle_1.frame.x
  var y_1 = this.circle_1.frame.y
  var x_2 = this.circle_2.frame.x
  var y_2 = this.circle_2.frame.y
  var d = potToPot( this.circle_1.frame, this.circle_2.frame )
  var r1 = this.circle_1.frame.r
  var r2 = this.circle_2.frame.r
  var color = this.color

  var cos = ( y_2 - y_1 ) / d
  var sin = ( x_2 - x_1 ) / d

  var p_a = {
    x: x_1 - r1 * cos,
    y: y_1 + r1 * sin
  }
  var p_b = {
    x: x_1 + r1 * cos,
    y: y_1 - r1 * sin
  }

  var p_c = {
    x: x_2 + r2 * cos,
    y: y_2 - r2 * sin
  }
  var p_d = {
    x: x_2 - r2 * cos,
    y: y_2 + r2 * sin
  }

  var p_o = {
    x: p_a.x + d / 2 * sin,
    y: p_a.y + d / 2 * cos
  }
  var p_p = {
    x: p_b.x + d / 2 * sin,
    y: p_b.y + d / 2 * cos
  }

  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  //  1. 先绘制 A - B 直线
  ctx.moveTo( p_a.x, p_a.y )
  ctx.lineTo( p_b.x, p_b.y )
  // // 2. 绘制 B-P-C  曲线 p为控制点
  ctx.quadraticCurveTo( p_p.x, p_p.y, p_c.x, p_c.y )
  // // 3. 绘制 C-D 直线
  ctx.lineTo( p_d.x, p_d.y )
  // // 4. 绘制 D-O-A  曲线 o为控制点
  ctx.quadraticCurveTo( p_o.x, p_o.y, p_a.x, p_a.y )
  ctx.fill()
  ctx.restore()
}


// 手势函数
var gesture = function( self, ctx, bubble ) {
  var flag = false
  var maxDist = MAXDIST
  var hasOver = false
  var littleBubble, curve
  var drawRect = function() {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    if ( !hasOver ) {
      littleBubble.drawRect( ctx )
      curve.drawRect( ctx )
    }
    // 大圆
    bubble.drawRect( ctx )
  }
  var startPan = function( e ) {
    e = e.touches ? e.touches[ 0 ] : e
    var pot = {
      x: e.pageX,
      y: e.pageY
    }
    var circle = bubble.frame
    //判断点是否在圆内部
    flag = isPotInCircle( pot, circle )
    // 如果是：创建小圆和曲线
    if ( flag ) {
      littleBubble = new Bubble()
      littleBubble.frame = bubble.frame
      littleBubble.color = bubble.color
      curve = new Curve()
      curve.circle_1 = littleBubble
      curve.circle_2 = bubble
      curve.color = bubble.color
    }
  }
  var movePan = function( e ) {
    e = e.touches ? e.touches[ 0 ] : e
    if ( flag ) {
      var currentPot = {
        x: e.pageX,
        y: e.pageY
      }
      var orginPot = {
        x: littleBubble.frame.x,
        y: littleBubble.frame.y
      }
      var dist = potToPot( currentPot, orginPot )
      var originR = bubble.frame.r
      var little_r = originR * ( 1 - ( dist / maxDist ) )
      bubble.frame = {
        x: currentPot.x,
        y: currentPot.y,
        r: originR
      }
      littleBubble.frame = {
        x: orginPot.x,
        y: orginPot.y,
        r: little_r
      }
      ctx.clearRect( 0, 0, canvas.width, canvas.height );
      if ( dist > maxDist * 0.9 ) {
        hasOver = true
      }
      drawRect()
    }
  }
  var endPan = function( e ) {
    e = e.touches ? e.touches[ 0 ] : e
    if ( flag ) {
      bubble.frame = {
        x: littleBubble.frame.x,
        y: littleBubble.frame.y,
        r: bubble.frame.r
      }
      drawRect()
      hasOver = false
      littleBubble = null
      curve = null
    }
    flag = false
  }
  if ( 'ontouchend' in document ) {
    self.addEventListener( 'touchstart', startPan, false )
    self.addEventListener( 'touchmove', movePan, false )
    self.addEventListener( 'touchend', endPan, false )
  } else {
    self.addEventListener( 'mousedown', startPan, false )
    self.addEventListener( 'mousemove', movePan, false )
    self.addEventListener( 'mouseup', endPan, false )
  }

}

var bubble = new Bubble()
bubble.frame = {
  x: WIDTH / 4,
  y: HEIGHT / 4,
  r: 20
}
bubble.color = '#ff0000'
bubble.text = '1'
bubble.textProp = {
  color: "#FFF",
  size: "12"
}
bubble.drawRect( ctx )
var curve = new Curve()
gesture( canvas, ctx, bubble )
