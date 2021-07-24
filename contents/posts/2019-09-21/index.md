---
title:      "QRコードを使用したラズパイによるデバイス管理システムを作ってみた Part4"
date:       "2019-09-21"
category: "dev"
---

## はじめに
前回に引き続き、Web周りを実装していきます。

## おさらい（ルーティング）
デバイス一覧表示は実装終えたので、他のルーティングを実装していきます。

```
GET /devices - デバイス一覧表示
GET /devices/create - デバイス新規登録用フォームの表示
POST /devices - デバイス新規登録
GET /devices/{id} - 貸出返却ログ表示
GET /devices/{id}/edit - デバイス情報編集用フォームの表示
PUT /devices/{id} - デバイス名更新
GET /devices/{id}/delete - デバイス削除用フォームの表示
DELETE /devices/{id} - デバイスの削除

GET /users - ユーザー一覧表示
GET /users/create - ユーザー新規作成用フォームの表示
POST /users - ユーザー新規登録
DELETE /devices/{id} - ユーザー削除
```

## デバイス新規登録用フォームの表示とデバイス新規登録
デバイス一覧を表示するためのルーティングとほぼ同じくDBファイルにSQLで入力データをinsertします。

```php
// デバイス新規登録用フォームの表示
$app->get('/devices/create', function (Request $request, Response $response) {
    return $this->renderer->render($response, 'tasks/create.phtml');
});

// 新規登録
$app->post('/devices', function (Request $request, Response $response) {
    $device_name = $request->getParsedBodyParam('device_name');
　〜省略〜
    $sql = 'INSERT INTO mdt(device_name,device_status,user_name,last_modify_date) values (:device_name,"","-","")';
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([':device_name' => $device_name]);
    if (!$result) {
        throw new \Exception('could not save the ticket');
    }
    return $response->withRedirect("/devices");
});
```

今回は前回と逆で入力フォームから受け取ったデータを、getParsedBodyParamで  
phpの変数に代入して、SQLを発行してます。  
また新規登録後にwithRedirect("/devices")で/device配下に自動でリダイレクトをかけてます。

![qr9](/img/qr/9.png)

## 貸出返却ログ表示
デバイスごとに貸出返却ログをlogディレクトリ配下にcsvファイルとして配置しているので、  
このcsvファイルを参照して表示します。

```php
// 貸出返却ログ表示
$app->get('/devices/{id}', function (Request $request, Response $response, array $args) {
　〜省略〜
    $sql = 'SELECT device_name FROM mdt WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $args['id']]);
    $device = $stmt->fetch();
    if (!$device) {
        return $response->withStatus(404)->write('not found');
    }
    $path= './log/' . $device["device_name"] . '.csv';
    if (file_exists($path)) {
        $fp = fopen($path, 'r');
        $data = array();
        $i=0;
        while (($line = fgetcsv($fp)) !== FALSE) {
            $data[$i]['when']=$line[0];
            $data[$i]['who']=$line[1];
            $data[$i]['what']=$line[2];
            ++$i;
        }
        fclose($fp);
    } else {
        return $response->withStatus(404)->write('not found');
    }
    return $this->renderer->render($response, 'tasks/show.phtml', $data);
});
``` 

![qr10](/img/qr/10.png)

## デバイス情報編集用フォームの表示とデバイス名更新

```php
// 編集用フォームの表示
$app->get('/devices/{id}/edit', function (Request $request, Response $response, array $args) {
　〜省略〜
    $sql = 'SELECT * FROM mdt WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $args['id']]);
    $device = $stmt->fetch();
    if (!$device) {
        return $response->withStatus(404)->write('not found');
    }
    $data = ['device' => $device];
    return $this->renderer->render($response, 'tasks/edit.phtml', $data);
});

// デバイス名更新
$app->put('/devices/{id}', function (Request $request, Response $response, array $args) {
    $device_name = $request->getParsedBodyParam('device_name');
　〜省略〜
    $sql = 'UPDATE mdt SET device_name = :device_name WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([ ':device_name' => $device_name, ':id' => $args['id'] ]);
    return $response->withRedirect("/devices");
});
```

ブラウザからフォームデータを送るためには GET か POST でなければいけません。  
そこで、擬似的に PUT や DELETE を指定するために、下記のように隠し要素に HTTP メソッド名を入れています（この場合は "put"）。

```html
<input type="hidden" name="_METHOD" value="put">
```
Slim の場合は、 "_METHOD" というフォームデータを送って対応します。

## デバイス削除用フォームの表示とデバイスの削除

```php
// デバイス削除フォーム
$app->get('/devices/{id}/delete', function (Request $request, Response $response, array $args) {
　〜省略〜
    $sql = 'SELECT * FROM mdt WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $args['id']]);
    $device = $stmt->fetch();
    if (!$device) {
        return $response->withStatus(404)->write('not found');
    }
    $data = ['device' => $device];
    return $this->renderer->render($response, 'tasks/delete.phtml', $data);
});


// デバイス削除
$app->delete('/devices/{id}', function (Request $request, Response $response, array $args) {
　〜省略〜
    $sql = 'SELECT * FROM mdt WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $args['id']]);
    $device = $stmt->fetch();
    if (!$device) {
        return $response->withStatus(404)->write('not found');
    }
    $stmt = $pdo->prepare('DELETE FROM mdt WHERE id = :id');
    $stmt->execute(['id' => $device['id']]);
    return $response->withRedirect("/devices");
});
```

![qr11](/img/qr/11.png)


## ユーザー系のルーティング
デバイス系と実装がかぶるので説明省略。  

## ページ閲覧制限
ユーザーやデバイスの編集などadmin権限をもつ人だけに権限を付与したい場合、  
ページに閲覧権限をかけることができる。
具体的には、下記クラスをroute.phpに記載し、
```php
class CAuthentication {
    public function __invoke($request, $response, $next) {
        if ($this->validateUserKey("user", "pass") === false) {
            return $response->withStatus(401);
        }
        return $next($request, $response);
    }
    function validateUserKey($uid, $key) {
        if(file_exists('admin')){
            return true;
        } else {
            return false;
        }
    }
}
```

下記のように"->add(new CAuthentication())"を関数の最後に追加することで、  
その実行に制限を設けることができます。
```php
// デバイス新規登録用フォームの表示
$app->get('/devices/create', function (Request $request, Response $response) {
    return $this->renderer->render($response, 'tasks/create.phtml');
})->add(new CAuthentication());
```

実際に、adminでアクセスしないと401 Unauthorizedで弾かれていることがわかります。

![qr12](/img/qr/12.png)


## Demo
さてadmin用のQRコードを生成し（今回はadminのユーザーIDが4）、

```
qrencode -o admin.png "userid:4"
```

さきにターミナルで下記コマンドを実行し、  
ブラウザでhttp://localhost:8080/devices を開いておき

```
$ php -S localhost:8080 -t public
```


さらに別ターミナルから以下のコマンドを実行した後に、  
さきほどのQRコードをかざすと、

```
$ cd src
$ ./device_manage.py
```


下記admin画面が開けるかと思います。  
あとは各リンクやボタンから実装したルーティングが正常に動作しているかご確認ください。
  

![qr13](/img/qr/13.png)

##  最後に一言
Web周りが長くなってしまいましたが、一旦これにて完了です。  
次回は最後ということで、起動用GUIと鍵の開け閉めをモーターで制御する部分を実装していく予定です。