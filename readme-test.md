# Thoughts

It's possible to test some logic without browser, but when it comes to `RTCPeerConnection` this API is only available
in Browsers. We could either use browser or mock this object.

## Mocking Browser API (RTCPeerConnection)

Pros:

- Faster tests
- Tests doesn't depend on current browser version
  Cons:

* Mocking is challenging. We can make many mistakes when mocking, and we can make incorrect assumptions.

## Running in browser

Props:

- testing real API
  Cons:

* more complicated test
* test depends on current browser version

# Problems

Przeglądarka i framework testowy to dwa osobne środowiska i trudno jest do pustej przeglądarki dodać bibliotekę
zewnętrzną, która nie jest obecna na stronie.

# Strona testowa z zaimportowaną biblioteką

Można przygotować stronę testową, która będzie miała potrzebną nam bibliotę
i przypisany do window obiekt `WebRTCEndpoint`.
Można wejść z nim w interakcję za pomocą `.evaluate`
Problemy:

- Ta funkcja może zwracać tylko serializowane dane, więc na tym obiekcie nie można np. założyc event listenerów
  już w kodzie testu.
- Można te event listenry zakładać w przeglądarce i potem wynik ich wyeksponować jako jakieś pole w html
  Kod takiego testu będzie raczej średni

# Ideas

## Pisanie testów jako stron HTML

Tworzę stronę index.html, które odczytuje z jakimi query params została uruchomiona i na ich podstawie wczytuje określy
plik `.ts`.
W każdym z tych plików jest napisany jest jeden test.
Każdy ten test ustawia jakieś pole, które jest nazwą testu, żeby framework mógł je odczytać.
Jeżeli test jest pozytwny to ustala jakiś output na success.
Jeżeli jest negatywny to rzuca wyjątek lub ustawia jakiś element na faulure.
Dodatkowo ustala do jakiegoś elementu wpisuje error message.
Framework musi tylko przeiterować się po wszystkich plikach i sprawdzić czy są success czy failure.
Przykład jak generować testy jest w pliku dynamically.spec.ts
