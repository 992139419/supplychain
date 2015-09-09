#!/bin/sh

echo "Deploy beign"
cd /root/youni
git stash
git pull origin master
echo "Deploy success"
echo ""



