"use strict";
const { Heap } = require('heap-js');

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const logSourceMinHeap = new Heap((a, b) => a.last.date.getTime() - b.last.date.getTime());
  logSourceMinHeap.init(logSources);

  while(logSourceMinHeap.size() > 0) {
    const currentLog = logSourceMinHeap.pop();

    printer.print(currentLog.last);
    currentLog.pop();
    
    if (!currentLog.drained) {
      logSourceMinHeap.push(currentLog);
    }
  }

  printer.done();
  return console.log("Sync sort complete.");
};
