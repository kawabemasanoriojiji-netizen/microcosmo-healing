# アクセス解析の設定

このサイトは Google Analytics 4 を読み込める状態になっています。
現在、`analytics.js` には測定ID `G-CS7Y04NBCW` が設定されています。

## 設定手順

1. Google Analytics で GA4 プロパティを作成します。
2. 「データストリーム」で Web を選び、サイトURLに `https://kawabemasanoriojiji-netizen.github.io/microcosmo-healing/` を設定します。
3. 表示された測定IDをコピーします。形式は `G-` から始まります。
4. 測定IDを変更する場合は、`analytics.js` のこの行を置き換えます。

```js
var GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
```

例:

```js
var GA_MEASUREMENT_ID = "G-ABCD123456";
```

## 見られるようになるもの

- ページビュー
- 参照元
- デバイス
- 国・地域
- LINE 相談ボタンなどのクリック: `contact_click`
- Instagram / Threads / Blogger など外部リンクのクリック: `external_link_click`

## メモ

- ローカル確認中や測定ID未設定時は、アクセス解析を送信しません。
- ブラウザの Do Not Track が有効な訪問者は計測しません。
