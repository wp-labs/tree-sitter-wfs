# tree-sitter-wfs

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for **WFS (Window Field Schema)** — a declarative language for defining window-based data stream schemas with typed fields and time-based aggregation.

## Overview

WFS defines named window schemas that specify how data streams are structured, which time field drives the window, the window duration, and the typed fields within each window. It is used in stream processing systems to declare the shape and configuration of windowed data.

## Language Structure

A WFS file contains one or more `window` declarations:

```wfs
window my_window {
    stream = "source_stream"
    time = timestamp
    over = 5m

    fields {
        src_ip : ip
        username : chars
        bytes : digit
    }
}
```

## Language Features

### Window Declaration

The top-level construct defining a named window schema:

```wfs
window auth_events {
    stream = "auth_log"
    time = event_time
    over = 10m

    fields {
        src_ip : ip
        dst_ip : ip
        username : chars
        status : chars
        latency : float
    }
}
```

### Window Attributes

#### Stream

Bind a window to one or more data streams:

```wfs
// Single stream
stream = "auth_log"

// Multiple streams
stream = ["auth_log", "sso_log", "vpn_log"]
```

#### Time

Specify the field used as the time reference for windowing:

```wfs
time = event_time
time = timestamp
```

#### Over

Set the window duration, or `0` for no windowing:

```wfs
over = 5m      // 5 minutes
over = 1h      // 1 hour
over = 30s     // 30 seconds
over = 1d      // 1 day
over = 0       // no window (unbounded)
```

Duration units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days).

### Fields Block

Declare typed fields within the window:

```wfs
fields {
    src_ip : ip
    username : chars
    bytes_sent : digit
    ratio : float
    is_active : bool
    login_time : time
    mac_addr : hex
    tags : array/chars
    scores : array/digit
}
```

### Field Names

Three forms of field names are supported:

```wfs
fields {
    // Simple identifier
    username : chars

    // Dotted path (nested fields)
    http.request.method : chars
    user.info.name : chars

    // Quoted identifier (special characters)
    `user-agent` : chars
    `Content-Type` : chars
}
```

### Type System

**Base types:**

| Type | Description |
|------|-------------|
| `chars` | String / text |
| `digit` | Integer number |
| `float` | Floating-point number |
| `bool` | Boolean (true/false) |
| `time` | Timestamp |
| `ip` | IP address |
| `hex` | Hexadecimal value |

**Array types:**

Prefix any base type with `array/` to declare an array:

```wfs
tags : array/chars
ports : array/digit
addresses : array/ip
```

### Comments

Line comments with `//`:

```wfs
// This is a comment
window example {
    stream = "data"   // inline comment
    time = ts
    over = 5m

    fields {
        // Network fields
        src_ip : ip
        dst_ip : ip
    }
}
```

## Full Example

```wfs
// Authentication event window
window auth_events {
    stream = ["auth_log", "sso_log"]
    time = event_time
    over = 10m

    fields {
        src_ip : ip
        dst_ip : ip
        username : chars
        status : chars
        method : chars
        latency : float
        retry_count : digit
        success : bool
        login_time : time
        session_id : hex
        roles : array/chars
    }
}

// Network traffic window (no time bound)
window net_traffic {
    stream = "netflow"
    time = timestamp
    over = 0

    fields {
        src_ip : ip
        dst_ip : ip
        http.request.method : chars
        http.response.status : digit
        `user-agent` : chars
        bytes_in : digit
        bytes_out : digit
        ports : array/digit
    }
}
```

## Usage

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter = ">=0.22.6"
tree-sitter-wfs = "0.0.1"
```

```rust
let language = tree_sitter_wfs::language();
let mut parser = tree_sitter::Parser::new();
parser.set_language(&language).unwrap();

let source = r#"window example {
    stream = "data"
    time = ts
    over = 5m
    fields {
        src_ip : ip
        name : chars
    }
}"#;
let tree = parser.parse(source, None).unwrap();
println!("{}", tree.root_node().to_sexp());
```

### Node.js

```javascript
const Parser = require("tree-sitter");
const WFS = require("tree-sitter-wfs");

const parser = new Parser();
parser.setLanguage(WFS);

const tree = parser.parse(`window example {
    stream = "data"
    time = ts
    over = 5m
    fields {
        src_ip : ip
        name : chars
    }
}`);
console.log(tree.rootNode.toString());
```

### Python

```python
import tree_sitter_wfs

language = tree_sitter_wfs.language()
```

### Go

```go
import tree_sitter_wfs "github.com/tree-sitter/tree-sitter-wfs"

language := tree_sitter.NewLanguage(tree_sitter_wfs.Language())
```

### Swift

Add via Swift Package Manager using `Package.swift`.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for `tree-sitter-cli`)
- [Rust toolchain](https://rustup.rs/) (for building the Rust binding)

### Building

```bash
# Install dependencies
npm install

# Generate the parser from grammar.js
npx tree-sitter generate

# Run tests
npx tree-sitter test

# Build the Rust binding
cargo build

# Run Rust tests
cargo test

# Build C library
make
```

### Project Structure

```
tree-sitter-wfs/
├── grammar.js              # Grammar definition
├── bindings/
│   ├── rust/                # Rust binding
│   ├── node/                # Node.js binding
│   ├── python/              # Python binding
│   ├── go/                  # Go binding
│   ├── c/                   # C header and pkg-config
│   └── swift/               # Swift binding
├── src/
│   ├── parser.c             # Generated parser
│   ├── grammar.json         # Generated grammar schema
│   └── node-types.json      # AST node type definitions
├── Cargo.toml               # Rust package manifest
├── package.json             # Node.js package manifest
├── pyproject.toml           # Python package manifest
├── Package.swift            # Swift package manifest
└── Makefile                 # C library build rules
```

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
