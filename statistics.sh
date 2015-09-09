#!/bin/bash
#统计代码函数

function countAll() {
    git log --author=$1 --shortstat --pretty=format:"" | sed /^$/d >.tmp.count
    local insert=0
    local delete=0
    while read line ;do
        current=`echo $line| awk -F',' '{printf $2}' | awk '{printf $1}'`
        if [[ -n $current ]]; then
               insert=`expr $insert + $current`
        fi
           current=`echo $line | sed -n 's/.*, //p' | awk '{printf $1}'`
        if [[ -n $current ]]; then
               delete=`expr $delete + $current`
        fi
       done < .tmp.count
       echo "$1: $insert insertions, $delete deletions"
    rm .tmp.count
}

if [[ ! -n $1 ]] || [[ $1 = "all" ]] ; then
    countAll Slimeria;
    countAll 15202263809@163.com;
    countAll JinJinHrb;
    countAll zhaochunhu;
    countAll liangyifen;
    countAll wanglinhai;
else
    echo "args: all";
fi
