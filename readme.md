# Quntem Grid

Quntem Grid is a fleet management system for thetaOS devices.

## Setup

### Add App and Users

1. Ensure you have a tenant on KeyStone, and are signed in as an admin on that tenant
2. Go to https://grid.qplus.cloud
3. Click on "Get Started"
4. Click "Aquire App"
5. click "apps" from the KeyStone admin center
6. click "Quntem Grid", and enter the username of a user on your tenant
7. click the user, and then repeat the process for each user on your tenant who will be using the app
8. go back to https://grid.qplus.cloud
9. click "Log In"

### Add Devices

10. go to the releases section of this github repository
11. download the latest release of ThetaOS
12. flash the release to a usb drive
13. insert the usb drive into a laptop
14. (because of a bug in thetaOS, you must open a terminal, close the installer, and quickly run "sudo calamares" in the terminal)
15. go through the calamares installer
16. log in to the device
17. on your main device, go back to https://grid.qplus.cloud
18. click "Add Device" in the top right
19. enter a name and display name for the device
20. click "Add"
21. click the device, and then copy the device id, device token into the window that opened on the thetaOS device
22. enter the server url as https://gridbackend.qplus.cloud
23. click "Add device" on the thetaOS device

### Create Groups

24. go to https://grid.qplus.cloud
25. click "Groups" in the top right
26. click "Add Group"
27. enter a name and display name for the group
28. click "Create"
29. click the group, and type in the name of the device you want to add to the group
30. click the device name to add it to the group
31. repeat step 29 and 30 for each device you want to add to the group

### Create Policies

32. go to https://grid.qplus.cloud
33. click "Policies" in the top right
34. click "Add Policy"
35. enter a name and description for the policy
36. enter a policy type and value - you can find a list of policy types and values in the [policy types](#policy-types) section
37. select the group that this policy should apply to
38. click "Create"

### Assign Apps

39. go to https://grid.qplus.cloud
40. click "Apps" in the sidebar
41. find the app you want to assign
42. click the app in the list
43. click "Add to group"
44. select the group that this app should be assigned to
45. click "add"

## Policy Types

### 1. Desktop Policies
- **Type**: `desktop.wallpaper`
- **Description**: Sets the desktop wallpaper
- **Schema**:
  ```json
  {
      "url": "string",
      "id": "string",
      "type": "string"
  }
  ```
  - `url`: URL of the wallpaper image
  - `id`: Unique identifier for the wallpaper
  - `type`: File extension of the image (e.g., "jpg", "png")

### 2. Shell Policies

#### shell.pinned
- **Type**: `shell.pinned`
- **Description**: Sets the pinned applications in the dock/launcher
- **Schema**:
  ```json
  {
      "apps": ["app1.desktop", "app2.desktop"]
  }
  ```
  - `apps`: Array of desktop file names to pin

#### shell.clockFormat
- **Type**: `shell.clockFormat`
- **Description**: Sets the clock format in the top bar
- **Schema**:
  ```json
  {
      "format": "12h"
  }
  ```
  - `format`: Either "12h" or "24h"

#### shell.colorScheme
- **Type**: `shell.colorScheme`
- **Description**: Sets the system color scheme (light/dark)
- **Schema**:
  ```json
  {
      "colorScheme": "prefer-dark"
  }
  ```
  - `colorScheme`: Either "prefer-dark" or "default"

### 3. Command Policies
- **Type**: `command.run`
- **Description**: Executes a system command
- **Schema**:
  ```json
  {
      "command": "string"
  }
  ```
  - `command`: The system command to execute






