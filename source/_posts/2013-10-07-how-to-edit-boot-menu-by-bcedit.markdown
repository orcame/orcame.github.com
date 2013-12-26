---
layout: post
title: "how to edit boot menu by bcedit"
date: 2013-10-07 19:51
comments: true
categories: howto
keywords: boot menu, bcedit
description: how to edit boot menu by bcedit
---

Copy your vm file(*.vhd for example) to a folder, D:\boot eg.

Open cmd as administrator

```bat command line script
rem {current} is a identifier id. can also specifier the identifier id. This is used to backup the {current} setting, ignore it if you dont want. 
rem **strongly recommend**
bcdedit /copy {current} /d "current_backup"  

rem set the device(the vhd file)
bcdedit /set {current} device vhd=[d:]\vhd path to file
rem bcdedit /set {current} device vhd=[d:]\boot\xxxx.vhd for example.

rem set the osdevice(same path of the device)
bcdedit /set {current} osdevice vhd=[d:]\vhd path to file

rem set the default boot item(ignore this if you dont want make the new system as the default one)
bcdedit /set {bootmgr} default {current} //guid.

```
reboot os and enjoy the new system.