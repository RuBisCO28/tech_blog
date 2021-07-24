---
title:      "QRコードを使用したラズパイによるデバイス管理システムを作ってみた Part2"
date:       "2019-09-14"
category: "dev"
---

## はじめに
前回の続き。  
カメラでのQR読み込みは完了したので、次はこれといった操作がなければ自動ログアウトできる機能を、実装していきます。

## ログイン/ログアウト
まずログイン時にログインユーザーの名前を記載した、login_userというファイルを生成することにします。  
ログアウト時は、login_userというファイルを削除します。  
また今回は、後ほどブラウザ上で貸出返却の状態を確認したり、デバイスの追加削除などをできるようにするため、
adminというファイルを管理者がログインした際に作成します。

```python
def login_user(user_name):
    if user_name == "admin":
        f = open('admin', 'w')
        f.write(user_name)
        f.close()
    f = open('login_user', 'w')
    f.write(user_name)
    f.close()

def logout_user(user_name):
    if user_name == "admin":
        os.remove('admin')
    os.remove('login_user')
```

## 自動ログアウトのためのタイマー実装
さて、カードキーをかざして使用するコピー機を使ったことがある方は想像できるかもしれませんが、
特に動作がなかった時、ある一定時間経つと自動でログアウトします。  
今回は、下記のようにログイン時にloggerというファイルを作成しておき、タイマーを設定します。  
タイマーはログイン時のみ60秒間をセットします。
```python
# auto_logout
if os.path.exists('login_user'):
    if not os.path.exists('logger'):
        f = open('logger', 'w')
        f.write(str(pyautogui.position()))
        f.close()
        stop = False
        auto_log(60)
```

そして、60秒間操作がなかった場合、timeupというファイルを作成します。

```python
def timer_log(secs):
    i = secs
    while not stop:
        if i == 0:
            break
        print(i)
        i -= 1
        time.sleep(1)
    if not stop:
        f = open('timeup', 'w')
        f.write('timeup')
        f.close()

def auto_log(target_time):
    thread = Thread(target=timer_log,args=(target_time,))
    thread.start()
```

つまり、loggerは自動ログアウトするかの判定ファイル、timeupはタイマーのカウントが終了したことを示すファイルとしました。  
実装の仕方としては、前回のロックアンロックと同じ、threadを使用して、タイマーを実装しました。

## 自動ログアウト回避の条件と実装
次に、自動ログアウト回避の条件として、下記を設定しました。
```
貸出返却操作があった
マウスが動いた
```

「貸出返却操作があった」は、QRコードでデバイスのIDが読み込まれたときに先ほどのloggerファイルに貸出(borrow)もしくは返却(return)の文字を記載します。
```python
def modify_log(msg):
    f = open('logger', 'w')
    f.write(msg)
    f.close()
```

「マウスが動いた」は、ログイン時のところで実装したようにpyautoguiのライブラリを使用して、マウスカーソルの現在位置を取得、記録します。  
```
$ pip3 install pyautogui
```

```python
if not os.path.exists('logger'):
    f = open('logger', 'w')
    f.write(str(pyautogui.position()))
    f.close()
```

そしてタイマーでカウントしている間にマウスカーソルが動くと、タイムアップ後に、下記compare_log()で自動でログアウトするか否かを判定します。
``` python
def compare_log():
    cpos = str(pyautogui.position())
    f = open('logger', 'r')
    for line in f:
        if(line == cpos):
            f.close()
            return True
    f.close()
    return False
```

もし、自動でログアウトできないと判断された場合は、再度タイマーを設定します。このときの時間は10秒です。
```python
if os.path.exists('timeup'):
    if compare_log():
        print("auto logout is done")
        delf()
        print("Good Bye! {0}!!".format(username))
        logout_user(username)
        userid = 0
        username = ""
        lf = 0
    else:
        print("interrupt auto logout")
        os.remove('timeup')
        f = open('logger', 'w')
        f.write(str(pyautogui.position()))
        f.close()
        stop = False
        auto_log(10)
```

## タイマーカウント中のログアウト
さて、今回実装で一番悩んだのは、タイマーカウント中にログインIDをかざしてログアウトした場合、タイマーをリセットする必要があるけれど、どう実装するか。  
今回はthreadでタイマーを実装しているので、実行されているthreadを止める方法をググったところ、どうやらboolで止めればよいらしい。  
下記を参考にstopというbool変数で制御しました。

参考URL : https://qiita.com/tag1216/items/2dcb112f8018eb19a999

```python
def timer_log(secs):
    i = secs
    while not stop:
        if i == 0:
            break
        print(i)
        i -= 1
        time.sleep(1)
    if not stop:
        f = open('timeup', 'w')
        f.write('timeup')
        f.close()
```

これにより、カウント中もログアウトが実行されれば、stopをTrueにし、関連ファイルを削除することで次の人がスムーズに使うことができます。

```python
print("Good Bye! {0}!!".format(username))
logout_user(username)
stop = True
delf()
userid = 0
username = ""
lf = 0
lock_unlock()
```

##  動作テスト
最初にziroのユーザーIDをかざした後、60秒のカウントがはじまります。  
その後、デバイスを借り、再度ziroのユーザーIDをかざしてマニュアルログアウトしてます。

![qr5](/img/qr/5.png)

今度はichiroでログインし直し、デバイスを借ります。  
借りたことで自動ログアウトが阻止され(interrupt auto logout)、10秒のタイマーのカウントがはじまり自動ログアウトしてます。

![qr6](/img/qr/6.png)

動画は貼れませんでしたが、うまく機能しているようです。

##  コード
ここまでのコードは下記にあげてます。ご参考ください。

Github : https://github.com/RuBisCO28/QR_Reader

##  最後に一言
threadは便利な反面、奥が深そうです。
次回はブラウザで貸出状況を確認できる機能を、実装していく予定です。
