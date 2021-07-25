---
title:      "GCP無料枠で作る財務&株価分析アプリ Part2"
date:       "2020-07-13"
category: "dev"
---

# はじめに
Always Freeプロダクト枠を使用し、決算書による財務分析&株価分析Webアプリを作ってみる  
第二弾。  
今回は株価推移をロウソク足チャートで表示する部分の実装をしてみます。

## まずはLocalで
いきなりGCPを使う前にまずはローカルでということでDBにSQLiteを採用します。  
今回言語はPython、フレームワークはFlaskで構築してみます。  
ローカルでAPIサーバをたてて、json形式の株価データをフロントで受け取り、ロウソク足チャートで表示します。  
ということで下記モジュールをインストールします

```bash
pip3 install Flask flask_cors sqlalchemy
```

## ディレクトリ構成

```text
(any directory)
 ├models/
 │　├models.py
 │　├database.py
 │　└stocks.db
 └main.py
```

## エントリーポイント
サーバ起動およびエントリーポイントは下記。  
/apiStockData/codeのcode部分で銘柄コードを指定し、該当codeの株価情報をDBから取得、  
json形式に変換・出力します。

```python
from flask import Flask, jsonify, abort, make_response, request
from flask_cors import CORS
from models.models import Stocks
import json

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app)

@app.route("/apiStockData/<code>")
def stock(code):
    all_stocks = Stocks.query.filter(Stocks.code==code).all()
    result = []
    for stocks in all_stocks:
        result.append(dict(date=stocks.date, open=stocks.open, close=stocks.close, high=stocks.high, low=stocks.low, volume=stocks.volume))
    return make_response(jsonify(result))

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
```

## DB
キー/日付/始値/高値/安値/終値/出来高/銘柄コードの情報がSQLiteに格納してあり、  

```text
1301_2018-01-04|2018-01-04|4270|4335|4220|4320|61500|1301
1301_2018-01-05|2018-01-05|4330|4360|4285|4340|55300|1301
1301_2018-01-09|2018-01-09|4340|4360|4325|4340|26100|1301
1301_2018-01-10|2018-01-10|4340|4460|4340|4430|91300|1301
1301_2018-01-11|2018-01-11|4430|4430|4340|4350|48200|1301
```

事前にdatabase.pyでSQLiteの接続情報、model.pyでDBのSchemeは定義しておきます。  
これにより、main.pyでimportすることでDBの情報を呼び出せます。  

database.py
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

databese_file = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'stocks.db')
engine = create_engine('sqlite:///' + databese_file, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,autoflush=False,bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    import models.models
    Base.metadata.create_all(bind=engine)
```

models.py
```python
from sqlalchemy import Column, Integer, String, Text, DateTime
from models.database import Base
from datetime import datetime

class Stocks(Base):
    __tablename__ = 'stocks'
    pkey = Column(String(128), primary_key=True)
    date = Column(String(128))
    open = Column(Integer)
    high = Column(Integer)
    low = Column(Integer)
    close = Column(Integer)
    volume = Column(Integer)
    code = Column(Integer)

    def __init__(self, date=None):
        self.pkey = pkey
        self.date = date
        self.open = open
        self.high = high
        self.low = low
        self.close = close
        self.volume = volume
        self.code = code
```

## ロウソク足チャート
ロウソク足チャートを表示するライブラリとして、今回は[Apache ECharts](https://echarts.apache.org/en/index.html)を使用します。  
ajaxでAPIサーバからjson形式で株価情報を受け取り、各変数にそれぞれ株価と出来高のデータを格納。25日、75日平均移動線も計算して表示します。  
以下、htmlファイル。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Chart</title>
    <!-- including ECharts file -->
    <script src="echarts.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
</head>
<body>
    <!-- prepare a DOM container with width and height -->
    <div id="main" style="width: 100%;height:700px;"></div>
    <script type="text/javascript">
	var myChart = echarts.init(document.getElementById('main'));
    var upColor = '#00da3c';
	var downColor = '#ec0000';

function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumes = [];
    for (var i = 0; i < rawData.length; i++) {
		categoryData.push(rawData[i].date);
		values.push([rawData[i]['open'],rawData[i]['close'],rawData[i]['high'],rawData[i]['low'],rawData[i]['volume'],]);
		volumes.push([i, rawData[i]['volume'], rawData[i]['open'] > rawData[i]['close'] ? 1 : -1]);
    }

    return {
        categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(+(sum / dayCount).toFixed(3));
    }
    return result;
}

$.get('http://localhost:8080/apiStockData/1301', function (rawData) {
    var data = splitData(rawData);

    myChart.setOption(option = {
        backgroundColor: '#fff',
        animation: false,
        legend: {
            bottom: 10,
            left: 'center',
            data: ['株価', 'MA25', 'MA75']
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            }
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},
            label: {
                backgroundColor: '#777'
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                brush: {
                    type: ['lineX', 'clear']
                }
            }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        visualMap: {
            show: false,
            seriesIndex: 5,
            dimension: 2,
            pieces: [{
                value: 1,
                color: downColor
            }, {
                value: -1,
                color: upColor
            }]
        },
        grid: [
            {
                left: '10%',
                right: '8%',
                height: '50%'
            },
            {
                left: '10%',
                right: '8%',
                top: '63%',
                height: '16%'
            }
        ],
        xAxis: [
            {
                type: 'category',
                data: data.categoryData,
                scale: true,
                boundaryGap: false,
                axisLine: {onZero: false},
                splitLine: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: data.categoryData,
                scale: true,
                boundaryGap: false,
                axisLine: {onZero: false},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 98,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'slider',
                top: '85%',
                start: 98,
                end: 100
            }
        ],
        series: [
            {
                name: '株価',
                type: 'candlestick',
                data: data.values,
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: null,
                    borderColor0: null
                },
                tooltip: {
                    formatter: function (param) {
                        param = param[0];
                        return [
                            'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                            'Open: ' + param.data[0] + '<br/>',
                            'Close: ' + param.data[1] + '<br/>',
                            'Lowest: ' + param.data[2] + '<br/>',
                            'Highest: ' + param.data[3] + '<br/>'
                        ].join('');
                    }
                }
            },
            {
                name: 'MA25',
                type: 'line',
                data: calculateMA(25, data),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            {
                name: 'MA75',
                type: 'line',
                data: calculateMA(75, data),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                }
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data.volumes
            }
        ]
    }, true);

    myChart.dispatchAction({
        type: 'brush',
        areas: [
            {
                brushType: 'lineX',
                coordRange: ['2020-06-10', '2020-07-10'],
                xAxisIndex: 0
            }
        ]
    });
});
    </script>
</body>
</html>
```

ということで下記でサーバを起動し、
```bash
python main.py
```

作成したindex.htmlを開くと株価ローソクチャート+出来高グラフ+移動平均線が確認できます。(テストで銘柄コード1301を表示)

![ec](/images/feye/echart.PNG)

## Cloud DataStore
さてこの株価&出来高情報をGAEから取得し、表示するためにデータの永続化が必要になります。  
そこで今回はGCPの無料枠の中で、DBとしてCloud DataStoreを使用してみます。  
Cloud DataStoreは水平スケーリングNoSQLデータベースで、格納形式はRDBのようにカラムがないので、
今回はjson形式で保存します。  

```text
sample:
[{"high":"3045","date":"2019-08-01","low":"3010","open":"3040","close":"3045","volume":"14800"},
{"low":"2985","high":"3045","volume":"28100","close":"3015","date":"2019-08-02","open":"3025"}]
```

さて、株価や出来高は毎日更新されるので、データを定期的にDataStoreに格納する必要があります。  
ローカルから環境から更新する方法もありますが、米国リージョンを使うこともあるので、GCEからアップデートをかけることにします。  
これのメリットとしては、DataStoreもGCEも同じリージョンなのでコストを抑えられるのとGCE上でcronを仕込んどくことで
自動でデータをアップデートできます。  

GCEからDataStoreにデータを挿入するため、下記モジュールをインストールしておきます。

```bash
pip3 install google-cloud-datastore
```

また同じVPC内のデータのやり取りの場合、下記GCEインスタンスのオプションのDataStore用APIを有効にしておくことで、キーなど設定する必要なく、データの更新ができます。

![ds](/images/feye/datastore.PNG)

今回、KindとEntityは下記のようにします。
idは一意な値が必要なので、銘柄コードを指定。  
各銘柄ごとに約1年分の株価情報をjson形式でstocksエンティティに保存します。

```text
Kind: Stocks
Entity : id, stocks
```

また更新するデータ用の実際に更新するためのコードは以下。  
事前にSQLiteに仕込んでおいた株価データを取得・整形し、DataStoreへ挿入しています。  
挿入する際は更新対象のProjectIDを指定が必要になります。

```python
from google.auth import compute_engine
from google.cloud import datastore
from models import Stocks
import json
import time
import pandas as pd

credentials = compute_engine.Credentials()
project="ProjectIDを記入"
datastore_client = datastore.Client(credentials=credentials, project=project)

def insert_datastore(code):
    try:
        all_stocks = Stocks.query.filter(Stocks.code==code).all()
        result = []
        for stocks in all_stocks:
            result.append(dict(date=stocks.date, open=stocks.open, high=stocks.high, low=stocks.low, close=stocks.close, volume=stocks.volume))

        key = datastore_client.key('Stock',code)
        task = datastore.Entity(key=key)
        task.update({
            'stock': result
        })
        datastore_client.put(task)
    except:
        print("Fail: "+str(code))

if __name__ == '__main__':
    edn=pd.read_csv('edinetcodeinfo.csv',header=None)
    codes=edn.iloc[:][4]
    for code in codes:
        insert_datastore(code)
        time.sleep(1)
```

## GAEからDataStoreのデータ取得
DataStoreへのデータの格納が終わったので、GAEからDataStoreのデータ取得部分について実装します。 
GCEのように特にAPI有効にせずとも、同じProject内であればデータを取得できます。  
Kindを指定し、データを取得後、フロントに流しグラフ表示とさきほどと同じフローになるため、  
今回は、取得の関数のみ下記に記載します。

```python
@app.route('/stocks/<code>')
def get_stocks(code):

    datastore_client = datastore.Client()
    key = datastore_client.key('Stock',int(code))
    entity = datastore_client.get(key)
    result=entity.get("stock")
    all_stocks=result
    return render_template("stock.html",code=code, all_stocks=all_stocks)
```

## Cloud DataStoreの無料枠
今回使用したCloud DataStoreの無料枠の制限として、米国ロサンゼルスでは1GBのストレージという記載があります。 

![cost](/images/feye/cost.PNG)

ただし、注意点としてこのストレージサイズは自動で作成される組み込みインデックスも含むサイズとなります。  
このためSQLiteのDBのサイズが1年分で200MBだったので、数年分は格納できると思ったのですが、  
実際は組み込みインデックスがデータ挿入時に自動で作成され、下記のように約1年分でも1GBを超えることになります。

![index](/images/feye/index.PNG)

そして超過分だけ、毎月課金されるので、データ容量を減らすなど注意が必要です。

## Code
恒例のGithubにサンプル公開。

https://github.com/RuBisCO28/StockVoice

#  最後に一言
1GBのストレージ制限があるので、次章で説明するCloud Storageの方を使えばよかったなと思いつつ、DataStoreを使う勉強になったのでヨシとしたいと思います。
