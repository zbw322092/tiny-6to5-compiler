const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../__tests__/files/file.js'), 'utf8');

import { Token } from './token';

import {
  isLineTerminator,
  isWhiteSpace,
  isIdentifierPart,
  isIdentifierStart,
  fromCodePoint,
  isHexDigit,
  isDecimalDigit,
  isOctalDigit
} from './character';

export interface RawToken {
  type: Token;
  value: string | number;
  pattern?: string;
  flags?: string;
  regex?: RegExp | null;
  octal?: boolean;
  cooked?: string;
  head?: boolean;
  tail?: boolean;
  lineNumber: number;
  lineStart: number;
  start: number;
  end: number;
}

export interface Position {
  line: number;
  column: number
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

export interface Comment {
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

export class Scanner {

  readonly source: string;
  trackComment: boolean;

  index: number;
  lineNumber: number;
  lineStart: number;

  private readonly length: number;
  private curlyStack: string[];

  constructor(code: string) {
    this.source = code;
    this.trackComment = false;

    this.length = code.length;
    this.index = 0;
    this.lineNumber = (code.length > 0) ? 1 : 0;
    this.lineStart = 0;

    this.curlyStack = [];
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

  private isKeyword(id: string): boolean {
    switch (id.length) {
      case 2:
        return (id === 'if') || (id === 'in') || (id === 'do');
      case 3:
        return (id === 'var') || (id === 'for') || (id === 'new') ||
          (id === 'try') || (id === 'let');
      case 4:
        return (id === 'this') || (id === 'else') || (id === 'case') ||
          (id === 'void') || (id === 'with') || (id === 'enum');
      case 5:
        return (id === 'while') || (id === 'break') || (id === 'catch') ||
          (id === 'throw') || (id === 'const') || (id === 'yield') ||
          (id === 'class') || (id === 'super');
      case 6:
        return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
          (id === 'switch') || (id === 'export') || (id === 'import');
      case 7:
        return (id === 'default') || (id === 'finally') || (id === 'extends');
      case 8:
        return (id === 'function') || (id === 'continue') || (id === 'debugger');
      case 10:
        return (id === 'instanceof');
      default:
        return false;
    }
  }

  private hexValue(ch: string): number {
    return '0123456789abcdef'.indexOf(ch.toLowerCase());
  }

  private octalValue(ch: string): number {
    return '01234567'.indexOf(ch);
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

  private scanIdentifier(): RawToken {
    let type: Token;
    const start = this.index;

    // Backslash (U+005C) starts an escaped character.
    const id = (this.source.charCodeAt(start) === 0x5C) ? this.getComplexIdentifier() : this.getIdentifier();

    // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    if (id.length === 1) {
      type = Token.Identifier;
    } else if (this.isKeyword(id)) {
      type = Token.Keyword;
    } else if (id === 'null') {
      type = Token.NullLiteral;
    } else if (id === 'true' || id === 'false') {
      type = Token.BooleanLiteral;
    } else {
      type = Token.Identifier;
    }

    if (type !== Token.Identifier && (start + id.length !== this.index)) {
      const restore = this.index;
      this.index = start;
      // this.tolerateUnexpectedToken(Messages.InvalidEscapedReservedWord);
      this.index = restore;
    }

    return {
      type: type,
      value: id,
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  private scanPunctuator(): RawToken {
    const start = this.index;

    // Check for most common single-character punctuators.
    let str = this.source[this.index];
    switch (str) {

      case '(':
      case '{':
        if (str === '{') {
          this.curlyStack.push('{');
        }
        ++this.index;
        break;

      case '.':
        ++this.index;
        if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
          // Spread operator: ...
          this.index += 2;
          str = '...';
        }
        break;

      case '}':
        ++this.index;
        this.curlyStack.pop();
        break;
      case ')':
      case ';':
      case ',':
      case '[':
      case ']':
      case ':':
      case '?':
      case '~':
        ++this.index;
        break;

      default:
        // 4-character punctuator.
        str = this.source.substr(this.index, 4);
        if (str === '>>>=') {
          this.index += 4;
        } else {

          // 3-character punctuators.
          str = str.substr(0, 3);
          if (str === '===' || str === '!==' || str === '>>>' ||
            str === '<<=' || str === '>>=' || str === '**=') {
            this.index += 3;
          } else {

            // 2-character punctuators.
            str = str.substr(0, 2);
            if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
              str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
              str === '++' || str === '--' || str === '<<' || str === '>>' ||
              str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
              str === '<=' || str === '>=' || str === '=>' || str === '**') {
              this.index += 2;
            } else {

              // 1-character punctuators.
              str = this.source[this.index];
              if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                ++this.index;
              }
            }
          }
        }
    }

    if (this.index === start) {
      // this.throwUnexpectedToken();
    }

    return {
      type: Token.Punctuator,
      value: str,
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }


  private scanHexLiteral(start: number): RawToken {
    let num = '';

    while (!this.eof()) {
      if (!isHexDigit(this.source.charCodeAt(this.index))) {
        break;
      }
      num += this.source[this.index++];
    }

    if (num.length === 0) {
      // this.throwUnexpectedToken();
    }

    if (isIdentifierStart(this.source.charCodeAt(this.index))) {
      // this.throwUnexpectedToken();
    }

    return {
      type: Token.NumericLiteral,
      value: parseInt('0x' + num, 16),
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  private scanBinaryLiteral(start: number): RawToken {
    let num = '';
    let ch;

    while (!this.eof()) {
      ch = this.source[this.index];
      if (ch !== '0' && ch !== '1') {
        break;
      }
      num += this.source[this.index++];
    }

    if (num.length === 0) {
      // only 0b or 0B
      // this.throwUnexpectedToken();
    }

    if (!this.eof()) {
      ch = this.source.charCodeAt(this.index);
      /* istanbul ignore else */
      if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
        // this.throwUnexpectedToken();
      }
    }

    return {
      type: Token.NumericLiteral,
      value: parseInt(num, 2),
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  private scanOctalLiteral(prefix: string, start: number): RawToken {
    let num = '';
    let octal = false;

    if (isOctalDigit(prefix.charCodeAt(0))) {
      octal = true;
      num = '0' + this.source[this.index++];
    } else {
      ++this.index;
    }

    while (!this.eof()) {
      if (!isOctalDigit(this.source.charCodeAt(this.index))) {
        break;
      }
      num += this.source[this.index++];
    }

    if (!octal && num.length === 0) {
      // only 0o or 0O
      // this.throwUnexpectedToken();
    }

    if (isIdentifierStart(this.source.charCodeAt(this.index)) || isDecimalDigit(this.source.charCodeAt(this.index))) {
      // this.throwUnexpectedToken();
    }

    return {
      type: Token.NumericLiteral,
      value: parseInt(num, 8),
      octal: octal,
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  private isImplicitOctalLiteral(): boolean {
    // Implicit octal, unless there is a non-octal digit.
    // (Annex B.1.1 on Numeric Literals)
    for (let i = this.index + 1; i < this.length; ++i) {
      const ch = this.source[i];
      if (ch === '8' || ch === '9') {
        return false;
      }
      if (!isOctalDigit(ch.charCodeAt(0))) {
        return true;
      }
    }

    return true;
  }


  private scanNumericLiteral(): RawToken {
    const start = this.index;
    let ch = this.source[start];
    // assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
    //   'Numeric literal must start with a decimal digit or a decimal point');

    let num = '';
    if (ch !== '.') {
      num = this.source[this.index++];
      ch = this.source[this.index];

      // Hex number starts with '0x'.
      // Octal number starts with '0'.
      // Octal number in ES6 starts with '0o'.
      // Binary number in ES6 starts with '0b'.
      if (num === '0') {
        if (ch === 'x' || ch === 'X') {
          ++this.index;
          return this.scanHexLiteral(start);
        }
        if (ch === 'b' || ch === 'B') {
          ++this.index;
          return this.scanBinaryLiteral(start);
        }
        if (ch === 'o' || ch === 'O') {
          return this.scanOctalLiteral(ch, start);
        }

        if (ch && isOctalDigit(ch.charCodeAt(0))) {
          if (this.isImplicitOctalLiteral()) {
            return this.scanOctalLiteral(ch, start);
          }
        }
      }

      while (isDecimalDigit(this.source.charCodeAt(this.index))) {
        num += this.source[this.index++];
      }
      ch = this.source[this.index];
    }

    if (ch === '.') {
      num += this.source[this.index++];
      while (isDecimalDigit(this.source.charCodeAt(this.index))) {
        num += this.source[this.index++];
      }
      ch = this.source[this.index];
    }

    if (ch === 'e' || ch === 'E') {
      num += this.source[this.index++];

      ch = this.source[this.index];
      if (ch === '+' || ch === '-') {
        num += this.source[this.index++];
      }
      if (isDecimalDigit(this.source.charCodeAt(this.index))) {
        while (isDecimalDigit(this.source.charCodeAt(this.index))) {
          num += this.source[this.index++];
        }
      } else {
        // this.throwUnexpectedToken();
      }
    }

    if (isIdentifierStart(this.source.charCodeAt(this.index))) {
      // this.throwUnexpectedToken();
    }

    return {
      type: Token.NumericLiteral,
      value: parseFloat(num),
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  private octalToDecimal(ch: string) {
    // \0 is not octal escape sequence
    let octal = (ch !== '0');
    let code = this.octalValue(ch);

    if (!this.eof() && isOctalDigit(this.source.charCodeAt(this.index))) {
      octal = true;
      code = code * 8 + this.octalValue(this.source[this.index++]);

      // 3 digits are only allowed when string starts
      // with 0, 1, 2, 3
      if ('0123'.indexOf(ch) >= 0 && !this.eof() && isOctalDigit(this.source.charCodeAt(this.index))) {
        code = code * 8 + this.octalValue(this.source[this.index++]);
      }
    }

    return {
      code: code,
      octal: octal
    };
  }

  private scanStringLiteral(): RawToken {
    const start = this.index;
    let quote = this.source[start];
    // assert((quote === '\'' || quote === '"'),
    //   'String literal must starts with a quote');

    ++this.index;
    let octal = false;
    let str = '';

    while (!this.eof()) {
      let ch = this.source[this.index++];

      if (ch === quote) {
        quote = '';
        break;
      } else if (ch === '\\') {
        ch = this.source[this.index++];
        if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
          switch (ch) {
            case 'u':
              if (this.source[this.index] === '{') {
                ++this.index;
                str += this.scanUnicodeCodePointEscape();
              } else {
                const unescaped = this.scanHexEscape(ch);
                if (unescaped === null) {
                  // this.throwUnexpectedToken();
                }
                str += unescaped;
              }
              break;
            case 'x':
              const unescaped = this.scanHexEscape(ch);
              if (unescaped === null) {
                // this.throwUnexpectedToken(Messages.InvalidHexEscapeSequence);
              }
              str += unescaped;
              break;
            case 'n':
              str += '\n';
              break;
            case 'r':
              str += '\r';
              break;
            case 't':
              str += '\t';
              break;
            case 'b':
              str += '\b';
              break;
            case 'f':
              str += '\f';
              break;
            case 'v':
              str += '\x0B';
              break;
            case '8':
            case '9':
              str += ch;
              // this.tolerateUnexpectedToken();
              break;

            default:
              if (ch && isOctalDigit(ch.charCodeAt(0))) {
                const octToDec = this.octalToDecimal(ch);

                octal = octToDec.octal || octal;
                str += String.fromCharCode(octToDec.code);
              } else {
                str += ch;
              }
              break;
          }
        } else {
          ++this.lineNumber;
          if (ch === '\r' && this.source[this.index] === '\n') {
            ++this.index;
          }
          this.lineStart = this.index;
        }
      } else if (isLineTerminator(ch.charCodeAt(0))) {
        break;
      } else {
        str += ch;
      }
    }

    if (quote !== '') {
      this.index = start;
      // this.throwUnexpectedToken();
    }

    return {
      type: Token.StringLiteral,
      value: str,
      octal: octal,
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: start,
      end: this.index
    };
  }

  public lex(): RawToken {
    if (this.eof()) {
      return {
        type: Token.EOF,
        value: '',
        lineNumber: this.lineNumber,
        lineStart: this.lineStart,
        start: this.index,
        end: this.index
      };
    }

    const cp = this.source.charCodeAt(this.index);

    if (isIdentifierStart(cp)) {
      return this.scanIdentifier();
    }

    // Very common: ( and ) and ;
    if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
      return this.scanPunctuator();
    }

    // String literal starts with single quote (U+0027) or double quote (U+0022).
    if (cp === 0x27 || cp === 0x22) {
      return this.scanStringLiteral();
    }

    // Dot (.) U+002E can also start a floating-point number, hence the need
    // to check the next character.
    if (cp === 0x2E) {
      if (isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
        return this.scanNumericLiteral();
      }
      return this.scanPunctuator();
    }

    if (isDecimalDigit(cp)) {
      return this.scanNumericLiteral();
    }

    // Possible identifier start in a surrogate pair.
    if (cp >= 0xD800 && cp < 0xDFFF) {
      if (isIdentifierStart(this.codePointAt(this.index))) {
        return this.scanIdentifier();
      }
    }

    return this.scanPunctuator();
  }


}
