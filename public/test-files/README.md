# Test Files

This directory contains binary test files used for network speed testing in the NetPulse application.

## Files:
- `1kb.bin` - 1 KB test file for basic connectivity tests
- `10kb.bin` - 10 KB test file for small file transfer tests  
- `100kb.bin` - 100 KB test file for medium file transfer tests

## Usage:
These files are used by the network testing services to measure download speeds and latency. The application downloads these files to calculate network performance metrics.

## Note:
For production deployments requiring larger test files, consider:
1. Generating test files dynamically on the server
2. Using a CDN to serve larger test files
3. Creating test files on-demand based on the test requirements

The current files are kept small to maintain a reasonable repository size while still providing functional testing capabilities.
