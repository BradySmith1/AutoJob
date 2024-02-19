#!/bin/bash

# Check if mongoDB is running
# WARNING: This script will not work if mongoDB is not installed on the local machine
nc -zvv localhost 27017 2>/dev/null

if [ $? -eq 0 ]; then
    echo "MongoDB is running"
else
    echo "MongoDB is not running"
    exit 1
fi
