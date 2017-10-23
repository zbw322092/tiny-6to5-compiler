const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../__tests__/files/file.js'), 'utf8');

import {
  isLineTerminator,
  isWhiteSpace,
  isIdentifierPart,
  isIdentifierStart,
  fromCodePoint,
  isHexDigit
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

  private skipSingleLineComment(offset: number): Comment[] {
    let comments: Comment[] = [];
    let start, loc;

    if (this.trackComment) {
      comments = [];
      start = this.index - offset;
      loc = {
        start: {
          line: this.lineNumber,
          column: this.index - this.lineStart - offset
        },
        end: {}
      };
    }

    while (!this.eof()) {
      let ch = this.source.charCodeAt(this.index);
      ++this.index;
      if (isLineTerminator(ch)) {
        if (this.trackComment) {
          loc.end = {
            line: this.lineNumber,
            column: this.index - this.lineStart - 1
          };

          const entry: Comment = {
            multiLine: false,
            slice: [start + offset, this.index - 1],
            range: [start, this.index - 1],
            loc: loc
          };

          comments.push(entry);
        }

        // the <CR><LF> sequence
        if (ch === 0x000D && this.source.charCodeAt(this.index) === 0x000A) {
          ++this.index;
        }
        ++this.lineNumber;
        this.lineStart = this.index;
        return comments;
      }
    }

    if (this.trackComment) {
      loc.end = {
        line: this.lineNumber,
        column: this.index - this.lineStart
      };
      const entry: Comment = {
        multiLine: false,
        slice: [start + offset, this.index],
        range: [start, this.index],
        loc: loc
      };
      comments.push(entry);
    }

    return comments;

  }

  private skipMultiLineComment(): Comment[] {
    let comments: Comment[] = [];
    let start, loc;

    if (this.trackComment) {
      comments = [];
      start = this.index - 2;
      loc = {
        start: {
          line: this.lineNumber,
          column: this.index - this.lineStart - 2
        },
        end: {}
      };
    }

    while (!this.eof()) {
      const ch = this.source.charCodeAt(this.index);
      if (isLineTerminator(ch)) {
        if (ch === 0x0D && this.source.charCodeAt(this.index + 1) === 0x0A) {
          ++this.index;
        }
        ++this.lineNumber;
        ++this.index;
        this.lineStart = this.index;
      } else if (ch === 0x2A) {
        // Block comment ends with '*/'.
        if (this.source.charCodeAt(this.index + 1) === 0x2F) {
          this.index += 2;
          if (this.trackComment) {
            loc.end = {
              line: this.lineNumber,
              column: this.index - this.lineStart
            };
            const entry: Comment = {
              multiLine: true,
              slice: [start + 2, this.index - 2],
              range: [start, this.index],
              loc: loc
            };
            comments.push(entry);
          }
          return comments;
        }
        ++this.index;
      } else {
        ++this.index;
      }
    }

    // Ran off the end of the file - the whole thing is a comment
    if (this.trackComment) {
      loc.end = {
        line: this.lineNumber,
        column: this.index - this.lineStart
      };
      const entry: Comment = {
        multiLine: true,
        slice: [start + 2, this.index],
        range: [start, this.index],
        loc: loc
      };
      comments.push(entry);
    }

    return comments;
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
          this.index += 2;
          const comment = this.skipSingleLineComment(2);
          if (this.trackComment) {
            comments = comments.concat(comment);
          }
          start = true;
        } else if (ch === 0x002A /* 0x002A is * */) {
          this.index += 2;
          const comment = this.skipMultiLineComment();
          if (this.trackComment) {
            comments = comments.concat(comment);
          }
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
          this.index += 3;
          const comment = this.skipSingleLineComment(3);
          if (this.trackComment) {
            comments = comments.concat(comment);
          }
        } else {
          break; // is not comment
        }
      } else if (ch === 0x003C /* 0x003C is < */) {
        if (this.source.slice(this.index + 1, this.index + 4) === '!--') {
          // is comment like <!--
          this.index += 4;
          const comment = this.skipSingleLineComment(4);
          if (this.trackComment) {
            comments = comments.concat(comment);
          }
        } else {
          break; // is not comment
        }
      } else {
        break; // not handle and is not comment
      }
    }

    return comments;
  }

  /**
   * convert surrogate pair to a Unicode code point
   * reference url:
   * https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
   * 
   * @private
   * @param {number} i 
   * @returns {number} 
   * @memberof Scanner
   */
  private codePointAt(i: number): number {
    let cp = this.source.charCodeAt(i);

    if (cp >= 0xD800 && cp <= 0xDBFF) {
      let high = cp;
      let low = this.source.charCodeAt(i + 1);
      if (low >= 0xDC00 && low <= 0xDFFF) {
        cp = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
      }
    }

    return cp;
  }

  private hexValue(ch: string): number {
    return '0123456789abcdef'.indexOf(ch.toLowerCase());
  }


  private scanHexEscape(prefix: string): string | null {
    const len = (prefix === 'u') ? 4 : 2;
    let code = 0;

    for (let i = 0; i < len; ++i) {
      if (
        !this.eof() &&
        isHexDigit(this.source.charCodeAt(this.index))
      ) {
        code = code * 16 + this.hexValue(this.source[this.index++]);
      } else {
        return null;
      }
    }

    return String.fromCharCode(code);
  }

  private scanUnicodeCodePointEscape(): string {
    let ch = this.source[this.index];
    let code = 0;

    // At least, one hex digit is required.
    if (ch === '}') {
      // throw error
    }

    while (!this.eof()) {
      ch = this.source[this.index++];
      if (!isHexDigit(ch.charCodeAt(0))) {
        break;
      }
      code = code * 16 + this.hexValue(ch);
    }

    if (code > 0x10FFFF || ch !== '}') {
      // throw error
    }

    return fromCodePoint(code);
  }



  private getIdentifier(): string {
    const start = this.index++;

    while (!this.eof()) {
      const ch = this.source.charCodeAt(this.index);
      if (ch === 0x005C) {
        // Blackslash (U+005C) marks Unicode escape sequence.
        // do something
        this.index = start;
        return this.getComplexIdentifier();
      } else if (ch >= 0xD800 && ch < 0xDFFF /* surrogate pair */) {
        // do something
        this.index = start;
        return this.getComplexIdentifier();
      }
      if (isIdentifierPart(ch)) {
        ++this.index;
      } else {
        break; // is not identifier
      }
    }

    return this.source.slice(start, this.index);
  }

  private getComplexIdentifier(): string {
    let cp = this.codePointAt(this.index);
    let id = fromCodePoint(cp);
    this.index += id.length;

    let ch;
    if (cp === 0x005C) {
      if (this.source.charCodeAt(this.index) !== 0x75) {
        // throw error
      }
      ++this.index;
      if (this.source[this.index] === '{') {
        ++this.index;
        // es6 unicode code point escape
        ch = this.scanUnicodeCodePointEscape();
      } else {
        // hex escape
        ch = this.scanHexEscape('u');
        if (
          ch === null ||
          ch === '\\' ||
          isIdentifierStart(ch.charCodeAt(0))
        ) {
          // throw error
        }
      }
      id = ch;
    }

    while (!this.eof()) {
      cp = this.codePointAt(this.index);
      if (!isIdentifierPart(cp)) {
        break;
      }
      ch = fromCodePoint(cp);
      id += ch;
      this.index += ch.length;

      // '\u' (U+005C, U+0075) denotes an escaped character.
      if (cp === 0x5C) {
        id = id.substr(0, id.length - 1);
        if (this.source.charCodeAt(this.index) !== 0x75) {
          // throw error
        }
        ++this.index;
        if (this.source[this.index] === '{') {
          ++this.index;
          ch = this.scanUnicodeCodePointEscape();
        } else {
          ch = this.scanHexEscape('u');
          if (ch === null || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
            // throw error
          }
        }
        id += ch;
      }
    }

    return id;

  }

}

const result = new Scanner(src);
result.trackComment = true;
const comment = result.scanComments();
