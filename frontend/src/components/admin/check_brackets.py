
import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    brackets = {')': '(', '}': '{', ']': '['}
    line = 1
    col = 1
    
    for char in content:
        if char == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        if char in '({[':
            stack.append((char, line, col))
        elif char in ')}]':
            if not stack:
                print(f"Unbalanced {char} at line {line}, col {col}")
                return
            top, l, c = stack.pop()
            if top != brackets[char]:
                print(f"Mismatch: {top} from line {l} with {char} at line {line}, col {col}")
                return
    
    if stack:
        for char, l, c in stack:
            print(f"Unclosed {char} from line {l}, col {c}")
    else:
        print("Brackets are balanced")

if __name__ == "__main__":
    check_balance(sys.argv[1])
