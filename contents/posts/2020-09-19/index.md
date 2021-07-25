---
title:      "GCP無料枠で作る財務&株価分析アプリ Part4"
date:       "2020-09-19"
category: "dev"
---

# はじめに
Always Freeプロダクト枠を使用し、決算書による財務分析&株価分析Webアプリを作ってみる  
第四弾。  
今回はキーワードを入力すると該当銘柄を教えてくれるチャットボット用のサーバを実装してみます。

## 設計
フロントのチャット部分はチャットライブラリ(https://github.com/riversun/chatux)を使用し、  
バックエンドはここまでGCE,GAEと使ってきたのと、そこまで大きな処理を実装するわけでは  
ないので、今回はコンテナをデプロイできるサーバレスサービスのCloud Runを使用します。  
ローカルのコンテナ環境で動作テストをし、問題なければCloud Buildでコンテナをビルドし、  
Cloud Runにデプロイします。  
フローとしては、下記になります。

![chatbot](/images/feye/chatbot.PNG)

## Docker
コンテナで実行するために、Dockerfileをしたためます。  
適宜必要なモジュールをインストールする記述を記載します。

```text
# Use the official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.7-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install production dependencies.
RUN pip install Flask gunicorn flask_cors google-cloud-storage pandas

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
```

またCloud Buildに投げるときはDockerfileだけでも問題ないですが、  
ローカルでテストしよすいようにdocker-composeも使用します。  
ということでyamlファイルは以下。

```text
version: '3'
services:

  backend:
    build: ./backend
    image: backend-image
    container_name: backend1
    restart: always
    ports:
      - 8000:8000
    environment:
      PORT: 8000
```

## フロントエンド
フロントのチャット部分はチャットライブラリ(https://github.com/riversun/chatux)を使用し、  
htmlファイルに埋め込む形で記載します。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>銘柄検索ボット</title>
</head>
<body>
<script src="https://riversun.github.io/chatux/chatux.min.js"></script>
<script>
    const chatux = new ChatUx();

 const initParam =
        {
            renderMode: 'auto',
            api: {
                //echo chat server
                endpoint: 'http://localhost:8080/chat',
                method: 'GET',
                dataType: 'json'
            },
            bot: {
                botPhoto: 'https://1.bp.blogspot.com/-U-God4u2s7Q/VdLsEO8pS9I/AAAAAAAAw2w/CucJpIwog34/s400/vegetable_kyouyasai_syougoin_daikon.png',
                humanPhoto: null,
                widget: {
                    sendLabel: '検索',
                    placeHolder: 'キーワードを入力してください'
                }
            },
            window: {
                title: '銘柄検索ボット',
                infoUrl: 'https://github.com/RuBisCO28/KabuChatServer'
            }
        };
    chatux.init(initParam);
    chatux.start(true);

</script>
</body>
</html>
```

起動すると下記のようなbotが画面右下に出現します。

![chatbot2](/images/feye/chatbot2.PNG)

## 検索対象のデータ
今回、検索対象のデータは[edinetコードリスト](https://disclosure.edinet-fsa.go.jp/E01EW/BLMainController.jsp?uji.verb=W1E62071InitDisplay&uji.bean=ee.bean.W1E62071.EEW1E62071Bean&TID=W1E62071&PID=currentPage&SESSIONKEY=1600570094419&kbn=2&ken=0&res=0&idx=0&start=null&end=null&spf1=1&spf2=1&spf5=1&psr=1&pid=0&row=100&str=&flg=&lgKbn=2&pkbn=0&skbn=1&dskb=&askb=&dflg=0&iflg=0&preId=1)に
企業説明を加えた下記のようなデータとなります。

```text
8801, 3月31日,三井不動産株式会社,不動産業,東証1部,三菱地所と並ぶ総合不動産の双璧。ビル賃貸主力。マンション分譲、非保有不動産事業を拡大
4519,12月31日,中外製薬株式会社,医薬品,東証1部,ロシュ傘下で成長続ける異色の医薬品大手。抗体・バイオで先行、抗がん剤、骨・関節領域に強い```
```

## チャットサーバ
言語はPython、フレームワークはFlaskで構築してみます。  
ローカルでサーバをたてて、csv形式のedinetデータを読み込み、dataframeに流します。    
肝心のチャットUIとチャットサーバのやり取りはjson形式で行います。  
/chat以降のパラメーターでキーワードとなるテキストを受け取り、  
該当するテキストがないかをcsv形式のedinetデータの企業説明欄から検索して、  
ヒットすればその企業のyahooファイナンスのページのリンクを記載したメッセージを  
返すという流れになります。

![chatbot3](/images/feye/chatbot3.PNG)

コードは以下
```python
from flask import Flask, jsonify, abort, make_response, request
from flask_cors import CORS
import os
from google.cloud import storage
from io import BytesIO
import pandas as pd

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app)

@app.route('/chat',methods=['GET'])
def answer():
    text = request.args.get("text","")
    
    # for local
    df=pd.read_csv("all_edinetcodeinfo.csv",header=None)
    
    # for GCP
    #storage_client = storage.Client()
    #bucket = storage_client.get_bucket('edinetcodeinfo')
    #blob = bucket.get_blob('all_edinetcodeinfo')
    #df = pd.read_csv(BytesIO(blob.download_as_string()),header=None)
    
    dfc=df[df[5].str.contains(text)]
    if(len(dfc)==0):
        result={"output":[{"type":"text","value":"見つかりませんでした"}]}
        return make_response(jsonify(result))
    else:
        ft=str(len(dfc))+"件見つかりました"
        html=""
        for i in range(len(dfc)):
            code=dfc.iloc[i,0]
            company=dfc.iloc[i,2]
            value=str(code)+": "+"<a href=\"https://stocks.finance.yahoo.co.jp/stocks/chart/?code="+str(code)+"\" target=\"_blank\" >"+str(company)+"</a><br>"
            html+=value
        result={"output":[{"type":"text","value":ft,"delayMs": 300},{"type":"html","value":html}]}
        return make_response(jsonify(result))

@app.errorhandler(404)
def not_found (error):
    return make_response(jsonify({"error","Not found"}),404)

if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',port=int(os.environ.get('PORT', 8080)))
```

## テスト
docker-compose.ymlを使用して、コンテナを起動してみます。

```bash
# cd <docker-compose.ymlが置かれているディレクトリ>
# docker-compose up -d
```

あとはindex.htmlを開き、単語を入力すると検索結果が返されます。

![chatbot4](/images/feye/chatbot4.PNG)

## Cloud Buildでのビルド
さてコンテナでのテストが完了したので、Dockerfile を含むディレクトリから次のコマンドを実行し、  
Cloud Build を使用してコンテナイメージをビルドします。

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/application_name
```

PROJECT-IDは、GCP のプロジェクトID です。gcloud config get-value project を実行すると取得できます。  
またアプリ名はデプロイするapplication_nameです。  
成功すると、イメージ名（gcr.io/PROJECT-ID/application_name）を含むSUCCESSメッセージが表示されます。  
イメージはContainer Registryに保存され、必要に応じて再利用できます。

## Cloud Run へのデプロイ
コンテナ イメージをデプロイするには次のコマンドを使用してデプロイします。 

```bash
gcloud run deploy --image gcr.io/PROJECT-ID/application_name --platform managed
```

サービス名の入力を求められます。Enter キーを押してデフォルト名を受け入れることができます。
またリージョンを指定するよう求められます。選択したリージョン（us-central1 など）を選択します。
最後に未認証の呼び出しを許可する場合は、[y] と返信します。
デプロイが完了し成功すると、コマンドラインにサービスURL が表示されるので、  
ブラウザでこのサービスURL を開き、デプロイしたコンテナにアクセスできます。
さきほどローカル環境でテストしたときのようにキーワードをパラメータで指定し、jsonが返ってくれば成功です。

```text
https://URL/chat?text=キーワード
```

## Code
恒例のGithubにサンプル公開。

https://github.com/RuBisCO28/KabuChatServer

#  最後に一言
今回のように大きな処理を伴わず、必要な時必要な分だけ使う場合はCloud Functionsなどでもよいですが、
コンテナで管理デプロイできるCloud Runはまた違った魅力があるように思いました。  

