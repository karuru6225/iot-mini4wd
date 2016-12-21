#!/bin/bash

echo "nopull" > /sys/kernel/debug/gpio_debug/gpio19/current_pullmode
echo "nopull" > /sys/kernel/debug/gpio_debug/gpio20/current_pullmode
echo "nopull" > /sys/kernel/debug/gpio_debug/gpio27/current_pullmode
echo "nopull" > /sys/kernel/debug/gpio_debug/gpio28/current_pullmode
echo gpio19
cat /sys/kernel/debug/gpio_debug/gpio19/current_pullmode
echo gpio20
cat /sys/kernel/debug/gpio_debug/gpio20/current_pullmode
echo gpio27
cat /sys/kernel/debug/gpio_debug/gpio27/current_pullmode
echo gpio28
cat /sys/kernel/debug/gpio_debug/gpio28/current_pullmode

#cd `dirname $0`
#node dist/index.js 
#while :
#do
#  node dist/index.js --no-calibration
#done
