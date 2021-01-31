# 3D vizualizace dat pozorování pavouků v ČR

Autor: <a href="https://github.com/AdamBajger/">Adam Bajger</a>

Tato vizualizace je inspirována <a href="http://mastermaps.com/">Bjørnem Sandvikem</a> a jeho <a href="http://geoforum.github.io/veiledning09/">vizualizace dat hustota osídlení města Oslo</a>.
Vizualizace využívá knihovny <a href="http://threejs.org/">Three.js</a>,  <a href="https://jquery.com/">jQuery-3.5.1.js</a> a <a href="https://d3js.org/">D3.js</a>

Pro pohyb po 3D mapě je využíván modul <a href="https://gist.github.com/DanLeininger/8c53afa96d63b31ff902">TrackballControls.js</a>, který byl ale upraven tak, aby se kamera neotáčela kolem osy pozorovatele a mapa tak vždy zůstávala ve vodorovné poloze.

##Instalace

Celý projekt běží na straně uživatele, nicméně vzhledem k tomu,
že prohlížeče neumožňují načítat cross-origin requests,
je nutné nejprve nainstalovat <a href="https://nodejs.org/">Node.js</a>.

Následně příkazem ```npm install```