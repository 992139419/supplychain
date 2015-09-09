#!/bin/sh
fswatch -o /Users/Hades/Documents/GitProject/WxRestaurant/server | xargs -n1  /Users/Hades/Documents/GitProject/WxRestaurant/rsync.sh
echo "开始同步文件..."