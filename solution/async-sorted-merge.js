"use strict";
const { Heap } = require('heap-js');

// Print all entries, across all of the *async* sources, in chronological order.

const LOG_ENTRY_PRINT_PERCENTAGE = 0.25;

const fillEarliestEntriesFromLogSources = async (logSources, logEntryHeap) => {
  return Promise.all(
    logSources.map(logSource =>
      logSource.popAsync().then(logEntry => {
        if (!logEntry) return null;
        if (logEntryHeap.length > 1 && logEntry.date.getTime() <= logEntryHeap.get(1).date.getTime()) {
          return logSource;
        }
        logEntryHeap.push(logEntry);
        return null;
      })
    )
  );
};

module.exports = async (logSources, printer) => {
    let activeLogSources = logSources.filter(logSource => !logSource.drained);
    const logEntryMinHeap = new Heap((a, b) => a.date.getTime() - b.date.getTime());
    logEntryMinHeap.init(activeLogSources.map(logSource => logSource.last));

    while(logEntryMinHeap.peek() || activeLogSources.length > 0) {
      await fillEarliestEntriesFromLogSources(activeLogSources, logEntryMinHeap).then(
        async (result) => {
          const remainingLogSources = result.filter((i) => i);
          if (remainingLogSources.length > 0) {
            await fillEarliestEntriesFromLogSources(remainingLogSources, logEntryMinHeap);
          }
        }
      );

      for (let printCounter = 0; printCounter < Math.floor(activeLogSources.length*LOG_ENTRY_PRINT_PERCENTAGE); printCounter++) {
        printer.print(logEntryMinHeap.pop());
      }

      activeLogSources = activeLogSources.filter((logSource) => !logSource.drained);
      if (!activeLogSources.length) {
        while (logEntryMinHeap.peek()) printer.print(logEntryMinHeap.pop());
      }
    }
    
    printer.done();
    return Promise.resolve(console.log("Async sort complete."));
};
