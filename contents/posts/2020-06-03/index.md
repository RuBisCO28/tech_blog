---
title:      "Balsara's Bankruptcy Prediction"
date:       "2020-06-03"
category: "JA"
---

## はじめに
最近FXのデモトレードができるアプリ「FXなび」で何回か取引をしていく中で、  
資金管理と投資ルールが重要だなと感じたので、ナウザー・バルサラという数学者が、  
破産確立について考えたトレードルールの安全性と期待値の高さが分かる表について  
今回はデモトレードのデータも交えて紹介します。　

## データセット
今回扱う下記データは、計62回に渡ってデモトレードしたときの損益データ(手入力)です。  

https://github.com/RuBisCO28/Balsara/blob/master/trade.csv

```text
データセットの詳細
レコード数 	62
カラム数 	2

各カラムの構成
order        取引順番 	
profit(円)   損益(マイナスは損)
```

## 破産確率
下記3つの数値(勝率、損益率、リスクにさらす資金比率)から、トレードを続けたときの破産確率をバルサラの破産確率表と合わせて導き出します。  
なお、口座資金は1325153円と仮定します。

```python
import pandas as pd

df = pd.read_csv('trade.csv')

# 勝率（％） ＝ 勝ちトレード数 ÷ 総トレード数 × 100
win = (len(df[df["Profit"]>0]) / len(df)) * 100

# 損益率（倍） ＝ トレードの平均利益額 ÷ トレードの平均損失額
risk_reward = df[df["Profit"]>0]["Profit"].mean() / ((df[df["Profit"]<0]["Profit"].mean())*-1.0)

# リスクにさらす資金比率（％） ＝ 1トレードの許容損失額 ÷ 口座資金 × 100
# 自分が設定している最大損失額を決めていないので、今までの最大ロスカットの金額
risk_rate = (-1.0 * df[df["Profit"]<0]["Profit"].min()) / 1325153
print("勝率: " + str(win) + "%")
print("損益率: " + str(risk_reward))
print("リスク資金比率: " + str(risk_rate*100) + "%")
```

```text
勝率(%): 75.80645161290323%
損益率（倍）: 1.4789110090933166
リスク資金比率(%): 1.092704012291411%
```

最後にリスク資金比率1%の下記バルサラの破産確立表から、破産確率は0%とわかる。

![2](/img/balusara/table.png)

## バルサラの破産確率表の導出方法
さて破産確率0%なので安心。。。とはなりません。  
そもそもこの表どこから出てきたのか、そして必ずしも同じリスク比率でトレードするとは限らないなど疑問が出てくるはず。
そこで実際にこの表を作成していきます。  
資金がn円のときの破産確率をQ(n)とします。
勝ったらW円もらえるとし、負けたらL円失うような取引を1回行った後は、
資金は n + W円か、n – L円になっています。

```text
資金: n円
勝ち: n + W円
負け: n - L円
```

ここで勝つ確率をpとすると破産確率は

```text
取引前: Q(n)
勝ったことにより、n+W円を持ち破産していない確率： pQ(n+W)
負けたことにより、n-L円になったが破産していない確率： (1-p)Q(n-L)
```

取引前の破産確率と、取引後の全ての事象の破産確率の和は等しいので、以下の確率変数の式が成立します。

```text
Q(n) = pQ(n+W) + (1-p)Q(n-L)
```

ここで勝ったらWもらえ、負けたらL失うということは、数学的には、
勝ったらW/Lもらえ、負けたら1失うということと等しい
以上よりW/Lをkとおくと

```text
Q(n) = pQ(n+k) + (1-p)Q(n-1)
```

この漸化式の一般項Q(n)を解くには、以下の特性方程式を解きます。

```text
x = px^(k+1) + (1-p)
```

この方程式の0<x<1での解をrとすると、破産確率Q(n)は

```text
Q(n) = x^(n/L)
```

この式をもとに
なお、xは0.000～1.000まで0.001刻みで計算し、x>=0の条件でもっとも0に近い値を算出する。
なお、先ほどの表はリスク資金比率0.01で出力したものである

```python
import argparse
import io

# 特性方程式(x = px^(k+1) + (1-p))のxの値を取得する。
def getX(incomeRate, winningRate):
    k = incomeRate
    p = winningRate
    
    resultX = 0.00
    memory = -0.01
    for i in range(1, 1000, 1):
        x = i/1000
        check = p * pow(x, k+1) + (1 - p) - x
        if check < 0:
            check *= -1

        if memory == -0.01 or memory > check:
            memory = check
            resultX = x

    return resultX
    
# バルサラの破産確率を取得
def getBankruptcyPercent(costRate, incomePercent, winningPercent):
    if winningPercent == 100:
        return 0.0

    incomeRate = incomePercent / 100
    winningRate = winningPercent / 100
    
    # p≦b/(a + b)の場合は必ず破産。
    # b/(a+b) = 1/(incomeRate+1)
    # b: 損失額 、 a: 利益額
    if winningRate <= 1/(incomeRate+1):
        return 1.0
    
    return pow(getX(incomeRate,winningRate),1/costRate)

if __name__ == '__main__':
    argParser = argparse.ArgumentParser()
    # 資金に対する損失率
    argParser.add_argument("costRate")
    args = argParser.parse_args()
    
    costRate    = float(args.costRate) # 資金に対する最大損失の割合
    winningPercent = 10         # 勝率[%]
    incomePercent  = 10         # 損益率[%]

    # 損益率は10%ずつ増やしていく
    incomeInterval = 10
    winInterval = 10
    
    print("," , end='')
    for i in range(9):
        print(str(winningPercent) + "," , end='')
        winningPercent += winInterval
    print()
    winningPercent = 20
    
    for i in range(20):
        winningPercent = 20
        bankruptcyPercentList = []
        # 勝率は10%ずつ増やしていく
        for j in range(9):
            bankruptcyPercentList.append(getBankruptcyPercent(costRate, incomePercent, winningPercent))
            winningPercent += winInterval
        
        print(str(incomePercent) + "," , end='')
        for k in bankruptcyPercentList:
            print( "{0:.2f}".format(k*100) + "," , end='')
        
        print()
        
        incomePercent += incomeInterval
```

##  最後に一言
さて、バルサラの破産確率の導き出しから、定額での破産確率を表にまとめたものだということがわかりました。  
FXなびのデモトレードは、Lvがあがらないとlot数が増やせないやスプレッドなどがあるLvまでないなどあるので、
実際の取引データとは言い難く、また実際のトレードでも必ずしも同じリスク比率でトレードするとは限らないです。  
ただし、この表から破産のリスクは勝率が高くなるにつれて低下し、低下の大きさはリスクにさらす資本の割合に依存するということがわかると思います。  
ついついレバレッジや取引量を増やし、勝負に出たいところですが、
一度の取引において大きな額をリスクにさらさないことを徹底するルールを設け、退場しないようにすることも大切なことに気づきます。(戒め)
