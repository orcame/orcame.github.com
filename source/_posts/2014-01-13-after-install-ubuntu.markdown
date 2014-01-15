---
layout: post
title: "又折腾Linux系统"
date: 2014-01-13 20:42
comments: true
categories: linux
keywords: ubuntu qq alt tab broadcom nvidia gnome
description: the things need to do after install ubuntu
---

最近手痒，mint主题换过之后总是各种问题不断，换回默认的主题又看着那些个方块疙瘩图标实在是碍眼，终于忍不住动手了。

##Fedora
先是安装了fedora，fedora(gnome)界面简简单单，是我喜欢的风格，只是那个terminal不能背景透明真是很坑爹的(这个要怪gnome的)，非常不方便。  
先来说说broadcom驱动的安装，网上有很多这个教程，均以失败告终。还是官方的比较靠谱，找到这个[下载链接](http://zh-cn.broadcom.com/support/802.11/linux_sta.php)，安装方法在README里面。简单来讲，有两种方法

<!--more-->

1. 通过源文件安装
	这种方法比较繁琐，在上面链接中的[README](http://zh-cn.broadcom.com/docs/linux_sta/README.txt)里面有安装过程的说明，如果是和我一样linux小白的话，一定要认真阅读。
2. 通过yum安装
	这种方法就比较人性咯，在上面的[README](http://zh-cn.broadcom.com/docs/linux_sta/README.txt)里面也是有提及到的，这里也贴出来供欣赏

		su -c 'rpm -Uvh 
		http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-stable.noarch.rpm 
		http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-stable.noarch.rpm'
		
		su -
		yum update //在这一步的时候总是提示一个错误，说xxx不是xxxx或者没有menifest文件，大概是这个，忘了具体是什么了。这会导致下一个命令找不到kmod-wl，多试几次yum update后，突然成功了。这东西太脆弱！
		yum install kmod-wl

再说说显卡驱动的安装，这个总体来说比较折腾了，我按照这个[博客](http://blog.csdn.net/uuleaf/article/details/7637341)的方法安装成功了。

##Ubuntu
严重的强迫症患者就是贱毛病多的，终于还是无法忍受那个不透明的终端了，虽然用的也不多，而且很怀念ubuntu那个经典的主题，最后还是决定换回Ubuntu（12.04）了。  
对于初学者来讲，Ubuntu的确是很方便的，无线和显卡驱动起码不用太费心了。
###换主题
Unity也许很优秀，但就是看不惯，个人觉得巨难用无比，那么第一步当然是切换回gnome classic主题
	sudo apt-get install gnome-panel
千万别运行那个
	sudo apt-get install gnome-shell
这个家伙会装上那个巨丑无比的gnome最新版的，真的好丑。
装上gnome-panel之后，就可以在登陆界面选择了，怎么选就不解释了。

###sogou输入法
先删除ibus
	sudo apt-get remove ibus
卸载依赖
	sudo apt-get autoremove
安装输入法
	sudo add-apt-repository ppa:fcitx-team/nightly
	sudo apt-get update
	sudo apt-get install fcitx-sogoupinyin
剩下的找到fcitx配置，修改当前配置就好了，以您的智慧一看便懂了，友情提示，千万记得将换页修改为`,`和`.`  
全部搞定只有注销重新登录或者重启一次就可以用了。

###QQ
以前一直用[lwqq](https://github.com/xiehuc/pidgin-lwqq),这个还是很不错的。这个[官方链接](https://github.com/xiehuc/pidgin-lwqq)里面只给出了通过源码的方式安装，并不是很方便，而且通过这种方式，我编译就没有通过。采用这个[链接](https://github.com/xiehuc/pidgin-lwqq/wiki/Install-On-Linux)给出的方法，安装成功
	$ sudo add-apt-repository ppa:lainme/pidgin-lwqq
	$ sudo apt-get update
	$ sudo apt-get install pidgin-lwqq
###ALT+TAB
这是一个老问题了，切换到gnome桌面环境的Ubuntu12.04 Alt+Tap组合键失效了，这玩笑开大了，还得了了。
解决方法在[这里](https://bugs.launchpad.net/ubuntu/+source/compiz/+bug/971051),贴出来
	1. Install packages:
  	sudo apt-get install compiz-plugins compizconfig-settings-manager
	2. Run "ccsm"
	3. Scroll down to Window Management and enable (tick) "Application Switcher".



---
就先写这么多了，以后再贴。
