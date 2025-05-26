# API
- **GET /**

- **GET /books**
- **GET /books/{id}**
- **GET /books/{id}/reviews**

- **GET /authors**
- **GET /authors/{name}**

# Benchmark
[Bun](https://bun.sh) is required for scripting.

[Hyperfine](https://github.com/sharkdp/hyperfine) is required for startup benchmarking.

Install all dependencies in root directory and [bench](..) directory then run:
```sh
# Setup DB and bundle files
bun setup

# Run performance bench
bun perf

# Run startup bench
bun startup
```

# Goals
- Performance benchmark ensures `@mapl/web` is reaching the expected performance.
- Startup benchmark checks whether `@mapl/web` is spending too much time for compilation.
