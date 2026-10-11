#!/usr/bin/env bash
# ==============================================================================
# A6 Part 3: Cross-Language Test Runner Script
# Executes deterministic pattern test suites across available runtimes.
# Missing toolchains are marked SKIPPED, not PASS.
# ==============================================================================

set -e

echo "=== [A6 Case Study] Running Part 3 Cross-Language Pattern Test Suite ==="

# 1. JavaScript (Node.js)
if command -v node >/dev/null 2>&1; then
    echo "--> Running JavaScript tests via Node.js..."
    node A6/Part3/test-cases/test_patterns.js
else
    echo "--> [SKIPPED] Node.js not detected in PATH."
fi

# 2. Python
if command -v python >/dev/null 2>&1; then
    echo "--> Running Python tests..."
    python A6/Part3/test-cases/test_patterns.py
elif command -v python3 >/dev/null 2>&1; then
    echo "--> Running Python tests via python3..."
    python3 A6/Part3/test-cases/test_patterns.py
else
    echo "--> [SKIPPED] Python not detected in PATH."
fi

# 3. Java
if command -v javac >/dev/null 2>&1; then
    echo "--> Compiling and running Java pattern implementations..."
    javac A6/Part3/state/java/DriverState.java
    javac A6/Part3/strategy/java/PricingStrategy.java
    javac A6/Part3/observer/java/RideCancellationObserver.java
    java -cp A6/Part3/state/java DriverState
    java -cp A6/Part3/strategy/java PricingStrategy
    java -cp A6/Part3/observer/java RideCancellationObserver

else
    echo "--> [SKIPPED] JDK (javac) not detected in PATH."
fi

# 4. C++
if command -v g++ >/dev/null 2>&1; then
    echo "--> Compiling and running C++ pattern implementations..."
    g++ -std=c++17 A6/Part3/state/cpp/driver_state.cpp -o A6/Part3/state/cpp/driver_state.out
    ./A6/Part3/state/cpp/driver_state.out
else
    echo "--> [SKIPPED] C++ compiler (g++/clang++) not detected in PATH."
fi

echo "=== [A6 Case Study] Cross-Language Run Complete ==="
