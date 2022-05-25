---
title:      "DataCamp Part1: Introduction to Python"
date:       "2020-05-02"
category: "JA"
---

## はじめに
データサイエンスを学びつつ、Pythonでのデータ処理方法を学びたいということで  
Data Campの「Data Scientist with Python」を受講していきます。  
https://www.datacamp.com/  
章が進むにつれ、都度忘れるのでメモとして残していく。

## Python Basics
文字列にかけて2回出力はできる
```python
In [1]: "I said " + ("Hey " * 2) + "Hey!"
Out[1]: 'I said Hey Hey Hey!'
```

ただし、strとintのように方が違うものを一緒にそのままは表示できないので
```python
In [2]"The correct answer is " + 2
Out[2] Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    "The correct answer is " + 2
TypeError: must be str, not int
```

str()で数字を囲う必要がある
```python
In [3]: "The correct answer is "+str(2)
Out[3]: 'The correct answer is 2'
```

## Python Lists
listは異なるタイプの要素を混同させることができる
```python
areas = ["hallway",hall, "kitchen", kit, "living room", liv, "bedroom", bed, "bathroom", bath]
```

もちろんlist自身も内包できる。また内包してもlistとして扱い続けれれる
```python
>>> num_array = [[1, 2, 3], [4, 5, 7]]
>>> type(num_array)
<class 'list'>
```

配列の要素を指定するとき負の値を使える
```python
x = ["a", "b", "c", "d"]
x[1]
x[-3] # same result!
```

listの要素の範囲指定の仕方として例えば下記のリストの場合、1と2になる
配列の要素は0,1,2,3で指定した末尾の要素(3)は呼ばれないので1の"b"から2の"c"まで
```python
>>> x = ["a", "b", "c", "d"]
>>> x[1:3]
['b', 'c']
```

また指定しない場合、先頭からもしくは末尾までになる
```python
>>> x = ["a", "b", "c", "d"]
>>> x[:2]
['a', 'b']
>>> x[2:]
['c', 'd']
>>> x[:]
['a', 'b', 'c', 'd']
```

そして先程リスト内包ができると記述した通り、リストの中の要素のを指定するときにも
下記のような指定の仕方ができる
```python
>>> x = [["a", "b", "c"],
...      ["d", "e", "f"],
...      ["g", "h", "i"]]
>>> x[2][0]
'g'
>>> x[2][:2]
['g', 'h']
```

リストの結合は+で結び、
```python
>>> x = ["a", "b", "c", "d"]
>>> y = x + ["e", "f"]
>>> y
['a', 'b', 'c', 'd', 'e', 'f']
```

リスト内の要素はdel()で指定して削除する
```python
>>> x = ["a", "b", "c", "d"]
>>> del(x[1])
>>> x
['a', 'c', 'd']
```

## Functions and Packages
maxという関数の使い方見たいときは下記のように指定する参照できる
```python
help(max)
?max
```

関数によってはsortedのようにoptionつきのものもある
reverseで並び替え方向を降順に変える
```python
>>> first = [11.25, 18.0, 20.0]
>>> second = [10.75, 9.50]
>>> full = first + second
>>> full_sorted = sorted(full,reverse=True)
>>> print(full_sorted)
[20.0, 18.0, 11.25, 10.75, 9.5]
```

関数の他にmethodというものがある
例えば文字列をすべて大文字にしたり、特定の文字の数を数えたり
```python
>>> place = "poolhouse"
>>> place_up = place.upper()
>>> print(place_up)
POOLHOUSE     
>>> print(place.count('o'))
3
```

関数などを含んだpackageを呼び出すことで含まれる関数などを使用することができる
```python
>>> from math import radians
>>> radians(12)
0.20943951023931956
```

## Numpy
効率的な数値計算を行うことができ多次元配列もサポートするパッケージ
ということでlistをnumpy配列に変換するとtypeがnumpy.ndarrayになっている
```python
baseball = [180, 215, 210, 210, 188, 176, 209, 200]
import numpy as np

# Create a numpy array from baseball: np_baseball
np_baseball = np.array(baseball)

# Print out type of np_baseball
print(type(np_baseball))
<class 'numpy.ndarray'>
```

listと異なる点として同じ2をかけても結果が異なる
```python
>>> baseball = [180, 215, 210, 210, 188, 176, 209, 200]
>>> baseball * 2
[180, 215, 210, 210, 188, 176, 209, 200, 180, 215, 210, 210, 188, 176, 209, 200]
>>> import numpy as np
>>> n_baseball = np.array(baseball)
>>> n_baseball * 2
array([360, 430, 420, 420, 376, 352, 418, 400])
```

また特定の条件に合致するかなどもnumpyを使うことで比較でき抽出できる、便利
```python
>>> baseball > 200
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: unorderable types: list() > int()
>>> n_baseball > 200
array([False,  True,  True,  True, False, False,  True, False], dtype=bool)
>>> n_baseball[n_baseball > 200]
array([215, 210, 210, 209])
```

一方でlistと異なり、Numpyは異なるタイプの要素を混ぜることができない。  
一瞬できるように見えるが型強制が行われているだけである
```python
>>> np.array([1,2,3])*2
array([2, 4, 6])
>>> np.array([1,"AAA",3])*2
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: ufunc 'multiply' did not contain a loop with signature matching types dtype('<U21') dtype('<U21')
```

Numpy配列に変換した配列の構造を知る場合は、shapeメソッドが使用できる
```python
baseball = [[180, 78.4],
            [215, 102.7],
            [210, 98.5],
            [188, 75.2]]

import numpy as np
np_baseball = np.array(baseball)

# Print out the shape of np_baseball
print(np_baseball.shape)
<class 'numpy.ndarray'>
(4, 2)
```

numpy配列同士でも計算ができる
```python
>>> import numpy as np
>>> np_mat = np.array([[1, 2],
...                    [3, 4],
...                    [5, 6]])
>>> np_mat * 2
array([[ 2,  4],
       [ 6,  8],
       [10, 12]])
>>> np_mat + np.array([10, 10])
array([[11, 12],
       [13, 14],
       [15, 16]])
>>> np_mat + np_mat
array([[ 2,  4],
       [ 6,  8],
       [10, 12]])
```

methodを適用して平均や中央値なども計算することもできる
```python
>>> import numpy as np
>>> x = [1, 4, 8, 10, 12]
>>> np.mean(x)
7.0
>>> np.median(x)
8.0
```

##  最後に一言
基本的にどのプログラミング言語でも基礎の部分は一緒だけど、  
ライブラリなどが出てくると使いこなせれば便利な反面、いろいろそのライブラリ特有の型やメソッドがあったりするので  
いろいろ覚える必要がありそう。それにしてもnumpyでの演算は高速。。。