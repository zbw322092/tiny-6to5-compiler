const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../__tests__/files/file.js'), 'utf8');

interface ScannerState {
  index: number;
  lineNumber: number;
  lineStart: number;
}

class Scanner {

  readonly source: string;
  trackComment: boolean;

  index: number;
  lineNumber: number;
  lineStart: number;

  private readonly length: number;

  constructor(code: string) {
    this.source = code;
    this.trackComment = false;

    this.length = code.length;
    this.index = 0;
    this.lineNumber = (code.length > 0) ? 1 : 0;
    this.lineStart = 0;
  }

  public saveState(): ScannerState {
    return {
      index: this.index,
      lineNumber: this.lineNumber,
      lineStart: this.lineStart
    }
  }

  public restoreState(state: ScannerState): void {
    this.index = state.index;
    this.lineNumber = state.lineNumber;
    this.lineStart = state.lineStart;
  }

  public eof(): boolean {
    return this.index >= this.length;
  }

  public scanComments() {

  }
}
