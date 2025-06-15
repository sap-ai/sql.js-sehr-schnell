var initSqlJsPromise = undefined;
var initSqlJs = function (moduleConfig) {
    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    initSqlJsPromise = new Promise(function (resolveModule, reject) {
        var Module = moduleConfig : {};
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };
        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });
        module = undefined;
