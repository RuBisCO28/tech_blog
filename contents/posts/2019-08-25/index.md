---
title:      "Git for Windowsを使ってGitLabのプロジェクトをいじってみる"
date:       "2019-08-25"
category: "dev"
---

## 1. Git for Windowsのインストール

[Git - Downloading Package](https://git-scm.com/downloads)のサイトよりインストーラーをダウンロードし、インストール。  
今回、インストーラーは「Git-2.18.0-64-bit.exe」を使用。

インストーラーを実行し、以下の手順に従ってインストール

![1](/img/gitlab/1.png)

インストール先のディレクトリはC:\Gitに変更

![2](/img/gitlab/2.png)

インストールするコンポーネントはデフォルトのまま

![3](/img/gitlab/3.png)

![4](/img/gitlab/4.png)

デフォルトのエディタ設定（男は黙ってVim）

![5](/img/gitlab/5.png)

bashではwindowsのDOSを使用

![6](/img/gitlab/6.png)

SSLの設定

![7](/img/gitlab/7.png)

改行処理の設定

![8](/img/gitlab/8.png)

![9](/img/gitlab/9.png)

あとはよしなに

![10](/img/gitlab/10.png)

インストール完了

![11](/img/gitlab/11.png)

 
## 2. Gitの初期設定

C:\Git配下のGit Bashを起動し、初期設定を行う。（コマンドプロンプトでも可）
```
git config --global user.email 'メールアドレス'
git config --global user.name 'ユーザー名'
git config --global core.quotepath off
```

続いてSSHキーを作成。
パスフレーズは任意で設定。
```
$ ssh-keygen -t rsa -C 'メールアドレス'
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/ユーザ名/.ssh/id_rsa):
Created directory '/c/Users/ユーザ名/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```
C:\Users\ユーザ名\.ssh 以下にファイルが作成される。

## 3. GitLabへのSSHキー登録

GitLabにログインし、ページ右上のアイコンから設定(Settings)を開く。

![12](/img/gitlab/12.png)

左メニューよりSSH Keysを選択。
先ほど生成したSSHキー(id_rsa.pub)の内容をコピペし、タイトルをつけAdd Keyで登録。  
登録後、自分宛にメールが届く。

![13](/img/gitlab/13.png)

以上で設定は終了。

## 4. GitLabのプロジェクトをクローン

GitLabのプロジェクトページに行き、git@gitlab.comから始まるClone 用URLをコピーする。

![14](/img/gitlab/14.png)

Git Bashを起動し、ローカル環境にプロジェクトクローン用のフォルダを作成し、移動。
（今回はデスクトップ配下に作成）

```
$ mkdir -p /c/Users/ユーザ名/Desktop/プロジェクト名
$ cd /c/Users/ユーザ名/Desktop/プロジェクト名
```

設定したパスフレーズを入力して、クローンを作成
```
$ git clone git@gitlab.com:***.git
Cloning into '***'...
Enter passphrase for key '/c/Users/ユーザ名/.ssh/id_rsa':
```
以上でローカル環境にプロジェクトのクローンが作成される。

## 5. プロジェクトにREADMEを追加
README.mdを作成し、プロジェクトにREADMEをpush。

```
$ touch README.md
$ git add README.md
$ git commit -m "Add README"
$ git push -u origin master
```

プロジェクトにREADME.mdが追加される。

## 6. 補足
今回はGitLabでやったが、Githubも基本的に流れは変わらない