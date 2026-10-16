# WS-pastebin
Projekt 2 för Webbtjänter och molnteknologi kursen

För att runna:
1.cd backend
2.npm run dev
3.kör liveserver i index.html

Sätt en JWT i URL:en, exempel:
`index.html?token=<JWT>`. samma secret som i projekt 1 och innehåller sub, namn och lobby. Lobby fungerar som en room id.
Klienter med samma `lobby` delar meddelanden.