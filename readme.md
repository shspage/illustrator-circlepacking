illustrator-circlepacking
======================
[readme in Japanese](hhttps://github.com/shspage/illustrator-circlepacking/blob/master/readme_ja.md) 

**Use Download button (on the right side of this page) to download ZIP file.**  
**If you use right click on each file to save, you'll get an HTML file.**

This is a script for Adobe Illustrator that draws non overlapping tangent circles, in Euclidean geometry.

![desc_circlepack01](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack01.png)

**USAGE**: Select a rectangle path or circles, and run this script.

**mode-1** : if only 1 object is selected : generates random points inside it.  
**mode-2** : if 3 or more path is selected : arranges selected circles. (draws arranged circles **anew**)

You can edit the number of random points and other settings. They are at the beginning of the script.

You'll notice big circles on the edge.  Please think them like the heel of bread.


## WARNING
It's highly recommended that you run this script with **ExtendScript Toolkit**, so that you can interrupt to abort using cancel button.  Also you can see transition of error value while it is running. **This script can run forever in certain condition.**  
![desc_circlepack05b](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack05b.png)


## error value
While running, this script displays "**max dist error**" in the console of ExtendScript Toolkit.
It means the maximum distance between circles. Of course 0.0 is ideal.  But 2.0 or lower value seemed good enough.
If it keep growing or is seemed hard to converge, something is wrong.  You should abort the process.


## example
This is an example image which applied path-offset effect after generated circles.

![desc_circlepack04a](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack04a.png)


## algorithm
I don't know if this is the best way.  But it produces the fastest and the most accurate result for now.  I guess there're more mathematically convincing methods.

1. In mode-1, it generates random points inside the selected object (supposed a rectangle path).

2. Applies the Delaunay triangulation to the points.
Assuming the drawn triangles are ideal for packing (though it never be), it determines an ideal radius for each vertex, using tangents of the incircle.  
![desc_circlepack02](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack02.png)

3. Finds the best position to each surrounding circles. And averages them to find temporary center.

4. Finds the best radius to each surrounding circles. And averages them to find temporary radius.  
![desc_circlepack03a](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack03a.png)

5. Repeats from "2" to "4" while the error value is greater than the threshold.

6. Repeats "3" and "4" many times for finishing.


## todo
Doing this in Hyperbolic geometry.


## references
To implement the Delaunay triangulation, I referred to the following page (in Japanese) by Tercel.  Thanks for helpful description of algorithm.  
[http://tercel-sakuragaoka.blogspot.jp/2011/06/processingdelaunay.html](http://tercel-sakuragaoka.blogspot.jp/2011/06/processingdelaunay.html)

----------------------
Copyright(c) 2016 Hiroyuki Sato  
[https://github.com/shspage](https://github.com/shspage)  
This script is distributed under the MIT License.  
See the LICENSE file for details.  
