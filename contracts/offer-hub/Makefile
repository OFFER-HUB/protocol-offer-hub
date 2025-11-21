.PHONY: build test clean optimize install-deps check fmt

# Build the contract
build:
	cargo build --target wasm32v1-none --release

# Run all tests (uses native target, not WASM)
test:
	cargo test

# Run tests with output
test-verbose:
	cargo test -- --nocapture

# Clean build artifacts
clean:
	cargo clean

# Optimize the WASM file
optimize:
	stellar contract optimize --wasm target/wasm32v1-none/release/offer_hub.wasm

# Install dependencies
install-deps:
	rustup target add wasm32v1-none

# Check code without building
check:
	cargo check --target wasm32v1-none

# Format code
fmt:
	cargo fmt

# Lint code
lint:
	cargo clippy --target wasm32v1-none -- -D warnings

# Full build and test
all: test build

# Build and optimize for production
release: test build optimize

