#!/bin/bash
# Only run if the system is installed
if [[ "$USER" != "live" ]]; then
    if [[ -f /etc/live/live-boot-marker ]]; then
        rm -f /etc/live/live-boot-marker
        echo "Deleted /etc/live/live-boot-marker"
    else
        echo "/etc/live/live-boot-marker does not exist"
    fi
else
    echo "Current user is 'live', skipping deletion"
fi

# Check for unsetup-marker first (only if not in live boot)
if [ -f /etc/live/unsetup-marker ] && [ ! -f /etc/live/live-boot-marker ]; then
    cd /grid/theta-setup && exec npm run app
elif [ ! -f /etc/live/live-boot-marker ]; then
    exec /usr/local/bin/node /grid/grid-agent/index.ts
else 
    exec sudo calamares
fi
