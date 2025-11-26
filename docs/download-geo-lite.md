1. MaxMindのアカウントを作成し、License Keyを発行
   https://www.maxmind.com/en/accounts/1260494/license-key/create

2. .envファイルにLicense keyを設定

```
MAXMIND_LICENSE_KEY=your_maxmind_license_key_here
```

3. npm installを実施

```
npm install
```

これによりpostinstallコマンドも実行され、geoipディレクトリにGeoLite2-City.mmdbが配備される
