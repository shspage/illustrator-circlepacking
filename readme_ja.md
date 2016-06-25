illustrator-circlepacking
======================
**スクリプトをダウンロードするには、
[リポジトリトップページ](https://github.com/shspage/illustrator-circlepacking)
の右上あたりにある Clone or Download ボタンを押し、Download ZIP を選んでください。ファイル一覧の右クリックから「別名で保存」を実行して保存されるのは、リンク先のソース(HTMLファイル)です。**

互いに接した状態のたくさんの円を描く Adobe Illustrator 用スクリプトです。  
サークルパッキングというと↓の図じゃないような色んな定義とか想像する絵柄があるかもしれませんが、ここでは互いに余計な隙間も重なりもなく接した状態の複数の円がある状態とします。これをデザインなどに活用することを目的としています。  
Illustrator CS3, CC2015.3 で動作確認しました。

![desc_circlepack01](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack01.png)

**使い方**: 外枠の目安となる四角形のパスを１つ選択するか、たくさんの円形のパスを選択した状態で実行してください。

選択状態によって以下のモードが自動選択されます。  
**mode-1** : １つのオブジェクトが選択されている場合：枠内のランダムな位置に円を生成した状態で開始します。  
**mode-2** : ３つ以上のパスが選択されている場合：選択されているパス（円と見なす）の位置・大きさを調整します。（調整結果は新たに描画され、元のパスの色などは反映されません。）

ランダムに生成する円の数や、その他の編集できる設定項目がスクリプト冒頭にあります。

周辺に大きい円が出来ますが、パンの耳のようなものだと思ってください。


## 警告！
**ExtendScript Toolkit** でスクリプトを開いて実行することを強く強くおすすめいたします！  
なぜならキャンセルボタンがあるので途中で止めることができるからです。また、コンソールパレットで誤差が収束する様子も見ることができます。Illustrator のスクリプトメニューから実行した場合、**条件が悪いと、Illustrator を強制終了するしか止める方法がなくなる恐れがあります**。
![desc_circlepack05b](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack05b.png)


## 誤差表示
実行中、"**max dist error**" という値が ExtendScript Toolkit のコンソールに表示されます。  
これは現在の円と円との間隔の最大値です。もちろん 0.0 が理想的ですが、2.0以下であれば問題ないように思われます。
この値が増え続けたり、収束する様子が見られなかったりした場合は、何か悪い状態になっていると思われますので、
スクリプトを止めたほうが良いです。また、最終的な値が大きい場合は残念な箇所があるはずです。


## 作例
以下の画像は、円を描画してから「効果＞パス＞オフセット」を適用したものです。

![desc_circlepack04a](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack04a.png)


## アルゴリズム
現在の方法がベストかは分かりません。ただ今のところ色々試した中で最も速く、精確な結果を出しています。たぶん数学的にもっと説得力のある方法があるとは思うのですが。

1. mode-1 の場合、選択されたオブジェクトの幅と高さを持つ枠内の、ランダムな位置に点を生成します。

2. それらの点を元にドロネー三角形分割を行います。出来た三角形がサークルパッキングするのに理想的と仮定して（そんなわけはないのですが）、内接円の接点を元に、各頂点を中心に描く円の半径を決めます。  
![desc_circlepack02](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack02.png)

3. 周囲の各円に対して、接する場合の中心の位置を求めます。そしてそれらの位置を平均した位置を新たな中心とします。

4. 周囲の各円に対して、接する場合の半径を求めます。そしてそれらの半径を平均したものを新たな半径とします。  
![desc_circlepack03a](https://github.com/shspage/illustrator-circlepacking/raw/master/img/desc_circlepack03a.png)

5. "2" から "4" を、誤差が一定の値以下に収束するまで繰り返します。

6. "3" と "4" を多めに繰り返して仕上げとします。


## 今後の課題
これを双曲平面や球面でやりたいです。


## 参考にしたウェブページ
ドロネー三角形分割を実装するにあたり、以下の Tercel さんのページが大変参考になりました。ありがとうございます。アルゴリズムの分かりやすい説明と、processing 用のサンプルコードがあります。  
[http://tercel-sakuragaoka.blogspot.jp/2011/06/processingdelaunay.html](http://tercel-sakuragaoka.blogspot.jp/2011/06/processingdelaunay.html)

----------------------
Copyright(c) 2016 Hiroyuki Sato  
[https://github.com/shspage](https://github.com/shspage)  
このスクリプトは MIT License で公開しています。  
詳細は LICENSE ファイルをご覧下さい。
