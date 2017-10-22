const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../__tests__/files/file.js'), 'utf8');

import { 
  isLineTerminator,
  isWhiteSpace
} from './character';

interface Position {
  line: number;
  column: number
}

interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

interface Comment {
  multiLine: boolean;
  slice: number[];
  range: [number, number];
  loc: SourceLocation;
}

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
    let comments;
    if (this.trackComment) {
      comments = [];
    }

    let start: boolean = (this.index === 0);
    while (!this.eof()) {
      let ch = this.source.charCodeAt(this.index);

      if (isWhiteSpace(ch)) {
        ++this.index;
      } else if (isLineTerminator(ch)) {
        /** reference url:
         * https://www.ecma-international.org/ecma-262/8.0/index.html#sec-line-terminators
         * 
         * The sequence <CR><LF> is commonly used as a line terminator. 
         * It should be considered a single SourceCharacter for the purpose of reporting line numbers.
         */
        ++this.index;
        if (ch === 0x000D && this.source.charCodeAt(this.index) === 0x000A) {
          ++this.index;
        }
        ++this.lineNumber;
        this.lineStart = this.index;
        start = true;
      } else if (ch === 0x0002F /* 0x0002F is / */) {
        ch = this.source.charCodeAt(this.index + 1);
        if (ch === 0x0002F) {
          // do something
        } else if (ch === 0x002A /* 0x002A is * */) {
          // do something
        } else {
          break; // is not comment
        }
      } else if (start && ch === 0x002D /* 0x002D is - */) {
        // 0x003E is >
        if (
          (this.source.charCodeAt(this.index + 1) === 0x002D) && 
          (this.source.charCodeAt(this.index + 2) === 0x003E)
        ) {
          // '-->' is a single-line comment
          // do something
        } else {
          break; // is not comment
        }
      } else if (ch === 0x003C /* 0x003C is < */) {
        if (this.source.slice(this.index+1, this.index + 4) === '!--') {
          // is comment like <!--
          this.index += 4;
          // do something
        } else {
          break; // is not comment
        }
      } else {
        break; // not handle and is not comment
      }
    }

    return comments;
  }

  
}
