---
layout: post
title: 如何在多台电脑上使用Octopress写博客
date: 2013-12-26 13:56
comments: true
categories: howto
---
英文好的，请直接猛击[这里](http://blog.zerosharp.com/clone-your-octopress-to-blog-from-two-places/)。英文不好的，就听我啰嗦几句。

先来讲讲基础知识，我们需要有两个branch，一个叫`master`，这个是默认的，不能改，被存储在blog根目录的`_deploy`文件夹下，是用来存放生成好的blog站点文件的。另一个叫`source`(名字可以自己定义，此文中指定为*source*),是用来存放markdown源文件，theme，plugin等用于生成blog所需要的所有文件的。

<!--more-->

如果你是按照[这个](http://www.orcame.com/blog/2013/03/02/hello-git-world/)方式创建的博客，那么你远端是没有`source`分支的(如果远端已经创建`source分`支,请略过)。首先需要创建一个`source`分支，在本地blog根目录下执行

	git branch source	//创建本地source分支
	git checkout source	//切换本地分支到source
	git add --all			//将所有文件add到source分支
	git commit -m "init"	//commit
	git push origin source	//将source分支push到服务器

这样便将本地所有源文件(除了`_deploy`文件夹下的内容)push到远端的`source`分支了

换一台电脑，将远端`source`分支clone到本地
	git clone -b source git@github.com:xxxxx
可以发现，在blog根目录中`_deploy`文件夹(可能没有)是空的(如果不是空的，请清空)，下一步是将远端`master`分支clone到本地的_deploy文件夹
	git clone -b master git@github.com:xxxxx _deploy
然后需要做一些安装配置的步骤
	gem install bundler
	bundle install
接下来`rake generate`就可以生成blog文件了。

需要注意的是，做完任何更改后（例如新增了一篇文章），需要提交到`source`分支
	git add .
	git commit -am "Some comment here." 
	git push origin source  # update the remote source branch 
然后`rake deploy`来发布blog。

当切换到另外一台电脑时候，同样需要把远端`source`和`master`分支的新内容pull到本地
	cd octopress
	git pull origin source  # update the local source branch
	cd ./_deploy
	git pull origin master  # update the local master branch

总结起来就是:  
1. 从远端`source`和`master`同步数据  
2. 写文章（或其他改动，例如更改theme）  
3. push到远端`source`分支  
4. `rake deploy`（相当于push到远端`master`分支）  