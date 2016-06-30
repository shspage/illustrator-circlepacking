// circlepacking
// draws non overlapping tangent circles.

// Copyright(c) 2016 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// ver.1.0.3+
// in a circle variation ver.1.1.1+
// in a circle in a browser variation ver.1.0

var CirclePack;

(function(){
    var _opt = {
        number_of_random_points : 200,
        min_initial_radius : 2,
        
        stroke_width : 1,
     
        max_dist_err_threshold : 0.0,  // 2.0 seemed good enough
    
        max_dist_err_last_phase_threshold : 5.5, //5.5,
        normal_loop_count : 50,
        last_phase_loop_count : 500,  // re-configured at below
        large_angle_threshold : Math.cos(Math.PI * 2 / 3),
    
        // marks with red for the circle which has max error
        mark_with_red_for_max_dist_err_circle : true,
        // draws delaunay triangles 
        draw_triangles : true,
        // draws without arranging
        just_show_initial_status : false
    }
    _opt.last_phase_loop_count = Math.max(
        _opt.last_phase_loop_count, _opt.number_of_random_points);

    var _canvas;
    
    var _origin;
    var _radius;
    var _r2;

    var _timer;
    var _interval;
    
    var _WPI = Math.PI * 2;
    var _HPI = Math.PI / 2;

    // ------------------------------------------------
    function circlePackMain(canvas){
        _canvas = canvas;
        _timer = new TimeChecker();
       
        var points = getInitialPoints();
        if(points.length < 3) return;
        
        var circles;
        var loopTimes = 0;
        var isLast = false;
        var max_dist_err = _opt.max_dist_err_threshold + 1;
        var max_dist_err_idx = -1;

        var circlePackLoop = function(){
            loopTimes++;
            console.log("loop: " + loopTimes);
            
            clearRect();
            
            circles = getCirclesByTriangulation(points);
            if( _opt.just_show_initial_status){
                clearInterval(_interval);
                _timer.showResult();
            }
            
            circles = arrangeCircles(circles, isLast);
    
            // check errors
            var max_dist_err_squared = 0;
            max_dist_err_idx = -1;
            for(var ci = 0, ciEnd = circles.length; ci < ciEnd; ci++){
                var error = circles[ci].verifyR();
                if(error > max_dist_err_squared){
                    max_dist_err_squared = error;
                    max_dist_err_idx = circles[ci].idx;
                }
            }
            max_dist_err = Math.sqrt(max_dist_err_squared)
            console.log("-- max_dist_err=" + max_dist_err);

            var pfx = isLast ? "done : " : "";
            var textColor = isLast ? "#f00" : "#000";
            drawText(pfx + "loop " + loopTimes + " : max err = " + max_dist_err, 10, 10, textColor);
            
            drawCircles(circles, max_dist_err_idx);
            
            if(isLast){
                clearInterval(_interval);
                _timer.showResult();
            } else {
                if(max_dist_err < _opt.max_dist_err_last_phase_threshold){
                    isLast = true;
                    console.log("#### next loop is the last phase");
                }
    
                points = [];
                for(var ci = 0, ciEnd = circles.length; ci < ciEnd; ci++){
                    points.push(circles[ci].o);
                }
            }
        }
        _interval = setInterval(circlePackLoop, 100);
    }
    // ------------------------------------------------
    function clearRect(){
        _canvas.getContext("2d").clearRect(0, 0, _canvas.width, _canvas.height);
    }
    // ------------------------------------------------
    function drawCircles(circles, max_dist_err_idx){
        //if( ! _opt.just_show_initial_status) clearRect();
        
        if(_opt.mark_with_red_for_max_dist_err_circle){
            console.log("-- max dist err index = " + max_dist_err_idx);
            
            for(var i = 0, iEnd = circles.length; i < iEnd; i++){
                var c = circles[i];
                drawCircle2(c, c.idx == max_dist_err_idx);
            }
        } else {
            for(var i = 0, iEnd = circles.length; i < iEnd; i++){
                var c = circles[i];
                drawCircle(c.o, c.r);
            }
        }
    }
    // ------------------------------------------------
    // only 1 object is selected -> random point mode : generates points inside the object.
    // otherwise -> selected circles mode : gets selected paths (= circles).
    // returns : an array of Point
    function getInitialPoints(){
        var points = [];
        
        // random point mode
        points = distributeRandomPointsInRect(
            _opt.number_of_random_points, _opt.min_initial_radius * 2);
        
        console.log("-- " + points.length + " points prepared");
        return points;
    }
    // ------------------------------------------------
    // count : number of random points to generate
    // min_dist : minimum distance between points
    // returns : an array of Point
    function distributeRandomPointsInRect(count, min_dist){
        var points = [];
        var p, ok;
        
        var min_dist2 = min_dist * min_dist;
        var rect = { left:0, top:0, right:_canvas.width, bottom:canvas.height,
            width:_canvas.width, height:_canvas.height };

        _origin = new Point((rect.left + rect.right)/2,
                            (rect.top + rect.bottom)/2);
        _radius = (rect.width / 2);
        _r2 = _radius * _radius;
        
        var r = _radius - _opt.min_initial_radius;
        
        for(var i = 0; i < count; i++){
            while(true){
                var t = Math.random() * Math.PI;
                var a = Math.random() * Math.PI;
                
                p = new Point(r * Math.sin(t) * Math.cos(a) + _origin.x,
                              r * Math.cos(t) + _origin.y , i);
                
                ok = true;
                for(var pi = 0, piEnd = points.length; pi < piEnd; pi++){
                    if(points[pi].dist2(p) < min_dist2){
                        ok = false;
                        break;
                    }
                }
                if(ok) break;
            }
            points.push(p);
        }
        
        return points;
    }
    // --------------------------------------
    // points : an array of Point
    // returns : an array of Circle
    function getCirclesByTriangulation(points){
        var p, c;
        var triangles = delaunay(points);
     
        // gets tmp radius
        for(var key in triangles){
            triangles[key].findTmpRadiusForEachVertex();
        }
    
        // sets radius
        for(var i = 0, iEnd = points.length; i < iEnd; i++){
            points[i].fixInitialRadius();
        }
    
        // creates circles
        var circles = [];
        for(var i = 0, iEnd = points.length; i < iEnd; i++){
            p = points[i];
            if(p.r == 0) continue;
            c = new Circle(p, p.r, i);
            circles.push(c);
        }
    
        // correlates vertex of triangles to each circle
        for(var key in triangles){
            var t = triangles[key];
            for(var ci = 0, ciEnd = circles.length; ci < ciEnd; ci++){
                circles[ci].addTriangle(t, circles);
            }
        }
        
        // converts vertice to circles and detect if each circle is surrounded by others
        var tmp_circles = [];
        for(var ci = 0, ciEnd = circles.length; ci < ciEnd; ci++){
            c = circles[ci];
            c.fixCircles(circles);
            c.detectSurrounded();
        }
    
        // removes circles unsuitable to tangent
        tmp_circles = [];
        for(var ci = 0, ciEnd = circles.length; ci < ciEnd; ci++){
            c = circles[ci];
            c.removeInvalidCircles();
            if(c.circles.length > 0) tmp_circles.push(c);
        }
        circles = tmp_circles;
    
        // draws the initial status
        if(_opt.just_show_initial_status || _opt.draw_triangles){
            for(var key in triangles){
                var tri = triangles[key];
                triangles[key].draw();
            }
        }
       
        return circles;
    }
    // --------------------------------------
    // arranges center and radius of each circle
    // circles : an array of Circle
    // isLast : true if it is the last loop
    function arrangeCircles(circles, isLast){
        console.log("-- arrange: " + circles.length + " circles");
        
        var loop_times = _opt.normal_loop_count;
        if(isLast) loop_times = _opt.last_phase_loop_count;
        var notify_loop_count = 200;
        
        var i = 0;
        for(; i < loop_times; i++){
            c_len = circles.length;
            for(var ci = 0; ci < c_len; ci++) circles[ci].findO();
            for(var ci = 0; ci < c_len; ci++) circles[ci].fixO();
            
            for(var ci = 0; ci < c_len; ci++) circles[ci].findR();
            for(var ci = 0; ci < c_len; ci++) circles[ci].fixR();
            
            if(i > 0 && i % notify_loop_count == 0) console.log(" " + i);
        }
        // if(i > notify_loop_count) console.log(".");
        return circles;
    }
    
    // --------------------------------------
    // delaunay triangulation
    // points : an array of Point
    
    // To implement the Delaunay triangulation, I referred to the following page
    // (in Japanese) by Tercel.  Thanks for helpful description of algorithm.  
    // http://tercel-sakuragaoka.blogspot.jp/2011/06/processingdelaunay.html
    function delaunay(points){
        function addElementToRedundanciesMap(set, tri){
            if(tri.key in set){
                set[tri.key].overlap = true;
            } else {
                set[tri.key] = tri;
            }
        }
    
        // key : Triangle._getKey
        // value : Triangle instance
        var triangles = {};
    
        var  hugeTriangle = getHugeTriangle(points);
        triangles["huge"] = hugeTriangle;
        
        for(var i = 0, iEnd = points.length; i < iEnd; i++){
            var p = points[i];
            var tmp_triangles = {};
    
            for(var key in triangles){
                var t = triangles[key];
    
                if(t.isInsideCircle(p)){
                    addElementToRedundanciesMap(tmp_triangles, new Triangle(p, t.p1, t.p2));
                    addElementToRedundanciesMap(tmp_triangles, new Triangle(p, t.p2, t.p3));
                    addElementToRedundanciesMap(tmp_triangles, new Triangle(p, t.p3, t.p1));
                    delete triangles[key];
                }
            }
    
            for(var key in tmp_triangles){
                var t = tmp_triangles[key];
                if( ! t.overlap) triangles[t.key] = t;
            }
       }
    
        for(var key in triangles){
            if(hugeTriangle.hasCommonPoints(triangles[key])) delete triangles[key];
        }
    
        return triangles;
        /* for(var key in triangles){
            triangles[key].draw();
        } */
    }
    // ------------------------------------------------
    // points : an array of Point
    // returns : Triangle
    function getHugeTriangle(points){
        var rect = getRectForPoints(points);
    
        var center = new Point((rect.left + rect.right) / 2,
                               (rect.top + rect.bottom) / 2);
        var topleft = new Point(rect.left, rect.top);
        var radius = center.dist(topleft);
    
        var x1 = center.x - Math.sqrt(3) * radius;
        var y1 = center.y + radius;
        var p1 = new Point(x1, y1, -1);
    
        var x2 = center.x + Math.sqrt(3) * radius;
        var y2 = center.y + radius;
        var p2 = new Point(x2, y2, -2);
    
        var x3 = center.x;
        var y3 = center.y - 2 * radius;
        var p3 = new Point(x3, y3, -3);
    
        return new Triangle(p1, p2, p3);
    }
    // ------------------------------------------------
    // t : Triangle
    // returns : Circle
    function getCircumscribedCirclesOfTriangle(t){
        var x1 = t.p1.x;
        var y1 = t.p1.y;
        var x2 = t.p2.x;
        var y2 = t.p2.y;
        var x3 = t.p3.x;
        var y3 = t.p3.y;
        
        var c = 2.0 * ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1));
        var x = ((y3 - y1) * (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1)
                 + (y1 - y2) * (x3 * x3 - x1 * x1 + y3 * y3 - y1 * y1))/c;
        var y = ((x1 - x3) * (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1)
                 + (x2 - x1) * (x3 * x3 - x1 * x1 + y3 * y3 - y1 * y1))/c;
        
        var center = new Point(x, y);
        var radius = center.dist(t.p1);
        
        return new Circle(center, radius);
    }
    // ------------------------------------------------
    // Point
    // x, y : float
    // idx : unique index
    var Point = function(x, y, idx){
        this.x = x;
        this.y = y;
        this.idx = idx;
        
        this.tmpRs = [];
        this.r = 0;
        
        this.distFromCenter = 0;
    }
    Point.prototype = {
        eq : function(p){  // p : point
            return this.x == p.x && this.y == p.y;
        },
        set : function(x, y){
            this.x = x;
            this.y = y;
        },
        setP : function(p){  // p : point
            this.x = p.x;
            this.y = p.y;
        },
        dist2 : function(p){  // p : point
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return dx * dx + dy * dy;
        },
        dist : function(p){  // p : point
            return Math.sqrt(this.dist2(p)) || 0;
        },
        fixInitialRadius : function(){
            if(this.tmpRs.length > 0){
                var r = average(this.tmpRs);
                var d = this.dist(_origin);
                if(d + r > _radius) r = _radius - d;
                this.r = r;
            }
        },
        toArray : function(){
            return [this.x, this.y];
        },
        toString : function(){
            return "[" + this.x + ", " + this.y + "]";
        }
    }
    
    // ------------------------------------------------
    // Triangle
    // p1, p2, p3 : vertice of a triangle (Point)
    var Triangle = function(p1, p2, p3){
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        
        // circumcircle
        var circumCircle = getCircumscribedCirclesOfTriangle(this);
        this.o = circumCircle.o;
        this.r2 = circumCircle.r * circumCircle.r;
        this.key = this._getKey();
        this.overlap;
        
        this.line1 = defline2(p1, p2);
        this.line2 = defline2(p2, p3);
    }
    Triangle.prototype = {
        // for delaunay : begin
        _getKey : function(){
            var r = [this.p1.idx, this.p2.idx, this.p3.idx];
            r.sort();
            return r.join("_");
        },
        _hasCommon_sub : function(p, tri){  // p : Point, tri : Triangle
            return p.eq(tri.p1) || p.eq(tri.p2) || p.eq(tri.p3);
        },
        hasCommonPoints : function(tri){  // tri : Triangle
            return this._hasCommon_sub(this.p1, tri)
              || this._hasCommon_sub(this.p2, tri)
                || this._hasCommon_sub(this.p3, tri);
        },
        isInsideCircle : function(p){  // p : point
            return p.dist2(this.o) <= this.r2;
        },
        // for delaunay : end
        
        // for circle packing : start
        _findIncircleCenter : function(){
            var t1 = getAngle(this.p2, this.p1);
            var t2 = getAngle(this.p2, this.p3);
            var t3 = getAngle(this.p3, this.p1);
            
            var t = (t1 + t2) % _WPI
              var line1 = getAngleLine(this.p2, t / 2);
            t = (t2 + Math.PI + t3) % _WPI;
            var line2 = getAngleLine(this.p3, t / 2);
            
            var o = getIntersection(line1, line2);
            return o;
        },
        findTmpRadiusForEachVertex : function(){
            var o = this._findIncircleCenter();
            var foot1 = findFootOfPerpendicularForGivenLine(o, this.line1);
            var foot2 = findFootOfPerpendicularForGivenLine(o, this.line2);
            this.p1.tmpRs.push(foot1.dist(this.p1));
            this.p2.tmpRs.push(foot1.dist(this.p2));
            this.p3.tmpRs.push(foot2.dist(this.p3));
        },
        // for circle packing : end
        
        draw : function(){
            drawPolygon([this.p1, this.p2, this.p3]);
        },
        toString : function(){
            return "Triangle[" + (this.key || "-") + "]";
        }
    }
    
    // --------------------------------------
    // Circle
    // o : center (Point)
    // r : radius (float)
    // idx : unique index
    var Circle = function(o, r, idx){
        this.o = o;
        this.r = r;
        this.idx = idx;
    
        this.circles = [];
        this.verticeIndexCounter = {};  // key:Point.idx, value:Point.idx or -1
        this.circleIdxs = {};  // key:Circle.idx, value:index in this.circles
    
        this.isSurrounded = false;
        this.angle = 0;
    
        this.tmpR = 0;
        this.tmpO = new Point(0, 0);
    }
    Circle.prototype = {
        _addIdx : function(idx1, idx2){
            this._addVerticeIndexCounter(idx1, idx2);
            this._addVerticeIndexCounter(idx2, idx1);
        },
        _addVerticeIndexCounter : function(idx1, idx2){
            if(idx1 in this.verticeIndexCounter){
                this.verticeIndexCounter[idx1] = -1;
            } else {
                this.verticeIndexCounter[idx1] = idx2;
            }
        },
        addTriangle : function(t, circles){
            if(t.p1.idx == this.idx){
                this._addIdx(t.p2.idx, t.p3.idx);
            } else if(t.p2.idx == this.idx){
                this._addIdx(t.p1.idx, t.p3.idx);
            } else if(t.p3.idx == this.idx){
                this._addIdx(t.p1.idx, t.p2.idx);
            }
        },
        fixCircles : function(circles){
            for(var idx in this.verticeIndexCounter){
                var circle = circles[idx];
                this.circles.push(circle);
                this.circleIdxs[idx] = this.circles.length - 1;
            }
        },
        findO : function(){
            var x = 0;
            var y = 0;
            var len = this.circles.length;
            for(var i = 0; i < len; i++){
                var circle = this.circles[i];
                var t = getAngle(circle.o, this.o);
                x += Math.cos(t) * (this.r + circle.r) + circle.o.x;
                y += Math.sin(t) * (this.r + circle.r) + circle.o.y;
            }
            
            if( ! this.isSurrounded){
                var t = getAngle(_origin, this.o);
                x += Math.cos(t) * (_radius - this.r) + _origin.x;
                y += Math.sin(t) * (_radius - this.r) + _origin.y;
                len++;
            }
            this.tmpO.set(x / len, y / len);
        },
        fixO : function(){
            var d2 = _origin.dist2(this.tmpO);
            if(d2 > _r2){
                var t = getAngle(_origin, this.tmpO);
                var r = _radius - this.r;
                this.tmpO = new Point(Math.cos(t) * r + _origin.x,
                                      Math.sin(t) * r + _origin.y);
            }
            this.o.setP(this.tmpO);
        },
        findR : function(){
            var totalLen = 0;
            var len = this.circles.length;
            for(var i = 0; i < len; i++){
                var circle = this.circles[i];
                totalLen += circle.o.dist(this.o) - circle.r;
            }
            
            if( ! this.isSurrounded){
                totalLen += _radius - _origin.dist(this.o);
                len++;
            }
            this.tmpR = totalLen / len;
        },
        fixR : function(){
            var d = _origin.dist(this.o);
            if(d + this.tmpR > _radius){
                this.tmpR = Math.max(_radius - d, 1);
            }
            this.r = this.tmpR;
        },
        detectSurrounded : function(){
            this.isSurrounded = true;
            for(var idx in this.verticeIndexCounter){
                if(this.verticeIndexCounter[idx] >= 0){
                    this.isSurrounded = false;
                    break;
                }
            }
        },
        removeInvalidCircles : function(){
            if( ! this.isSurrounded){
                var invalid_idx = [];
                
                for(var i = 0, iEnd = this.circles.length; i < iEnd; i++){
                    var c = this.circles[i];
                    
                    if(c.idx in this.verticeIndexCounter && (! c.isSurrounded)){
                        var idx1 = this.verticeIndexCounter[c.idx];  // Circle.idx
                        if(idx1 >= 0){
                            // index in this.circles
                            var other_idx = this.circleIdxs[idx1];
                            
                            if(hasLargeAngle(this.o, this.circles[other_idx].o, c.o)){
                                invalid_idx.push(i);
                            }
                        }
                    }
                }
                
                if(invalid_idx.length > 1){
                    invalid_idx.sort();
                    for(var i = invalid_idx.length - 1; i >= 0; i--){
                        this.circles.splice(invalid_idx[i], 1);
                    }
                } else if(invalid_idx.length > 0){
                    this.circles.splice(invalid_idx[i], 1);
                }
            }
        },
        verifyR : function(){
            var max_dist_err_squared = 0;
            for(var i = 0, iEnd = this.circles.length; i < iEnd; i++){
                var circle = this.circles[i];
                var rr = this.r + circle.r;
                var error = Math.abs(this.o.dist2(circle.o) - rr * rr);
                if(error > max_dist_err_squared){
                    max_dist_err_squared = error;
                }
            }
            return max_dist_err_squared;
        },
        toString : function(){
            return "Circle[" + this.idx + "]";
        }
    }
    
    // ------------------------------------------------
    // draws a polygon
    // points : an array of coordinates [x, y]([float, float])
    // returns : a pathitem drawn
    function drawPolygon(points, strokeColor){
        if( ! strokeColor) strokeColor = "#ccc";
        
        var ctx = _canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.lineWidth = _opt.stroke_width;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    // ------------------------------------------------
    // draws a circle
    // o : center (Point)
    // r : radius (float)
    function drawCircle(o, r, strokeColor){
        if( ! strokeColor) strokeColor = "#000";
        
        var ctx = _canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(o.x, o.y, r, 0, _WPI, true);
        ctx.lineWidth = _opt.stroke_width;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    // ------------------------------------------------
    // c : Circle
    // has_max_err : bool
    function drawCircle2(c, has_max_err){
        var strokeColor = has_max_err ? "#f00" : "#000";
        drawCircle(c.o, c.r, strokeColor);
    }
    // ------------------------------------------------
    function drawText(txt, x, y, color){
        if( ! color) color = "#000";
        
        var ctx = _canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.font= '10px sans-serif';
        ctx.fillText(txt, x, y);
    }
    // ------------------------------------------------
    // sum
    // r : an array of numbers
    function sum(r){
        var total = 0;
        for(var i = 0, iEnd = r.length; i < iEnd; i++){
            total += r[i];
        }
        return total;
    }
    // ------------------------------------------------
    // average
    // r : an array of numbers
    function average(r){
        if(r.length == 0) return 0;
        return sum(r) / r.length;
    }
    // ------------------------------------------------
    // returns angle of line drawn from p1 to p2
    // p1, p2 : Point
    // returns : angle (radian) (float)
    function getAngle(p1, p2) {
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        return Math.atan2(y, x);
    }
    // ------------------------------------------------
    // equation of the line drawn through p1 and p2
    // returns : [a, b, c] for ax + by + c 
    function defline(p1, p2){
        var a = p1.y - p2.y;
        var b = p1.x - p2.x;
        return [a, -b, b * p1.y - a * p1.x];
    }
    // ------------------------------------------------
    // equation of the line drawn through p1 and p2
    // returns : [a, b, c] for ax + by + c (a^2 + b^2 = 1)
    function defline2(p1, p2){
        if(p1.x == p2.x) return [1, 0, -p1.x];
        if(p1.y == p2.y) return [0, 1, -p1.y];
        var a = (p2.y - p1.y)/(p2.x - p1.x);
        var d = Math.sqrt(a * a + 1) || 0;
        return [a/d, -1/d, (p1.y - a * p1.x)/d];
    }
    // ------------------------------------------------
    // equation of the line drawn from p1 and has angle t
    // p1 : Point
    // t : angle (radian)
    function getAngleLine(p1, t){
        var m = 100;
        var p2 = new Point(Math.cos(t) * m + p1.x,
                           Math.sin(t) * m + p1.y);
        return defline(p1, p2);
    }
    // ------------------------------------------------
    // intersection coordinate
    // p, q : line ([a, b, c] for ax + by + c)
    // returns : Point
    function getIntersection(p, q){
        var d = p[0] * q[1] - p[1] * q[0];
        if(d == 0){
            console.log("d == 0");  // parallel
            return [];
        }
        return new Point(
            (q[2] * p[1] - p[2] * q[1]) / d,
            (p[2] * q[0] - q[2] * p[0]) / d);
    }
    // ------------------------------------------------
    // foot of perpendicular drawn from a point to a line
    // o : Point
    // line : [a, b, c] for ax + by + c 
    function findFootOfPerpendicularForGivenLine(o, line){
        // line : defline2(p1, p2);
        var d = line[0] * o.x + line[1] * o.y + line[2];
        return new Point(o.x - d * line[0], o.y - d * line[1]);
    }
    // ------------------------------------------------
    // tests if a triangle has large angle at the vertex p1
    // large angle = the cosine value is lower than _opt.large_angle_threshold
    // o, p1, p2 : Point (vertex of a triangle)
    // returns : true if there's large angle at p1
    function hasLargeAngle(o, p1, p2){
        var d1 = o.dist(p1);
        var d2 = o.dist(p2);
        var d3 = p1.dist(p2);
    
        return findCos(d2, d3, d1) < _opt.large_angle_threshold;
    }
    // ------------------------------------------------
    // law of cosines
    function findCos(d1, d2, d3){
        return (d1 * d1 + d2 * d2 - d3 * d3) / (2 * d1 * d2);
    }
    // ------------------------------------------------
    // finds spec of a rectangle which surrounds given points
    // points : an array of Point
    // returns : rect object
    function getRectForPoints(points){
        var p = points[0];
        var rect = { left:p.x, top:p.y, right:p.x, bottom:p.y };
        
        for(var i = 1, iEnd = points.length; i < iEnd; i++){
            p = points[i];
            if(p.x < rect.left) rect.left = p.x;
            if(p.x > rect.right) rect.right = p.x;
            if(p.y < rect.top) rect.top = p.y;
            if(p.y > rect.bottom) rect.bottom = p.y;
        }
        return rect;
    }
    // --------------------------------------
    // function to display elapsed time at the end
    var TimeChecker = function(){
        this.start_time = new Date();
        
        this.showResult = function(){
            var stop_time = new Date();
            var ms = stop_time.getTime() - this.start_time.getTime();
            var hours = Math.floor(ms / (60 * 60 * 1000));
            ms -= (hours * 60 * 60 * 1000);
            var minutes = Math.floor(ms / (60 * 1000));
            ms -= (minutes * 60 * 1000);
            var seconds = Math.floor(ms / 1000);
            ms -= seconds * 1000;
            console.log("END: " + hours + "h " + minutes + "m " + seconds + "s " + ms);
        }
    }
    // --------------------------------------
    CirclePack = {
        draw : function(canvas){ circlePackMain(canvas); }
    }
    
    //circlePackMain();
})();

