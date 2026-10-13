# EC Eligibility Checker

Password-protected tool for PropNex agents to key in a buyer's household details and see indicative Executive Condominium (EC) eligibility: FITCH criteria, wait-out periods, CPF Housing Grant estimate, resale levy, income assessment period and MOP dates.

Live app: https://jtcksmu.github.io/EC-Eligibility-Checker/

The app inside `index.html` is encrypted (AES-256-GCM, key from PBKDF2-SHA256) and only opens with the access password. To rebuild after editing the source (kept locally, not in this repo):

```powershell
$env:EC_PASSWORD = '...'; & "C:\Program Files\nodejs\node.exe" build.mjs
```

**Disclaimer:** For reference only. Final eligibility is determined by HDB. Special cases can appeal to HDB.
