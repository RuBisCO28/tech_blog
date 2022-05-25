---
title:      "Build management system with Raspberry pi and QR Part1"
date:       "2019-09-07"
category: "JA"
---

## はじめに
アプリを作ると必ずといっていいほど発生する動作テスト。  
あらゆるデバイスで試さなければいけないので、複数人でテストした場合、誰がどのデバイスを借りているのかを把握したいと思うことがよくあります。  
できることなら使用しているユーザーとデバイス、さらに借りた時間をひも付けて、いつでも参照できるようにしておきたい。  
ということでQRコードを使用したラズパイによるデバイス管理システムを作っていきます。

## 想定シナリオと改善ポイント
以前は、デバイスは1つのところで管理され、借りる時に紙に使用しているユーザーとデバイス、さらに借りた時間を記載し、使用開始。  
使用後は返却時間を記載し、元の場所に戻すフローでした。  
これをカメラにQRをかざし、貸出/返却を記録する下記フローに変更します。  
```text
ユーザーQR表示->ログイン->デバイスQR表示->貸出or返却->ユーザー表示->ログアウト
```
あわせて現在の状況もモニターで表示します。  

## 用意するもの
```text
Rasberry Pi 3 MODEL B (OS Rasbian)
USBカメラ
QRコード（ユーザー用とデバイス用）
```

## システムフロー
プログラムを書きながら考えていきたいですが、まずはシステムフローを書き出してみます。

![qr1](/images/qr/1.jpg)

## データベース作成
次にユーザー情報を管理するDBと貸出/返却を記録するためのDBの二つを用意します。
下記はテスト用にデータを埋めた例です。

* ユーザーDB

|ID |ユーザーID |ユーザー名|
|--------|----------------|----|
|1  |1 |ichiro|
|2|2|ziro|
|3|3|saburo|

* デバイス管理DB  

|ID |デバイスID |デバイスステータス   |借りたユーザー名  |最終更新日時|
|--------|----------------|----|----|----|
|1  |123 |貸出可|-|2018/11/9 09:00:00|
|2|456|貸出中|ichiro|2018/11/10 07:00:00|
|3|789|貸出可|-|2018/11/11 06:00:00|


下記にこれらのDBを作るためのコードを記載します。  
今回DBは管理が簡単なSQLiteを使用し、Pythonで制御することにしました。

<script src="https://gist.github.com/RuBisCO28/598054548016e930aeee672a1647d999.js"></script>

実行すると
```bash
$ python3 create_db.py 
(1, '123', '', '-', '')
(2, '456', '', '-', '')
(3, '789', '', '-', '')
(1, 1, 'ichiro')
(2, 2, 'ziro')
(3, 3, 'saburo')
```

## QRコード作成
QRコードを作成してみましょう。今回はqrencodeコマンドを使います。  
```bash
$ sudo apt-get install qrencode
```

インストール完了後、下記コマンドで読み取りサンプルとしてpng画像を出力しておき、紙などに印刷しておきます。
```bash
qrencode -o 789.png "deviceid:789"
```


## カメラ読み取り
まず、Rasberry Piの設定からカメラを有効にします。

![qr1](/images/qr/2.png)

今回はPythonでカメラを制御して読み取りなどするため、cv2パッケージを使用します。  
```bash
$ pip3 install opencv-python
```

今回はバージョン3.4.3を使用します。  
もしこの時点でエラーなど出た場合は、足りないパッケージなどがないかご確認ください。
```bash
$ python3
Python 3.5.3 (default, Sep 27 2018, 17:25:39) 
[GCC 6.3.0 20170516] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import cv2
>>> cv2.__version__
'3.4.3'
```

またQR読み込みなどのために、下記パッケージも同様に使用します。  
```bash
$ pip3 install pyzbar
$ pip3 install python3-xlib
```

準備が整ったのでカメラ動作確認およびQR読み込みがうまくいくかを下記コードで確認します。

```python
#!/usr/bin/env python3

import cv2
from pyzbar.pyzbar import decode
from PIL import Image

if __name__ == "__main__":
    capture = cv2.VideoCapture(0)
    if capture.isOpened() is False:
        raise("IO Error")

    while True:
        ret, frame = capture.read()
        if ret == False:
            continue

        cv2.imshow("frame", frame)
        data = decode(frame)

        if data != []:
            code = data[0][0].decode('utf-8', 'ignore')
            print(code)

        k = cv2.waitKey(1)
        if k == 27:
            break

    capture.release()
    cv2.destroyAllWindows()
```

カメラ起動後、frameにQRコードが映った時、デコードして文字表示を行っています。  
動画は貼れませんでしたが、うまくいっているようです。

![qr1](/images/qr/3.png)

## 貸出返却処理
最後に、先ほど描いたユーザーフローに沿って貸出返却処理を実装していきます。

<script src="https://gist.github.com/RuBisCO28/5f1a10a650dfffa3e27f9a879757b351.js"></script>

読み取るQRコードは下記書式で統一。
```text
userid:***
deviceid:***
```

PythonとSQLiteのつなぎこみの部分の説明はしませんが、それぞれの処理を関数化することで貸出返却処理を実装しました。
```python
user_search(): # かざされたユーザーIDが存在するかを確認
borrow_device(): # 貸出処理
device_search(): # かざされたデバイスIDが存在するかを確認
return_device(): # 返却処理
```

またデータベース上の貸出返却処理とは別に、誰がいつ貸出返却を行ったかの履歴は、logディレクトリ以下にcsvファイルとして保存することにしました。

さて、今回一番実装の部分で苦労したのは、「ずっと動いているカメラの認識をどう制御するか」です。  
基本的にカメラの認識はwhileループで動いているため、かざしている間に何回も認識してしまいます。  
そこで、どう解決したかというと必ずQRコードの読み取りを行った後に下記処理を入れることで二重読み込みを防ぎました。  
```text
lock_unlock() # 読み込みロックとアンロック
```
ロックアンロックの実装はthreadを用いることで、カメラの認識を止めることなく別スレッドでロックアンロックを実現しました。
```python
def timer(secs):
    print("Lock")
    f = open('lock', 'a')
    f.close()
    for i in range(secs, -1, -1):
        time.sleep(1)
    os.remove('lock')
    print("Unlock")

def lock_unlock():
    target_time = 5
    thread = Thread(target=timer,args=(target_time,))
    thread.start()
```
これにより、下記分岐に差し掛かったときに、lockファイルが一時的に生成されているため読み込みが行われなくなります。
```python
if not os.path.exists('lock'):
```
ただしこのままだとロックがかかったままなので、5秒後にロックを解除します。  
5秒間にした理由は、その間に次のものをかざすため、読み込まれたQRコードをカメラからいったん外すだろうという推測のものです。  

##  動作テスト
最初にデバイスIDをかざし、ユーザーIDをかざすよういわれ、ユーザーIDをかざした後、デバイスIDをかざすことでデバイスを借りてます。（返却も同様）  
動画は貼れませんでしたが、Lock、Unclockもうまく機能しているようです。

![qr1](/images/qr/4.png)

##  最後に一言
ユーザーがログアウトをし忘れるとなりすましでデバイスを借りることができてしまうので、  
これといった操作がなければ自動ログアウトできる機能を、次回は実装していく予定です。
