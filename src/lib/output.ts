/** Output formatter — JSON for agents, table for humans */

let jsonMode = false;

export function setJsonMode(enabled: boolean) {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function output(data: any) {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    prettyPrint(data);
  }
}

export function outputError(message: string, details?: any) {
  if (jsonMode) {
    console.error(JSON.stringify({ error: message, details }, null, 2));
  } else {
    console.error(`Error: ${message}`);
    if (details) console.error(details);
  }
  process.exit(1);
}

export function outputSuccess(message: string, data?: any) {
  if (jsonMode) {
    console.log(JSON.stringify({ success: true, message, ...data }));
  } else {
    console.log(`✓ ${message}`);
    if (data) prettyPrint(data);
  }
}

function prettyPrint(data: any) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('(empty)');
      return;
    }
    printTable(data);
  } else if (typeof data === 'object' && data !== null) {
    const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length));
    for (const [key, value] of Object.entries(data)) {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—');
      console.log(`  ${key.padEnd(maxKeyLen)}  ${displayValue}`);
    }
  } else {
    console.log(data);
  }
}

function printTable(rows: any[]) {
  if (rows.length === 0) return;

  const keys = Object.keys(rows[0]);
  const widths = keys.map(k =>
    Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)),
  );

  // Cap columns at 40 chars
  const cappedWidths = widths.map(w => Math.min(w, 40));

  // Header
  const header = keys.map((k, i) => k.padEnd(cappedWidths[i])).join('  ');
  const separator = cappedWidths.map(w => '─'.repeat(w)).join('──');

  console.log(header);
  console.log(separator);

  // Rows
  for (const row of rows) {
    const line = keys.map((k, i) => {
      const val = String(row[k] ?? '—');
      return val.substring(0, cappedWidths[i]).padEnd(cappedWidths[i]);
    }).join('  ');
    console.log(line);
  }

  console.log(`\n${rows.length} result(s)`);
}
