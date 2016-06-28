illustrator-circlepacking : variations
======================
[readme in Japanese](https://github.com/shspage/illustrator-circlepacking/blob/master/variations/readme_ja.md) 

## circlepacking_in_a_circle.jsx

![desc_circlepack_in_a_circle](https://github.com/shspage/illustrator-circlepacking/raw/master/variations/img/desc_circlepack_in_a_circle.png)

**USAGE** : Select a circle (or already drawn circles in a circle), and run this script.

In this variation, I added some restriction in moving range to the original script.
It is still based on Euclidean geometry.

Because of the restriction, it seems that the convergence is relatively slow.
So I set a large value for "max_dist_err_last_phase_threshold" -- one of the optional values.
The error can be small enough after the last phase, or it can't be.
Please note that **the final error can be noticeable.**
You can continue the process for adjusting, by selecting circles and running this script again.
Considering the usage like this, I added the process that excludes the outer circle from the selection.
So you can select it with circles.


----------------------
Copyright(c) 2016 Hiroyuki Sato  
[https://github.com/shspage](https://github.com/shspage)  
This script is distributed under the MIT License.  
See the LICENSE file for details.  
