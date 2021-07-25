---
title:      "DataCamp Part2: Intermediate Python"
date:       "2020-05-03"
category: "dev"
---

## はじめに
前回の続き。 
章が進むにつれ、都度忘れるのでメモとして残していく。

## Matplotlib
グラフライブラリ。plt.plotでx軸,y軸のデータをセットし、plt.show()でグラフ表示。
傾向がみられる場合、グラフから予測可能
```python
# Import matplotlib.pyplot as plt
import matplotlib.pyplot as plt

# Make a line plot: year on the x-axis, pop on the y-axis
plt.plot(year,pop)

# Display the plot with plt.show()
plt.show()
```

散布図はscatter。xscaleでlogで対数プロットにできる
相関性があるかなど見るときに使用。  
(You want to visually assess if longer answers on exam questions lead to higher grades)

```python
# Change the line plot below to a scatter plot
plt.scatter(gdp_cap, life_exp)

# Put the x-axis on a logarithmic scale
plt.xscale('log')

# Show plot
plt.show()
```

ヒストグラム。  
binsをうまくセットすることで分布の傾向をbig pictureで見れる。  
(You want to visually assess if the grades on your exam follow a particular distribution)

```python
# Build histogram with 5 bins
plt.hist(life_exp,bins=5)

# Show and clean up plot
plt.show()
plt.clf()

# Build histogram with 20 bins
plt.hist(life_exp,bins=20)

# Show and clean up again
plt.show()
plt.clf()
```

グラフにタイトル、ラベルを付ける方法

```python
# Add axis labels
plt.xlabel('xlab')
plt.ylabel('ylab')

# Add title
plt.title('title')
```

グラフの目盛を変える

```python
# Definition of tick_val and tick_lab
tick_val = [1000, 10000, 100000]
tick_lab = ['1k', '10k', '100k']

# Adapt the ticks on the x-axis
plt.xticks(tick_val,tick_lab)
```

散布図のサイズや透明度を変えたり、テキストやグリッドの追加

```python
# Specify c and alpha inside plt.scatter()
plt.scatter(x = gdp_cap, y = life_exp, s = np.array(pop) * 2, c = col, alpha=0.8)

# Additional customizations
plt.text(1550, 71, 'India')
plt.text(5700, 80, 'China')

# Add grid() call
plt.grid(True)
```

## Dictionaries & Pandas
Listだとindexで場所を特定し、違うリストで指定できるが、あまり直感的な方法ではない

```python
# List
# Definition of countries and capital
countries = ['spain', 'france', 'germany', 'norway']
capitals = ['madrid', 'paris', 'berlin', 'oslo']

# Get index of 'germany': ind_ger
ind_ger = countries.index('germany')

# Use ind_ger to print out capital of Germany
print(capitals[ind_ger])
```

そこでDictionaly型を使うことで、スマートにデータを取り扱える
具体的には、KeyとValueで辞書型を作成し、keyで値をとる方法である
参照だけでなく、追加・削除も可能

```python
# Definition of dictionary
europe = {'spain':'madrid', 'france':'paris', 'germany':'berlin', 'norway':'oslo' }

# Print out value that belongs to key 'norway'
print(europe['norway'])

# Add italy to europe
europe['italy'] = 'rome'

# Print out italy in europe
print('italy' in europe)

# Remove italy
europe.pop('italy')
```

複雑になるが、辞書の中に辞書をもてる

```python
# Dictionary of dictionaries
europe = { 'spain': { 'capital':'madrid', 'population':46.77 },
           'france': { 'capital':'paris', 'population':66.03 },
           'germany': { 'capital':'berlin', 'population':80.62 },
           'norway': { 'capital':'oslo', 'population':5.084 } }


# Print out the capital of France
print(europe['france']['population'])

# Create sub-dictionary data
data = { 'capital':'rome', 'population':59.83 }

# Add data to europe under key 'italy'
europe['italy'] = data
```

さて実際にデータを扱うときは行列形式のテーブルデータを取り扱うことが多いので
Pandasライブラリを使用してデータ処理を行うことができる

```python
# Pre-defined lists
names = ['United States', 'Australia', 'Japan', 'India', 'Russia', 'Morocco', 'Egypt']
dr =  [True, False, False, False, True, True, True]
cpc = [809, 731, 588, 18, 200, 70, 45]

# Import pandas as pd
import pandas as pd

# Create dictionary my_dict with three key:value pairs: my_dict
my_dict = {'country': names, 'drives_right': dr, 'cars_per_cap': cpc}

# Build a DataFrame cars from my_dict: cars
cars = pd.DataFrame(my_dict)

# Definition of row_labels
row_labels = ['US', 'AUS', 'JPN', 'IN', 'RU', 'MOR', 'EG']

# Specify row labels of cars
cars.index = row_labels

# Result(cars)
     cars_per_cap        country  drives_right
US            809  United States          True
AUS           731      Australia         False
JPN           588          Japan         False
IN             18          India         False
RU            200         Russia          True
MOR            70        Morocco          True
EG             45          Egypt          True
```

pandasを使用する利点としてcsvファイルの読み込み関数が備わっている点にある  
先ほどのデータを読み込んだものでindex_colで行のラベルをどれにするか指定できる

```python
# Fix import by including index_col
cars = pd.read_csv('cars.csv',index_col=0)
```

それぞれの値にアクセスする際の注意点として、Dataframeでとる場合は[]が二重にする必要がある。  
また行指定も可能

```python
# Print out country column as Pandas Series
print(cars['country'])

US     United States
AUS        Australia
JPN            Japan
IN             India
RU            Russia
MOR          Morocco
EG             Egypt
Name: country, dtype: object

# Print out country column as Pandas DataFrame
print(cars[['country']])

           country
US   United States
AUS      Australia
JPN          Japan
IN           India
RU          Russia
MOR        Morocco
EG           Egypt

# Print out DataFrame with country and drives_right columns
print(cars[['country','drives_right']])

           country  drives_right
US   United States          True
AUS      Australia         False
JPN          Japan         False
IN           India         False
RU          Russia          True
MOR        Morocco          True
EG           Egypt          True

# Print out first 3 observations
print(cars[0:3])

     cars_per_cap        country  drives_right
US            809  United States          True
AUS           731      Australia         False
JPN           588          Japan         False

```

ここでlabelベースのアクセス方法であるlocとindexベースのアクセス方法であるilocを紹介する

```python
# Print out observation for Japan
print(cars.loc['JPN'])
print(cars.iloc[2])

cars_per_cap      588
country         Japan
drives_right    False
Name: JPN, dtype: object

# Print out observations for Australia and Egypt
print(cars.loc[['AUS','EG']])
print(cars.iloc[[1, 6]])

     cars_per_cap    country  drives_right
AUS           731  Australia         False
EG             45      Egypt          True

# Print out drives_right value of Morocco
print(cars.loc['MOR','drives_right'])
print(cars.iloc[5,2])

True

# Print sub-DataFrame
print(cars.loc[['RU','MOR'],['country','drives_right']])
print(cars.iloc[[4,5],[1,2]])

     country  drives_right
RU    Russia          True
MOR  Morocco          True

# Print out drives_right column as DataFrame
print(cars.loc[:,['drives_right']])
print(cars.loc[:,1)

     drives_right
US           True
AUS         False
JPN         False
IN          False
RU           True
MOR          True
EG           True

# Print out cars_per_cap and drives_right as DataFrame
print(cars.loc[:,['cars_per_cap','drives_right']])
print(cars.iloc[:,[0,2]])

     cars_per_cap  drives_right
US            809          True
AUS           731         False
JPN           588         False
IN             18         False
RU            200          True
MOR            70          True
EG             45          True
```

## Logic, Control Flow and Filtering


##  最後に一言
