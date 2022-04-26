illustrator-circlepacking : variations
======================

## circlepacking_in_a_circle.jsx

![desc_circlepack_in_a_circle](https://github.com/shspage/illustrator-circlepacking/raw/master/variations/img/desc_circlepack_in_a_circle.png)

**使い方** : 円形のパスを１つ（または、一度描かれた円のかたまり？）を選んで、スクリプトを実行してください。

この改変版は、調整時の移動範囲に円の外に出ないような制限を加えただけのものです。
なので、座標の計算などはまだユークリッド幾何学的にやっています。

制約のせいか収束が遅いようなので、
スクリプト中の設定値 "max_dist_err_last_phase_threshold"（最終フェーズに移る閾値）には大きすぎる値を設定しました。
最終フェーズで誤差が十分小さくなることもあれば、ならないこともあります。
このため、**描画結果では誤差がまだ大きい場合があります。**
描かれた円を選択して再度実行することで、調整を続行することができます。
このような使い方を想定したため、この際に外側の円が一緒に選択されていた場合は、選択から除外する処理も追加しています。


## circlepacking_in_a_circle_web.js

![desc_circlepack_in_a_circle_web](https://github.com/shspage/illustrator-circlepacking/raw/master/variations/img/desc_circlepack_in_a_circle_web.png)

circlepacking_in_a_circle.jsx を改変し、HTML5 canvas 上に描画するようにしたものです。  
収束のようすをアニメーションします。  
[実際の動作](http://shspage.com/ex/circlepacking_in_a_circle/index.html)をご覧ください。


----------------------
Copyright(c) 2016 Hiroyuki Sato  
[https://github.com/shspage](https://github.com/shspage)  
このスクリプトは MIT License で公開しています。  
詳細は LICENSE ファイルをご覧下さい。
