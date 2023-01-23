"use strict";
const { Heap } = require('heap-js');

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const logHeap = new Heap((a, b) => a.last.date.getTime() - b.last.date.getTime());
  logHeap.init(logSources);

  while(logHeap.size() > 0) {
    const currentLog = logHeap.pop();

    printer.print(currentLog.last);
    currentLog.pop();
    
    if (!currentLog.drained) {
      logHeap.push(currentLog);
    }
  }

  printer.done();
  return console.log("Sync sort complete.");
};
