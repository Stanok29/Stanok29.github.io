define(['service/api'], function (api) {
    'use strict';
    /*
     * Содержит средства для работы с хранилищем (чтение и запись в Web SQL)
     */

    var firstLaunch = true;

    /*
     * Подключается к бд, делает проверки на существование и выполняет переданную функцию
     */
    var makeTransaction = function (callback) {
        var db = window.openDatabase("LoyaDB", "1.0", "LoyaDB", 50 * 1024 * 1024);
        if (!db)
            throw new Error("Error with db connect");

        db.transaction(function (tr) {
            if (firstLaunch)
            {
                tr.executeSql('CREATE TABLE IF NOT EXISTS DICTIONARY (key unique primary key, value)');
                tr.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS keyIndex ON DICTIONARY (key)');
                firstLaunch = false;
            }

            callback(tr);

        }, function (tr, error) {
            console.log('check db error', tr, error);
        }, function (suc) {
            console.log('check db success');
        });
    };

    var normalizeString = function (input)
    {
        return input.toString().toLowerCase();
    };

    var handleError = function (tr, err)
    {
        console.log('some error', tr, err);
    };

    /*
     * Выполняет чтение по ключу из бд
     * @param {type} key
     * @param {type} callback
     * @returns {undefined}
     */
    var privateGet = function (key, callback) {
        makeTransaction(function (tr) {
            console.log('private get');

            key = normalizeString(key);

            tr.executeSql('select * from DICTIONARY where key=?', [key], function (tr, res) {
                console.log('get success', tr, res);
                if (res.rows.length === 0)
                    callback(null);
                else
                    callback(JSON.parse(res.rows[0].value));
            }, handleError);

        });
    };

    /*
     * Выполненяет запись по ключу в бд (создание или обновление)
     * @param {type} key
     * @param {type} value
     * @param {type} callback
     * @returns {undefined}
     */
    var privateSet = function (key, value, callback)
    {
        makeTransaction(function (tr) {
            value = JSON.stringify(value);

            console.log('private set');

            key = normalizeString(key);

            tr.executeSql('select * from DICTIONARY where key = ?', [key], function (tr, res) {
                if (res.rows.length === 0)
                {
                    tr.executeSql('Insert into DICTIONARY values (?, ?)', [key, value], function (tr, res) {
                        console.log('set success', tr, res);
                        callback(res.insertId);
                    }, handleError);
                }
                else
                {
                    tr.executeSql('Update DICTIONARY set value=? where key = ?', [value, key], function (tr, res) {
                        console.log('set success', tr, res);
                        callback(res.insertedId);
                    }, handleError);
                }

            }, handleError);

        });
    };

    return{
        /*
         * Читает значение по ключу из пользовательского хранилища. Передаёт в коллбэк прочтенное значение или null, если нет записи в бд
         * @param {type} key Ключ для чтения
         * @param {type} callback Коллбэк, в который будет передан результат
         * @returns {undefined}
         */
        get: function (key, callback) {
            return privateGet(key, callback);
        },
        /*
         * Записывает объект по ключу в пользовательское хранилище
         */
        set: function (key, value, callback) {
            return privateSet(key, value, callback);
        }
    };
});
