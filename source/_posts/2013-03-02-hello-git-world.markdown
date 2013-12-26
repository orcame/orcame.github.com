---
layout: post
title: "GitHub + Octopress 搭建个人Blog"
date: 2013-03-02 16:25
comments: true
categories: Others
keywords: octopress,blog
description: How to create octopress blog on github
---
##预备知识  
###Octopress是什么？  
Octopress是一个基于jekyll的博客系统，用Ruby语言编写。Octopress使用静态页面，内容不依赖于数据库，可以使用纯文本，HTML，markdown标记语言写文章。   
<!-- more -->
###jekyll是什么?  
请看[这里](http://jekyllrb.com/)和[这里](http://www.soimort.org/posts/101/)     

###markdown是什么?  
直接看这个[教程][markdown0]或这个[教程+示例][markdown1]  
[markdown0]:http://wowubuntu.com/markdown/  
[markdown1]:http://equation85.github.com/blog/markdown-examples/
###github是什么？  
老兄，你out了，自己Google去(友情提示，为了宇宙的安宁，远离baidu)。  
哦，别忘了注册一个Github的账号，稍后有用。  

##准备环境  
###安装git
到[github](http://www.github.com)上下载[安装包](https://help.github.com/articles/set-up-git)。  
配置github，执行  
	ls ~/.ssh  
若结果为  
	id_rsa	id_rsa.pub  known_hosts
	
执行  
	mv ~/.ssh ~/.ssh_backup  
备份ssh key，执行  
	ssh-keygen -t rsa -C "你的邮箱地址，例如yourname@gmail.com"
	<span color="green">Generating public/private rsa key pair.</span>
	<span color="green">Enter file in which to save the key (/Users/your_user_directory/.ssh/id_rsa):</span>  #此处直接回车   
	
	Enter passphrase (empty for no passphrase):  #此处输入加密串，输入状态是看不到的
	Enter same passphrase again:  #确认刚刚输入的加密串

目前为止，成功生成SSH key，在github上的账号设置中，**添加新的SSH key** ，随便起个名字，将`~/.ssh`目录下的文件`id_rsa.pub`中的内容黏贴到Key域中。  

执行  
	ssh -T git@github.com
会提示
	The authenticity of host 'github.com (207.97.227.243)' can't be established.
	RSA key fingerprint is xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:4d:ae:34:ed:76.
	Are you sure you want to continue connecting (yes/no)?

莫要惊慌，直接输入`yes`

	Hi xxxxx! You've successfully authenticated, but GitHub does not provide shell access.
然后执行 
	git config --global user.name "your_name"
	git config --global user.email "your_mail_box_address"  

到github上面创建一个名称为yourusername.github.com的pro，过程很简单，如不会创建，请google  

大功告成了一小步。

###安装Ruby  
执行`ruby -v`查看系统版本号，如果不低于**1\.9\.3**, 跳过此步骤   
安装步骤请看这个[教程](http://ruby-china.org/wiki/install_ruby_guide),需要**注意**的是，我们要安装的版本为<span style="color:red">1.9.3</span>，将教程中的版本号(如果低于1\.9\.3)替换为1\.9\.3  
安装好Rubby后，执行`rvm use 1.9.3`更改版本号，若出现  
	  
	RVM is not a function, selecting rubies with 'rvm use ...' will not work.
	  
	You need to change your terminal emulator preferences to allow login shell.
	Sometimes it is required to use `/bin/bash --login` as the command.
	Please visit https://rvm.io/integration/gnome-terminal/ for a example.
在终端窗口中 编辑-配置文件首选项-标题和命令-勾选 以登录Shell方式运行命令 ，重启终端后重新执行 `rvm use 1.9.3`，如顺利通过，恭喜你，走出了阿母斯特朗的一小步。
  
###安装Octopress  
	git clone git://github.com/imathis/octopress.git your_blog_folder #获取octopress
	cd your_blog_folder    #如果有提示（提升ruby版本号),yes到底  

	gem install bundler 
	bundle install  

	rake install

###配置Octopress
在your_blog_folder下面有一个`_config.yml`文件，编辑该文件的内容  
	url: yourusername.github.com
	title: your blog title
	subtitle: your blog sub title
	author: your name
	simple_search: http://google.com/search
	description: your blog descritpion.
	......
内容很简单，以您的智慧，想不懂都难，需要注意的是每一项key和value之间的 冒号(:)后面是有一个 **空格** 的，否则会报错。
  
##发表博客
###写文章  
执行
	rake new_post["hello github"] 
会在”your_blog_folder/source/_post”下生成一个xx.makedown文件，用您在[这里][markdown0]或[这里][markdown1]学到的markdown语法来编辑文章就行了。
  
执行  
	rake generate
	rake preview
打开 localhost:4000 预览博客
###发表文章
预览文章没有问题了，执行  
	rake deploy
发布博客，等待一段时间，大概10分钟。打开http://yourusername.github.com 就可以访问刚刚生成的博客了。

###绑定域名
如果需要绑定域名，可以在your_blog_folder目录下面建立一个名称为`CNAME`的文本文件，注意无后缀名，内容为
	www.yourdomain.com
然后在你的域名提供商处将DNS改为`204.232.175.78`(pages.github.com的IP地址，可以ping一下，以获取的内容为准)  
等待一段时间后域名生效，就可以通过www.yourdomain.com访问博客了。（留意您的邮箱，有错误github会提示您的）
