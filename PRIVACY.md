# Datenschutzerklärung

**Kurzfassung:** FamLumi läuft komplett lokal auf deinem Gerät. Es gibt aktuell keinen Server, der eure Daten sammelt.

## Welche Daten werden gespeichert?
Aufgaben, Kalender-Termine, Chat-Nachrichten und der "Zuhause/unterwegs"-Status werden ausschließlich im lokalen Speicher deines Browsers (localStorage) abgelegt. Diese Daten verlassen dein Gerät nicht, außer du nutzt aktiv die Funktion "Sichern" (Backup-Datei) oder richtest den optionalen Cloud-Sync ein. Welches Familienmitglied du auf diesem Gerät bist, wird ebenfalls nur lokal gespeichert (kein Passwort, keine echte Anmeldung – nur eine Zuordnung "das bin ich").

## Standort
Es wird kein GPS und keine echte Standortposition erfasst. Der "Unterwegs"-Status ist ein von Hand gesetzter Schalter ("zu Hause" / "unterwegs"), keine automatische Ortung.

Für die Kartenansicht im Karte-Tab gibt es einen Schalter ("Standort teilen"), der standardmäßig **ausgeschaltet** ist und jederzeit selbst umgeschaltet werden kann. Jede Person sieht und ändert dort ausschließlich ihre eigene Freigabe – nicht die der anderen Familienmitglieder. Solange diese Funktion nicht aktiv genutzt wird, wird kein Standort erfasst oder geteilt. Beim Öffnen des Karte-Tabs fragt die App einmalig den aktuellen Standort ab (nicht dauerhaft), nur um die eigene Kartenansicht zu zentrieren; dieser Wert wird nicht gespeichert und nicht an Dritte übermittelt.

## Benachrichtigungen
Im Hinweise-Tab lässt sich optional ein Schalter für Benachrichtigungen aktivieren (standardmäßig **ausgeschaltet**). Bei Aktivierung fragt das Gerät einmalig die übliche Benachrichtigungs-Berechtigung ab. Neue Aufgaben, Termine und Chat-Nachrichten anderer Familienmitglieder werden dann direkt auf dem Gerät angezeigt, solange die App geöffnet oder im Hintergrund aktiv ist. Es findet dabei keine Verbindung zu einem externen Push-Dienst statt – die Benachrichtigung wird ausschließlich lokal auf dem Gerät erzeugt, es werden keine Daten dafür an Dritte übermittelt.

## Rechtsgrundlage
Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung bzw. im berechtigten Interesse der Nutzung als privates Familienwerkzeug, Art. 6 Abs. 1 lit. a, f DSGVO.

## Schriftarten
FamLumi lädt keine Schriften von externen Servern nach. Es werden ausschließlich Schriften genutzt, die bereits auf dem jeweiligen Gerät (iOS/Android) vorinstalliert sind. Dadurch entsteht keine Verbindung zu Google- oder anderen Dritt-Servern beim Laden der App, und es wird auch keine IP-Adresse zu diesem Zweck übertragen.

## Hosting
Die App wird statisch über GitHub Pages ausgeliefert. Es gelten die Datenschutzhinweise von GitHub für den reinen Seitenaufruf (Server-Logs).

## Drittanbieter-Dienste & Lizenzen
Diese Dienste werden nur bei aktiver Nutzung der jeweiligen Funktion angefragt, nie im Hintergrund:

- **OpenStreetMap / Leaflet** (Karte-Tab): Kartenkacheln von tile.openstreetmap.org, Quellenangabe "© OpenStreetMap-Mitwirkende" wird automatisch sichtbar eingeblendet (Pflicht der OSM-Nutzungsrichtlinie). Es werden nur die gerade sichtbaren Kartenausschnitte geladen, kein Offline-Download im Voraus. Die Kartenbibliothek Leaflet selbst steht unter der sehr freizügigen BSD-2-Clause-Lizenz.
- **Firebase Realtime Database** (optionaler Geräte-Sync, Google): Nur aktiv, wenn eigene, selbst angelegte Firebase-Zugangsdaten in der App hinterlegt werden. Der kostenlose Spark-Tarif ist ausdrücklich für private/Hobby-Projekte dieser Größenordnung vorgesehen. Da du dabei ein eigenes Google-Konto/Projekt nutzt, gelten dafür die Nutzungsbedingungen von Google gegenüber dir direkt, nicht gegenüber der App.
