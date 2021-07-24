---
title:      "もしも縛られた環境でコードを書きたくなったら・・・"
date:       "2019-08-29"
category: "dev"
---

## 背景
学校や会社のPC環境は、管理者権限で色々環境を整えて、コードを書きたいと思っても中々書けないことが多い。  
もちろんExcelでマクロでも良いが、そういう話ではない。  
そう・・・コードを書きたいのだ！

## 想定環境
```
OS : Windows 10(.NET Frame works 4.6標準搭載)
言語 : C#
エディタ : メモ帳
その他 : コマンドプロンプトとブラウザ（検索用）
```

## CUIアプリケーション作成
Windows には C# のコンパイラ（csc.exe）が既に含まれていて、特にインストールしなくても C# のコードをコンパイルすることができます。  
コンパイラのパスは下記です。

```
C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
```

では、コードを書いていきます。  
以下は簡単なHelloWorldプログラム。

```
using System;

class CuiTest
{
    static void Main()
    {
        Console.WriteLine("Hello World");
    }
}
```

あとはコマンドプロンプトを開いてコンパイルして実行するだけです

```
> C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe CuiTest.cs

> CuiTest.exe
Hello World
```

## GUIアプリケーション作成
CUIだけだとあまり面白みがないので、視覚的に見えるGUIアプリケーションも作成したい。
ということでWPFアプリケーションを作ってみます。

もちろん先ほどのコンパイラでもWPFアプリケーションは作成できますが、  
今回はプロジェクトビルドツール(MSBuild.exe)を使用します。  
パスは先ほどと同じ階層にあり、下記です。

```
C:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe
```

GUIを作るにあたりWPFアプリケーションでは、XAMLで記述した見た目の部分と、C#で記述したロジックの部分を別々に分け書き、
ビルドする際に1つのクラスに合成され、コンパイルされます。  
では、プロジェクトファイル、XAMLファイル、C#ファイルの順に作成していきます。

### プロジェクトファイル

WpfTest.csproj
```
<?xml version="1.0" encoding="utf-8"?>
<Project DefaultTargets="Build" ToolsVersion="4.0"
  xmlns="http://schemas.microsoft.com/developer/msbuild/2003">

  <PropertyGroup>
    <AssemblyName>WpfTest</AssemblyName>
    <Platform>AnyCPU</Platform>
    <OutputType>WinExe</OutputType>
    <OutputPath>.\bin\Release</OutputPath>
    <TargetFrameworkVersion>v4.5</TargetFrameworkVersion>
  </PropertyGroup>
  
  <ItemGroup>
    <Reference Include="PresentationCore" />
    <Reference Include="PresentationFramework" />
    <Reference Include="WindowsBase" />
    <Reference Include="System" />
    <Reference Include="System.Xaml">
    <RequiredTargetFramework>4.0</RequiredTargetFramework>
    </Reference>
  </ItemGroup>

  <ItemGroup>
    <ApplicationDefinition Include="App.xaml">
      <Generator>MSBuild:Compile</Generator>
      <SubType>Designer</SubType>
    </ApplicationDefinition>

    <Page Include="MainWindow.xaml">
      <Generator>MSBuild:Compile</Generator>
      <SubType>Designer</SubType>
    </Page>

	<Compile Include="App.xaml.cs">
      <DependentUpon>App.xaml</DependentUpon>
      <SubType>Code</SubType>
    </Compile>
    <Compile Include="MainWindow.xaml.cs">
      <DependentUpon>MainWindow.xaml</DependentUpon>
    </Compile>
  </ItemGroup>

  <Import Project="$(MSBuildToolsPath)\Microsoft.CSharp.targets" />
</Project>
```

今回は特に中身の説明はしませんが、
特徴的なのは、App.xamlとMainWindowという二つのXAMLとC#のコードを指定しているところです。  
この部分については次のXAMLの項で触れます。

### XAMLファイル

App.xaml
```
<Application x:Class="WpfTest.App"
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  StartupUri="MainWindow.xaml">
</Application>
```

MainWindow.xaml
```
<Window x:Class="WpfTest.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="WpfTest" Height="500" Width="700">
    <Grid>
        
    </Grid>
</Window>
```

まずはApp.xamlを見てみます。  
特徴的なのは、StartupUriにMainWindowを指定しているところでしょう。  
StartupUriで指定したウィンドウを起動時に表示するため、このアプリケーションを実行するとMainWindow.xamlが表示されます。

では、次にMainWindow.xamlを見てみます。
タイトルがWpfTest、高さが500、幅が700など主に見た目の部分について指定されています。

### C#ファイル

App.xaml.cs
```
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace WpfTest
{
    public partial class App : Application
    {
    }
}
```

MainWindow.xaml.cs
```
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace WpfTest
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
    }
}
```

そして上記5つのファイルをフォルダに配置し、同じ階層でビルドツールを実行します。

```
> C:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe
```

これによりそのフォルダのbin\Releaseの中に、実行ファイルが作成されます。  
実行すると下記のようにGUIアプリケーションの雛形が完成します。

![gui](/img/wpf/GUI.png)

今回は雛形でしたが、MainWindow.xamlのGrid内に見た目の部分を書いていき、
ロジックはMainWindow.csもしくは他のC#ファイルを作成し、組み立てていきます。

↓githubにコードあげました。  
[Tiny-WPF](https://github.com/RuBisCO28/Tiny-WPF)


## 最後に一言
手書きXAMLは男のロマン・・・?