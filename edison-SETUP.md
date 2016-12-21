## セットアップPC側
- J3にUSB MicroBを接続
- J16にもUSB MicroBを接続
- iot-devkit-prof-dev-image-edison-20160606.zip をダウンロード＆解凍
- `$ sudo brew install dfu-util coreutils gnu-getopt`
- `$ cd iot-devkit-prof-dev-image-edison-20160606`
- `$ sudo cu -s 115200 -l /dev/cu.usbserial-A502OQ0D` でedisonに接続
- `$ ./flashall.sh`
- なんか途中で、`poweroff` と 手動で電源スイッチを入れる必要があった？

## セットアップEdison側
```
configure_edison --setup
timedatectl set-timezone Asia/Tokyo
echo SystemMaxUse=20M >> /etc/systemd/journald.conf
chsh -s /bin/bash
cat <<EOT > ~/.bash_profile
if [ -f ~/.bashrc ]; then
. ~/.bashrc
fi
EOT
cat <<EOT > /etc/systemd/system/startup-scripts.service
[Unit]
Description=StartUp Scripts
After=systemd-user-sessions.service

[Service]
User=root
Type=oneshot
ExecStart=/bin/bash /etc/rc.local

[Install]
WantedBy=multi-user.target
EOT
systemctl enable startup-scripts.service
cat <<EOT > /etc/rc.local
mkdir -p /var/run/vim/{undo,backup}files
EOT
opkg update
opkg upgrade
reboot
```

### Bluetooth テザリング
- `$ systemctl start connman`
- `$ systemctl enable connman`
- `$ rfkill unblock bluetooth`
- `bluetoothctl`
- `[bluetooth]# scan on` 
- `[bluetooth]# discoverable on` 
- `[bluetooth]# devices` 
- `[bluetooth]# pair AB:CD:EF:01:23:45` 
- `[bluetooth]# exit` 
- `$ connmanctl`
- `[connmanctl]# services`
- `[connmanctl]# connect bluetooth_5fed432cba10_abcdef012345`
- `[connmanctl]# config bluetooth_5fed432cba10_abcdef012345 autoconnect yes`
- `[connmanctl]# services`
- `[connmanctl]# exit`
- `$ reboot`
- `$ ip a`
