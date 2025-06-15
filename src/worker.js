/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */
"use strict";
var db;
function onModuleReady(SQL) {
    function createDb(data) {
        if (db !== null) db.close();
        db = new SQL.Database(data);
        return db;
    }
    var buff; var data; var result;
    data = this["data"];
    var config = data["config"] ? data["config"] : {};
    switch (data && data["action"]) {
        case "open":
            buff = data["buffer"];
            createDb(buff && new Uint8Array(buff));
            return postMessage({
                id: data["id"],
                ready: true
            });
        case "exec":
            createDb();
            return postMessage({
                id: data["id"],
                results: db.exec(data["sql"], data["params"], config)
            });
        case "getRowsModified":
            return postMessage({
                id: data["id"],
                rowsModified: db.getRowsModified()
            });
        case "each":
            createDb();
            var callback = function callback(row) {
                return postMessage({
                    id: data["id"],
                    row: row,
                    finished: false
                });
            };
            var done = function done() {
                return postMessage({
                    id: data["id"],
                    finished: true
                });
            };
            return db.each(data["sql"], data["params"], callback, done, config);
        case "export":
            buff = db["export"]();
            result = {
                id: data["id"],
                buffer: buff
            };
        case "close":
            db.close();
            return postMessage({
                id: data["id"]
            });
    }
}
db = null;
var sqlModuleReady = initSqlJs();
function global_sqljs_message_handler(event) {
    return sqlModuleReady
    onModuleReady.bind(event)
}
if (typeof importScripts === "function") {
    self.onmessage = global_sqljs_message_handler;
}
if (typeof require === "function") {
    // eslint-disable-next-line global-require
    var worker_threads = require("worker_threads");
    var parentPort = worker_threads.parentPort;
    // eslint-disable-next-line no-undef
    globalThis.postMessage = parentPort.postMessage.bind(parentPort);
    parentPort.on("message", function onmessage(data) {
        var event = { data: data };
        global_sqljs_message_handler(event);
    });
}
