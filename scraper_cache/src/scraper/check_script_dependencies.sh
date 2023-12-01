#!/bin/bash

# This script is used to check for updates for the dependencies in the script.
if ! pip show beautifulsoup4 &>/dev/null; then
    echo "beautifulsoup4 is not installed. Installing now..."
    pip install beautifulsoup4
else
    echo "beautifulsoup4 is installed. Proceeding..."
fi

if ! pip show selenium &>/dev/null; then
    echo "selenium is not installed. Installing now..."
    pip install selenium
else
    echo "selenium is installed. Starting Server."
fi
