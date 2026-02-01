#!/bin/bash

# Start Rails backend
cd /Users/adhikarirabin/Desktop/softlearn/backend

# Set up environment variables
export LDFLAGS="-L/opt/homebrew/opt/libpq/lib"
export CPPFLAGS="-I/opt/homebrew/opt/libpq/include"
export PKG_CONFIG_PATH="/opt/homebrew/opt/libpq/lib/pkgconfig"

# Initialize rbenv
eval "$(rbenv init -)"

# Start Rails server
bundle exec rails s -b 0.0.0.0 -p 3000
