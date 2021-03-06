# PayMFC | Контроллер

Контроллер состоит из набора нескольких функций-помощников для подписи, проверки подписи, генерации ссылок и ответа на запрос. Для каждой функции предложена схема работы ниже.

## Функции кодирования

* Кодирование в JSON производится с заменой символов, код которых > 127 (не входит в диапазон ASCII), на соответствующие `\u`-последовательности. Регулярное выражение PCRE для таких символов можно записать как `/[\u0080-\uFFFF]/g` (`0080` в шестнадцатеричной системе равно 128).
* Результат хэша `sha1` должен представлять собой бинарные данные с длиной в 20, а не `hex`-строку длиной в 40 символов

## Подпись

Входящие данные кодируются в JSON (см. функции кодирования), а затем в Base64.
Подпись формируется через хэш sha1 приватного ключа + закодированной строки + приватного ключа (см. функции кодирования), а затем выходные бинарные данные кодируются в Base64. Функция возвращает объект со свойствами `data` (закодированные данные) и `signature` (подпись).

## Проверка подписи

Первым делом, необходимо раскодировать JSON-данные, с ними дальше и будет проходить работа. Их, для простоты, мы назовём входными данными.

Далее, необходимо раскодировать поле `data` из входных данных как Base64, а затем из получившегося JSON. Назовём это раскодированными данными.

Затем подписываются раскодированные данные и сравниваются поля `signature` из входных данных и `signature` из подписи. Результат сравнения и будет результатом проверки. Для удобства, если подписи не совпали, можно возвращать `null`, а если совпали — раскодированные данные, как сделано в SDK.

## Ответ на запрос

Ответ на запрос должен содержать заголовок `Content-Type` со значением `application/paymfc-data` и код ответа 200 (даже в случае ошибки), иначе будет отвергнут. Содержимое ответа — JSON-объект со свойствами:
`error` — если произошла ошибка, должно быть задано в виде строки. ВНИМАНИЕ! Текст ошибки будет показан пользователю в кошельке, не передавайте приватную информацию!<br/>
`data` и `signature` задаются, если ошибки не произошло и равны тому, что возвращает функция подписи. Подписываются данные, возвращённые из функции-обработчика, куда передаются расшифрованные данные (см. проверку подписи). Пример функции-обработчика можно посмотреть на [главной странице](../..).

## Генерация ссылок

Генерация ссылок не затрагивает другие функции контроллера и может быть реализована отдельно (в т.ч. и на клиенте), поэтому вынесена на [отдельную страницу](../links)

## Заключение

Этот набор функций и формурует полноценный SDK. Все они в сборке позволяют корректно взаимодействовать с сервером. Сам сервер использует обратное соединение API — т.е. вызывает функции на вашем сервере по какому-либо событию. Это позволяет автоматически обрабатывать возможные ошибки соединения на нашем сервере, хоть мы и уверены в аптайме вашего сайта 😉

[Вернуться на главную](../..)
