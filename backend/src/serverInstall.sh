#!/bin/bash

if ! rustc --version &>/dev/null; then
    echo "Rust is not installed. Proceeding to install rust."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    if ! rustc --version &>/dev/null; then
        echo "Rust installation failed. Exiting."
        exit 1
    fi
else
    echo "Rust is already installed. You now can start the server."
fi