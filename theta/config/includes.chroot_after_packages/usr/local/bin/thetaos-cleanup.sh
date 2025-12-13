#!/bin/bash
# Remove live-only files
rm -rf /etc/live
rm -rf /usr/bin/calamares /usr/share/calamares

apt remove --purge calamares

# Create initial setup user
useradd -m -s /bin/bash theta-initial-setup-user
echo "theta-initial-setup-user:init-setup-user" | chpasswd

# Configure GDM Autologin
cat <<EOF > /etc/gdm3/daemon.conf
[daemon]
AutomaticLoginEnable=True
AutomaticLogin=theta-initial-setup-user
EOF

# Grant sudo privileges
cat <<EOF > /etc/sudoers.d/theta-initial-setup-user
theta-initial-setup-user ALL=(ALL) NOPASSWD:ALL
EOF
