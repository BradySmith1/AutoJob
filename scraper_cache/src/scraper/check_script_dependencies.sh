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
    echo "selenium is installed. Proceeding..."
fi

if ! google-chrome --version &>/dev/null; then
    echo "Google Chrome is not installed. Installing now..."
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt -f install ./google-chrome-stable_current_amd64.deb
    rm google-chrome-stable_current_amd64.deb
else
    echo "Google Chrome is installed. Starting Server."
fi
