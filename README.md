# 3D vizualizace dat pozorování pavouků v ČR

Autor: <a href="https://github.com/AdamBajger/">Adam Bajger</a>

Tato vizualizace je inspirována <a href="http://mastermaps.com/">Bjørnem Sandvikem</a> a jeho <a href="http://geoforum.github.io/veiledning09/">vizualizace dat hustota osídlení města Oslo</a>.
Vizualizace využívá knihovny <a href="http://threejs.org/">Three.js</a>,  <a href="https://jquery.com/">jQuery</a>, <a href="https://momentjs.com/">moment.js</a> a <a href="https://d3js.org/">D3.js</a>.
Všechny tyto knihovny jsou součástí repozitáře, není tedy třeba nic moc instalovat a celý projekt by měl běžet v pořádku offline. 

Pro pohyb po 3D mapě je využíván modul <a href="https://gist.github.com/DanLeininger/8c53afa96d63b31ff902">TrackballControls.js</a>, který byl ale upraven tak, aby se kamera neotáčela kolem osy pozorovatele a mapa tak vždy zůstávala ve vodorovné poloze.

## Instalace a spuštění

Celý projekt běží na straně uživatele, nicméně vzhledem k tomu,
že prohlížeče neumožňují načítat cross-origin požadavky,
je nutné nejprve nainstalovat <a href="https://nodejs.org/">Node.js</a>.

Součástí Node.js je také manažer balíčků **npm**. O tom, zda máte nainstalované obojí se přesvědčíte spuštěním příkazu ve vašem terminálu:
```
node -v
npm -v
``` 
Pokud se vám zobrazí čísla verzí, máte nainstalováno.
Pokud nemáte terminál spuštěný ve složce s projektem,
přesuňte se do ní příkazem 
```
 cd "cesta/ke/složce/projektu/" 
``` 
a následně pomocí příkazů 

```
npm install
node index.js
``` 

nejprve nainstalujete závislosti projektu a poté pro něj spustíte lokální server.
Měla by se vám zobrazit zpráva ```PV251 homework app is listening on port 3000!```
a měli byste na <a href="http://localhost:3000/">adrese</a> lokálního zprostředkovatele nalézt běžící aplikaci.

## Použití

Při spuštění aplikace se zobrazí okno s nápovědou, která vysvětluje použití.
