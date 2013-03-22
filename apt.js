(function(factory) {
  var Emitter;
  if(typeof window === 'object' && window.document) {
    if(typeof LucidJS !== 'object') { throw new Error('Cannot initialize AptJS. LucidJS is required.'); }
    window.AptJS = factory('global', LucidJS.emitter);
  }
  else if(typeof module === 'object' && module.exports){
    module.exports = factory('node', require('lucidjs').emitter);
  }
})(function(env, Emitter) {
  var aptJS = {};

  aptJS.map = map;
  aptJS.map.parallel = parallelMap;
  aptJS.map.serial = serialMap;
  aptJS.execute = execute;
  aptJS.execute.parallel = parallelExecute;
  aptJS.execute.serial = serialExecute;

  return aptJS;

  function parallelMap(data) {
    return map(data.length, data);
  }

  function serialMap(data) {
    return map(1, data);
  }

  function parallelExecute(callbacks    ) {
    if(typeof callbacks === 'function') {
      callbacks = Array.prototype.slice.apply(arguments);
    }
    return execute(callbacks.length, callbacks);
  }

  function serialExecute(callbacks    ) {
    if(typeof callbacks === 'function') {
      callbacks = Array.prototype.slice.apply(arguments);
    }
    return execute(1, callbacks);
  }

  function map(batchSize, dataSet) {
    var _dataSet = [], dI, results, emitter, retryData = [], errors = [],
    cI = 0, cII = 0, bI = 0, bII = 0, paused = false;

    if(typeof dataSet.push === 'function') {
      for(dI = 0; dI < dataSet.length; dI += 1) {
        _dataSet.push({ "index": dI, "attempts": 0, "data": dataSet[dI] });
      }
      results = [];
    } else {
      _dataSet.length = 0;
      for(dI in dataSet) {
        if(!dataSet.hasOwnProperty(dI)) { continue; }
        _dataSet.push({ "index": dI, "attempts": 0, "data": dataSet[dI] });
        _dataSet.length += 1;
      }
      results = {};
    }
    dataSet = _dataSet;

    emitter = Emitter();
    emitter.batchSize = getSetBatchSize;
    emitter.start = processData;
    emitter.stop = stop;

    return emitter;

    function getSetBatchSize(_batchSize) {
      if(typeof _batchSize === 'number') { batchSize = _batchSize; }
      return batchSize;
    }

    function processData() {
      var WorkerApi;
      while(!paused && cI < dataSet.length && bI < batchSize) {
        WorkerApi = WorkerHelper(dataSet[cI]);
        emitter.trigger('task', dataSet[cI].data, WorkerApi);
        bI += 1; cI += 1;
      }
    }

    function finish() {
      if(retryData.length) {
        dataSet = retryData;
        retryData = [];
        cI = 0; cII = 0; bI = 0; bII = 0;
        processData();
      } else {
        if(errors.length) {
          emitter.set('error', errors);
        } else {
          emitter.set('complete', results);
        }
      }
    }

    function start() { paused = false; processData(); }

    function stop() { paused = true; }

    function WorkerHelper(data) {
      var helper, taskCompleted = false;

      helper = exit;
      helper.done = done;
      helper.retry = retry;
      helper.error = error;
      helper.batchSize = getSetBatchSize;
      helper.attempts = data.attempts;

      return helper;

      function exit(err, result) {
        if(err) { reportError(err); }
        else if(err === false) { retry(); }
        else { done(); }
      }

      function done(result) { results[data.index] = result; next(); }
      function retry() { retryData.push(data); next(); }
      function error(err) { errors.push(err); next(); }

      function next() {
        if(taskCompleted) { return; }
        taskCompleted = true;
        cII += 1; bII += 1; data.attempts += 1;
        if(cII > dataSet.length - 1) { finish(); }
        else if(bII > batchSize - 1) { bI = 0; bII = 0; processData(); }
      }
    }
  }

  function execute(batchSize, callbacks    ) {
    var execute, executeMap;

    if(typeof callbacks === 'function') {
      callbacks = Array.prototype.slice.apply(arguments, [1]);
    }

    executeMap = map(batchSize, callbacks);
    executeMap.on('task', function(callback, helper) { callback(helper); });

    execute = Emitter();
    execute.pipe(['complete', 'error'], executeMap);
    execute.batchSize = executeMap.batchSize;
    execute.start = executeMap.start;
    execute.stop = executeMap.stop;

    return execute;
  }
});
